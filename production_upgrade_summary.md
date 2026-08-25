# Production‑Ready Upgrade Summary for Model Distillery

## Goal
Transform the prototype into a production‑grade platform that:
1. Implements all **P0** and **P1** must‑fix items (security, core ML loop, observability, cost control).
2. Supports the five core distillation families (black‑box SFT, white‑box KD, Preference/DPO, CoT, Agent‑trace).
3. Provides a **hardware‑abstraction layer** (local, cloud, hybrid) with live cost/latency estimates.
4. Offers export in every target format (safetensors, GGUF, Ollama, vLLM, TensorRT‑LLM, MLX, HF Hub).
5. Delivers a **One‑Click Proven Result** workflow.
6. Introduces high‑impact head‑turner features (Magpie synthetic data, marketplace/leaderboard, premium UI).
7. Ramps the overall score to **> 8/10** across all evaluation dimensions.

---
## Phase Overview (≈ 10 weeks total)
| Phase | Description | Duration | Deliverables |
|------|-------------|----------|--------------|
| **A – Foundations** | DB migration, RBAC, Argon2 security, CI/CD scaffolding. | 1 week | PostgreSQL + Alembic migrations, auth models, Argon2 hashing, GitHub Actions CI. |
| **B – Core Distillation Engine** | Real distillation logic, method enum, FastAPI orchestration. | 2 weeks | `backend/distillation/engine.py`, `config.py`, `/run_distillation` endpoint, unit tests for each method. |
| **C – Hardware Abstraction & Cost** | Abstract providers, cost estimator, UI selector. | 1 week | `hardware/abstraction.py`, provider adapters (RunPod, Modal, …), UI controls with live preview. |
| **D – Observability & Checkpointing** | Prometheus metrics, checkpoint storage, resume logic. | 1 week | `monitoring/metrics.py`, `monitoring/checkpoint.py`, Celery integration, dashboard hooks. |
| **E – One‑Click Proven Result** | End‑to‑end orchestration, evaluation, export, HF publishing, marketplace entry. | 1 week | `oneclick/handler.py`, UI button & progress modal, summary URL. |
| **F – Magpie Synthetic Data** | Self‑instruct data generator, quality filters, UI for prompt packs. | 1 week | `synthesis/magpie.py`, dataset upload UI, filter toggles. |
| **G – Evaluation Suite UI** | Radar charts, side‑by‑side chat, benchmark runners. | 1 week | `evaluation.py`, Chart.js components, API routes. |
| **H – Export System Integration** | Export endpoints for all formats, streaming download. | 1 week | `export/router.py`, format‑specific exporters, HF Hub helper. |
| **I – Marketplace & Leaderboard** | Community recipes, model marketplace, rating system. | 1 week | DB models, CRUD API, gallery UI, install button, leaderboard page. |
| **J – Polish & Docs** | UI refinements, accessibility, performance tweaks, updated docs. | Ongoing | Final visual polish, performance audit, updated `README.md` & `CONTRIBUTING.md`. |

---
## Detailed File‑Level Tasks
### A – Foundations
- **`backend/database.py`** → switch to PostgreSQL connection string.
- Add **Alembic** migrations for all existing tables + new RBAC tables.
- Create **`backend/auth/models.py`** (User, Role, Permission, RolePermission).
- Create **`backend/auth/rbac.py`** with FastAPI dependencies (`has_permission`, `require_role`).
- Update signup/login in `app.py` to use new Argon2 `hash_password` and `verify_password`.
- Add optional refresh‑token endpoint.
- CI: GitHub Actions workflow (`ci.yml`) – lint, type check, pytest, publish to HF on release.

### B – Core Distillation Engine
- New package **`backend/distillation/`** containing:
  - `engine.py` – `DistillationTask` class selecting method via `DistillMethod` enum.
  - `config.py` – dataclasses for method config, hardware target, export target.
  - `evaluation.py` – functions `run_mmlu`, `run_humaneval`, `build_radar`.
  - `export.py` – exporters for safetensors, GGUF, Ollama, vLLM, TensorRT‑LLM, MLX, HF Hub.
- FastAPI route **POST `/run_distillation`** validates payload, creates task, enqueues Celery job.
- Unit tests under `tests/distillation/` for each method using tiny toy models.

### C – Hardware Abstraction
- **`backend/hardware/abstraction.py`**:
  - `HardwareTarget` enum (`LOCAL`, `CLOUD_RUNPOD`, `CLOUD_MODAL`, `HYBRID`).
  - Provider adapters (`runpod_adapter`, `modal_adapter`, `local_adapter`).
  - `estimate_cost(target, seq_len, gpu_hours)` using provider pricing APIs.
- Front‑end UI (`app/src/app/workflows/page.tsx`) – dropdown + live cost preview (calls `/api/hardware/estimate`).

### D – Observability & Checkpointing
- **`backend/monitoring/metrics.py`** – Prometheus counters (`distillation_job_duration_seconds`, `gpu_hours_total`, `cost_usd_total`).
- **`backend/monitoring/checkpoint.py`** – `save_checkpoint`, `load_checkpoint` (S3/Blob).
- Update **`celery_worker.py`** to publish checkpoint progress via Redis/WebSocket and resume on failure.

### E – One‑Click Proven Result
- **`backend/oneclick/handler.py`** orchestrates:
  1. Launch distillation (internal call).
  2. Await completion via Celery result backend.
  3. Run evaluation suite.
  4. Export all formats.
  5. Publish to HF Hub.
  6. Insert marketplace entry.
  7. Return summary JSON with URLs.
- Front‑end: add **“One‑Click Proven Result”** button on main page, modal shows live WebSocket updates, final links.

### F – Magpie Synthetic Data
- **`backend/synthesis/magpie.py`**:
  - Prompt generation using teacher model (vLLM).
  - Filters: toxicity (Perspective API), diversity (cosine similarity), novelty (n‑gram overlap).
  - Save as `synthetic_{ts}.jsonl`.
- UI (`app/src/app/datasets/page.tsx`): controls for pack size (5k/50k/150k), filter toggles, preview sample.

### G – Evaluation Suite UI
- Backend functions (`evaluation.py`) compute MMLU, HumanEval, custom benchmarks, latency, cost.
- Front‑end radar‑chart component (`EvaluationRadar.tsx`) using Chart.js.
- Side‑by‑side chat component (`TastingRoom.tsx`) for blind‑tasting display.

### H – Export System Integration
- **`backend/export/router.py`** routes:
  - `/export/safetensors/{job_id}`
  - `/export/gguf/{job_id}`
  - `/export/ollama/{job_id}`
  - `/export/vllm/{job_id}`
  - `/export/tensorrt/{job_id}`
  - `/export/mlx/{job_id}`
- Each streams the artifact with proper `Content‑Disposition`.
- HF Hub publishing helper (`publish_to_hf(job_id, files, metadata)`).

### I – Marketplace & Leaderboard
- DB models (`backend/marketplace/models.py`): `Recipe`, `ModelEntry`, `Score`, `UserRating`.
- API (`backend/marketplace/router.py`): CRUD for community recipes, upload/publish model entries, submit ratings.
- Front‑end gallery (`app/src/app/marketplace/page.tsx`): card grid, filters, rating stars, “Install” button (downloads & registers model).
- Leaderboard page (`app/src/app/leaderboard/page.tsx`) ranking models by aggregate score.

### J – Polish & Documentation
- Visual audit: ensure all new UI components follow the premium design system (dark mode, glassmorphism, micro‑animations).
- Performance: lazy‑load heavy components, code‑split TSX pages, enable Next.js image optimization.
- Update **`README.md`** – architecture diagram, hardware selection guide, export format matrix, contribution guide for marketplace.
- Update **`CONTRIBUTING.md`** – sections for adding a new distillation method and submitting a recipe.

---
## Verification Plan
| Test Type | Description |
|-----------|-------------|
| **Unit Tests** | Backend functions (engine, hardware adapters, exporters, auth RBAC). |
| **Integration Tests** | Full end‑to‑end run on a tiny model using each distillation method via `/run_distillation`. |
| **Security Tests** | Verify Argon2 password storage, RBAC enforcement, rate limiting, audit‑log entries. |
| **Performance Tests** | Benchmark cost estimator vs. actual provider bill (mocked). |
| **Manual QA** | Deploy staging via Docker Compose, run the One‑Click flow, validate radar charts, export files, HF Hub entry, marketplace listing. |
| **User Acceptance** | External reviewer feedback on UI polish and marketplace experience. |

---
## Open Questions (need your input)
> **[!IMPORTANT]**
> 1. **Cloud Provider Preference** – Which providers should be pre‑integrated (RunPod, Modal, Together, Vast.ai) and do you have API keys for them?
> 2. **Compliance Requirements** – Do we need GDPR/CCPA‑compliant data handling for synthetic datasets?
> 3. **Marketplace Licensing** – Preferred default license for community‑submitted models (Apache 2.0, MIT, Creative‑Commons, etc.)?

---
## Next Steps
1. Confirm the **cloud providers**, any **compliance** constraints, and the **license** you’d like for the marketplace.
2. Once approved, we’ll start with **Phase A – Foundations** (DB migration, RBAC, Argon2 security, CI setup).
3. Subsequent phases will be executed sequentially, with artifacts and progress updates after each week.

*Let me know if any adjustments are required or if you’re ready to give the go‑ahead.*
