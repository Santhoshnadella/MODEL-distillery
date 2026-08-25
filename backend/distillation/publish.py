import os
import logging
try:
    from huggingface_hub import HfApi
except ImportError:
    HfApi = None

logger = logging.getLogger(__name__)

class ModelPublisher:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("HUGGINGFACE_API_KEY")
        self.api = HfApi(token=self.api_key) if HfApi and self.api_key else None

    def push_to_hub(self, repo_id: str, folder_path: str, private: bool = True) -> str:
        """
        Publishes the model weights in folder_path to the Hugging Face Hub.
        """
        if not self.api:
            logger.warning("HuggingFace API key not provided or huggingface_hub not installed. Simulating publish.")
            return f"https://huggingface.co/{repo_id} (Simulated)"
            
        try:
            # Create the repository if it doesn't exist
            self.api.create_repo(repo_id=repo_id, private=private, exist_ok=True)
            
            # Upload the entire folder
            logger.info(f"Uploading model from {folder_path} to {repo_id}...")
            self.api.upload_folder(
                folder_path=folder_path,
                repo_id=repo_id,
                repo_type="model"
            )
            
            url = f"https://huggingface.co/{repo_id}"
            logger.info(f"Successfully published model to {url}")
            return url
            
        except Exception as e:
            logger.error(f"Failed to publish to Hugging Face Hub: {str(e)}")
            raise RuntimeError(f"Publishing failed: {str(e)}")
