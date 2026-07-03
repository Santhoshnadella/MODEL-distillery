# Contributing to Model Distillery (Amber Forge)

First off, thank you for considering contributing to Model Distillery! 🥃 

This project aims to democratize and refine the process of LLM distillation, turning it into a seamless, luxury workflow. We welcome contributions from anyone, whether you're fixing typos, squashing bugs, or adding entirely new ML pipelines.

## 🧠 Core Philosophy
1. **Purity over Complexity:** Keep the UI minimal ("Zen/Distillery" aesthetic) and the logic straightforward.
2. **Async Everything:** ML is slow. The UI should never freeze. Always use Celery/Redis for heavy tasks.
3. **No Hallucinations:** When building new Synthetic Data generators, ensure strict adherence to ground-truth data or constrained Teacher prompts.

---

## 🛠️ Development Setup

To get your local environment set up for development, please refer to the `README.md` for detailed instructions on Docker, FastAPI, Celery, and Next.js initialization.

---

## 📝 Coding Standards & Practices

### Frontend (Next.js & React)
- **Component Structure:** Place reusable UI elements in `app/src/components/`. 
- **Styling:** We use Tailwind CSS exclusively. Stick to the brand palette:
  - Backgrounds: `#0C0B0A` or `#12100E`
  - Text Primary: `#FAEDCD` (Bone)
  - Text Secondary: `#A9A59A` (Ash)
  - Accents: `#D4A373` (Amber)
- **State Management:** Keep it local with React Hooks unless global state is absolutely necessary. Use `lib/api.ts` for backend communication.

### Backend (FastAPI & Python)
- **Type Hinting:** All functions must use Python type hints (e.g., `def create_job(req: Request) -> Response:`).
- **Database (SQLAlchemy):** Never execute raw SQL. Use SQLAlchemy ORM models defined in `schema.sql`.
- **Async Workers (Celery):** Any task that takes longer than 500ms (like Dataset generation or Unsloth training) MUST be offloaded to `celery_worker.py`. 
- **Graceful Fallbacks:** Because not all contributors have NVIDIA GPUs, ML code (like Unsloth integration) must be wrapped in `try/except ImportError` blocks with simulated fallback loops so development can continue on standard laptops.

---

## 🚀 How to Submit a Pull Request (PR)

1. **Fork the Repository:** Create your own branch from `main`.
2. **Create a Feature Branch:** `git checkout -b feature/your-feature-name`
3. **Commit your Changes:** Follow conventional commit messages:
   - `feat: added RAG document ingestion`
   - `fix: resolved Redis WebSocket disconnects`
   - `style: updated button hover states`
4. **Push to your Branch:** `git push origin feature/your-feature-name`
5. **Open a PR:** Go to the main repository and submit your Pull Request. Please include a brief summary of what your PR accomplishes and any necessary screenshots if it's a UI change.

---
*Thank you for helping us craft the future of open-source AI!* 🥃
