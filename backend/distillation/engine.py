import os
import json
import logging
from typing import Dict, Any, Optional
try:
    import torch
    from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments
    from trl import SFTTrainer, DPOTrainer
    from datasets import load_dataset, Dataset
except ImportError:
    pass

logger = logging.getLogger(__name__)

class DistillationTask:
    def __init__(
        self, 
        job_id: str, 
        recipe: Dict[str, Any], 
        dataset_path: str, 
        output_dir: str = "./outputs"
    ):
        self.job_id = job_id
        self.recipe = recipe
        self.dataset_path = dataset_path
        self.output_dir = os.path.join(output_dir, job_id)
        
        # Determine model
        self.model_name = recipe.get("base_model", "TinyLlama/TinyLlama-1.1B-Chat-v1.0")
        self.method = recipe.get("method", "sft").lower()
        self.epochs = recipe.get("epochs", 3)
        self.batch_size = recipe.get("batch_size", 4)
        
        os.makedirs(self.output_dir, exist_ok=True)
        
    def _load_model_and_tokenizer(self):
        logger.info(f"Loading model {self.model_name}")
        tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token
            
        model = AutoModelForCausalLM.from_pretrained(
            self.model_name,
            device_map="auto" if torch.cuda.is_available() else None,
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
        )
        return model, tokenizer

    def _load_dataset(self):
        logger.info(f"Loading dataset from {self.dataset_path}")
        if self.dataset_path.endswith('.jsonl'):
            return load_dataset('json', data_files=self.dataset_path, split='train')
        elif self.dataset_path.endswith('.csv'):
            return load_dataset('csv', data_files=self.dataset_path, split='train')
        else:
            raise ValueError("Unsupported dataset format. Use .jsonl or .csv")

    def run_sft(self, model, tokenizer, dataset):
        logger.info("Starting Supervised Fine-Tuning (SFT)")
        
        training_args = TrainingArguments(
            output_dir=self.output_dir,
            per_device_train_batch_size=self.batch_size,
            num_train_epochs=self.epochs,
            logging_dir=f"{self.output_dir}/logs",
            logging_steps=10,
            save_strategy="epoch",
        )
        
        # Assumes dataset has a 'text' column for SFT
        dataset_text_field = "text" 
        if "prompt" in dataset.column_names and "completion" in dataset.column_names:
             def format_instruction(example):
                 return {"text": f"User: {example['prompt']}\nAssistant: {example['completion']}"}
             dataset = dataset.map(format_instruction)
             
        trainer = SFTTrainer(
            model=model,
            train_dataset=dataset,
            dataset_text_field=dataset_text_field,
            max_seq_length=self.recipe.get("context_length", 2048),
            tokenizer=tokenizer,
            args=training_args,
        )
        
        trainer.train()
        trainer.save_model(self.output_dir)
        logger.info(f"SFT completed. Model saved to {self.output_dir}")
        return self.output_dir
        
    def run_dpo(self, model, tokenizer, dataset):
        logger.info("Starting Direct Preference Optimization (DPO)")
        
        training_args = TrainingArguments(
            output_dir=self.output_dir,
            per_device_train_batch_size=self.batch_size,
            num_train_epochs=self.epochs,
            logging_dir=f"{self.output_dir}/logs",
            logging_steps=10,
            save_strategy="epoch",
        )
        
        if not all(col in dataset.column_names for col in ["prompt", "chosen", "rejected"]):
            raise ValueError("DPO requires 'prompt', 'chosen', and 'rejected' columns in the dataset.")
            
        trainer = DPOTrainer(
            model=model,
            ref_model=None,
            args=training_args,
            beta=0.1,
            train_dataset=dataset,
            tokenizer=tokenizer,
        )
        
        trainer.train()
        trainer.save_model(self.output_dir)
        logger.info(f"DPO completed. Model saved to {self.output_dir}")
        return self.output_dir

    def execute(self) -> str:
        """Main entry point to execute the distillation task."""
        try:
            model, tokenizer = self._load_model_and_tokenizer()
            dataset = self._load_dataset()
            
            if self.method == "sft":
                return self.run_sft(model, tokenizer, dataset)
            elif self.method == "dpo":
                return self.run_dpo(model, tokenizer, dataset)
            else:
                raise ValueError(f"Distillation method '{self.method}' is not supported.")
                
        except Exception as e:
            logger.error(f"Error during distillation execution: {str(e)}")
            raise
