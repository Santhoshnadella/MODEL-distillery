# Model Distillery (Amber Forge) 🥃

**Model Distillery** is an end-to-end, open-source platform designed to transform the chaotic and highly technical process of Large Language Model (LLM) distillation into a streamlined, luxury craft workflow. 

Just as a master distiller ages raw spirits in charred oak barrels to create a refined bourbon, this platform takes massive, unwieldy "Teacher" models (like 70B parameter giants) and distills their knowledge, reasoning, and tone into hyper-efficient, specialized "Student" models (like 8B parameter models) that can run on consumer hardware.

---

## 🏗️ System Architecture & Design

The platform operates on a robust, decoupled, and async-first architecture designed to handle heavy ML workloads without blocking the UI.

### 1. The Frontend (The Tasting Room)
- **Framework:** Next.js 14 (App Router) with React.
- **Styling:** Tailwind CSS with a strictly enforced "Zen/Distillery" aesthetic (charcoal backgrounds, bone white text, amber `#D4A373` accents, and hairline borders).
- **Animations:** Framer Motion for subtle micro-interactions and smooth page transitions.
- **State Management:** React hooks and context, communicating with the backend via REST and WebSockets.

### 2. The Backend (The Still)
- **Framework:** FastAPI (Python).
- **Database:** SQLite via SQLAlchemy for atomic state tracking of Recipes, Datasets, and Jobs.
- **Message Broker:** Redis handles Pub/Sub channels. When a background ML job is running, it publishes progress updates to Redis, which FastAPI pushes to the frontend via WebSockets in real-time.

### 3. The ML Engine (The Barrels)
- **Orchestration:** Celery background workers process long-running jobs (dataset generation, training).
- **Training Engine:** Direct integration with **Unsloth**, the fastest open-source library for fine-tuning.
- **Hardware Fallback:** Built-in dry-run fallbacks. If the Celery worker does not detect an NVIDIA GPU or the required CUDA libraries, it gracefully simulates the training loop for testing and UI development.

---

## 🔄 Data Flow & Logic Pipeline

The lifecycle of a model in the Distillery follows five distinct stages:

### Phase 1: Synthetic Generation
The user selects a "Distillation Scale" (e.g., *Task-Specific Mastery - 50k Prompts*). 
The UI bypasses standard textarea limitations by injecting massive, pre-bundled prompt packs directly into the backend payload. A Teacher Model (e.g., Llama-3 70B) expands these seed questions into thousands of diverse instruction-response pairs, generating the raw synthetic dataset.

### Phase 2: The Dataset Forge
The generated data is parsed, cleaned, and tokenized. The system calculates token distributions and formats the data into JSONL specifically tailored for the target Student model's chat template.

### Phase 3: The Recipe Builder ("Sealing the Barrel")
The user crafts a "Recipe" by selecting the Base Model (e.g., `unsloth/llama-3-8b-bnb-4bit`), attaching the synthetic dataset, and configuring LoRA (Low-Rank Adaptation) hyperparameters (Rank, Alpha, Dropout). Submitting the recipe queues a Celery job.

### Phase 4: Active Distillation (Unsloth Training)
The Celery worker wakes up, loads the base model into VRAM via `bitsandbytes` 4-bit quantization, attaches the PEFT/LoRA adapters, maps the synthetic dataset, and executes the `SFTTrainer` loop. Loss metrics are published to Redis. The final weights are saved as `.safetensors`.

### Phase 5: The Tasting Room (Evaluation)
The user enters a dual-chat interface to conduct a blind taste test, typing a single prompt and watching both the Teacher and Student models stream responses side-by-side. The dashboard also renders automated benchmark regressions (MMLU, HumanEval) via radar charts to verify the distillation fidelity.

### Phase 6: The Cellar (Marketplace & Deployment)
Finished models are bottled and sent to the Cellar. With a single click, users can publish the `.safetensors` to the Hugging Face Hub, or instantly deploy the model to a local vLLM REST API endpoint for immediate integration into other applications.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- Redis Server (Running locally or via Docker)
- *Optional:* NVIDIA GPU (16GB+ VRAM) for actual Unsloth training.

### Installation

1. **Clone the repo and start Redis:**
   ```bash
   git clone https://github.com/yourusername/model-distillery.git
   cd model-distillery
   docker run -d -p 6379:6379 redis
   ```

2. **Start the FastAPI & Celery Backend:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
   pip install -r requirements.txt
   pip install -r requirements-ml.txt # Optional, for GPU training
   
   # Terminal 1: Start FastAPI
   python -m uvicorn app:app --reload --port 8000
   
   # Terminal 2: Start Celery
   celery -A celery_worker.celery_app worker --loglevel=info
   ```

3. **Start the Next.js Frontend:**
   ```bash
   cd app
   npm install
   npm run dev
   ```

4. Navigate to `http://localhost:3000` to enter the Distillery.

---

## 📸 Automated UI Documentation
This project utilizes a headless **Playwright** automation script (`take_screenshots.py`) that intercepts API calls and automatically generates documentation imagery for the entire platform without requiring a seeded database.

---
*Model Distillery was crafted to prove that complex machine learning orchestration can be packaged into a beautiful, intuitive, and highly functional user experience.*
