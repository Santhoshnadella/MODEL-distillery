# Day‑wise Breakdown – Production‑Ready Upgrade

**Purpose**: Detailed schedule of what will be coded each day (Mon–Fri) for every week of the 10‑week roadmap.  The schedule assumes a standard 5‑day work week (weekends off) and aligns with the phases described in *next_level.md*.

---

## Week 1 – Phase A: Foundations
| Day | Tasks (what will be added/modified) |
|-----|--------------------------------------|
| **Mon** | Set up PostgreSQL instance (Docker compose). Initialize `alembic` config for migrations. Create empty `backend/alembic/versions` folder. |
| **Tue** | Write Alembic migration to create `users` table (id, email, hashed_password). Add Argon2 password‑hash helper in `backend/auth/security.py`. |
| **Wed** | Add RBAC models: `Role`, `Permission`, `RolePermission` in `backend/auth/models.py`. Create migration for these tables. |
| **Thu** | Extend FastAPI auth routes (`/register`, `/login`) to use Argon2 and store `User` with default `role_id`. Add unit tests for registration/login flow. |
| **Fri** | Set up GitHub Actions CI workflow (`ci.yml`) to run lint, type‑check, and test suite. Verify CI passes locally. |

---

## Week 2 – Phase B: Core Distillation Engine (Part 1)
| Day | Tasks |
|-----|-------|
| **Mon** | Scaffold `backend/distillation/engine.py`. Define `DistillationFamily` enum (BLACKBOX, WHITEBOX, PREFERENCE, COT, AGENT_TRACE). |
| **Tue** | Implement black‑box SFT runner (uses `unsloth` if available, otherwise dummy). Add endpoint `/run_distillation` with payload schema. |
| **Wed** | Implement white‑box KD runner (logit/feature KD). Write unit test for a tiny teacher‑student pair. |
| **Thu** | Implement preference/DPO runner placeholder (calls to `trl` library). Add validation of reward model config. |
| **Fri** | Add basic error handling, logging, and return JSON status. Write integration test covering all families (mocked). |

---

## Week 3 – Phase B: Core Distillation Engine (Part 2)
| Day | Tasks |
|-----|-------|
| **Mon** | Implement CoT/Reasoning‑trace runner (captures intermediate chain‑of‑thought). Add optional `trace` flag in API. |
| **Tue** | Implement agent‑trace distillation runner (captures action‑trace from an OpenAI‑style agent). |
| **Wed** | Consolidate all runners under a single `DistillationTask` class with a `run()` method. |
| **Thu** | Write comprehensive test matrix (parameterized PyTest) for each family using tiny models. |
| **Fri** | Refactor code, add type hints, improve docstrings, run static analysis (mypy, ruff). |

---

## Week 4 – Phase C: Hardware Abstraction & Cost Estimation
| Day | Tasks |
|-----|-------|
| **Mon** | Define `HardwareTarget` enum in `backend/hardware/abstraction.py`. Add stub adapters for `LOCAL` and `CLOUD_RUNPOD`. |
| **Tue** | Implement `run_local()` adapter using Docker runtime. Add unit test that launches a dummy container. |
| **Wed** | Implement `run_cloud_runpod()` adapter (HTTP call to RunPod API, mocked). Add integration test with request‑stubbing. |
| **Thu** | Create cost‑estimation service (`backend/hardware/cost.py`). Load pricing JSON for each provider, expose `estimate_cost(job_config)`.
| **Fri** | Add UI component (`hardware_selector.tsx`) with dropdown and live cost badge; connect to `/api/hardware/estimate`. Write end‑to‑end test using Playwright. |

---

## Week 5 – Phase D: Observability, Checkpointing & Metrics
| Day | Tasks |
|-----|-------|
| **Mon** | Add Prometheus client to `backend/monitoring/metrics.py`. Register counters: `distillation_jobs_total`, `gpu_seconds_total`, `cost_usd_total`. |
| **Tue** | Expose `/metrics` endpoint in FastAPI. Verify Prometheus scrapes locally. |
| **Wed** | Implement checkpoint serializer (`monitoring/checkpoint.py`) that writes intermediate model state to S3 (using `boto3`). |
| **Thu** | Update `DistillationTask.run()` to call checkpoint after each epoch. Add resume logic at start of task. |
| **Fri** | Add WebSocket progress broadcaster (`backend/ws/progress.py`). Front‑end component consumes updates. Write integration test for resume after forced failure. |

---

## Week 6 – Phase E: One‑Click Proven Result
| Day | Tasks |
|-----|-------|
| **Mon** | Scaffold orchestrator (`backend/oneclick/handler.py`). Define pipeline steps: distillation → evaluation → export → publish. |
| **Tue** | Implement step chaining with Celery chords. Add success/failure callbacks. |
| **Wed** | Create UI page `one_click.tsx` with a single button and modal progress bar. Hook button to `/api/oneclick/run`. |
| **Thu** | Implement HF Hub publish step (`backend/exports/hf_publish.py`). Add token handling. |
| **Fri** | Add marketplace entry creation step (`backend/marketplace/create_entry.py`). Write end‑to‑end test that runs the full one‑click flow on a tiny model. |

---

## Week 7 – Phase F: Magpie‑Style Synthetic Data Generation
| Day | Tasks |
|-----|-------|
| **Mon** | Create `backend/synthesis/magpie.py`. Implement prompt generation loop using a teacher model (vLLM). |
| **Tue** | Add filtering functions: toxicity (`perspective-api` stub), diversity (n‑gram overlap), novelty (BLEU against existing data). |
| **Wed** | Write JSONL writer that stores `{prompt, response}` pairs. |
| **Thu** | Build UI component `synthetic_pack.tsx` with size selector (5k/50k/150k) and toggle filters. |
| **Fri** | Write integration test that generates a 5k pack, verifies JSON schema, and stores to S3. |

---

## Week 8 – Phase G: Evaluation Suite UI
| Day | Tasks |
|-----|-------|
| **Mon** | Implement evaluation back‑end (`backend/eval/mmlu.py`, `backend/eval/humaneval.py`). Compute accuracy and runtime. |
| **Tue** | Add latency and cost measurement utilities (`backend/eval/metrics.py`). |
| **Wed** | Create API endpoint `/api/eval/summary` that returns a JSON payload with all metrics. |
| **Thu** | Build front‑end radar‑chart component (`evaluation_chart.tsx`) using Chart.js. Consume `/api/eval/summary`. |
| **Fri** | Implement side‑by‑side chat UI (`tasting_room.tsx`) to compare teacher vs. student outputs for selected prompts. Add unit & UI tests. |

---

## Week 9 – Phase H: Export System Integration
| Day | Tasks |
|-----|-------|
| **Mon** | Scaffold `backend/exports/__init__.py` with dispatcher based on requested format. |
| **Tue** | Implement Safetensors exporter (`exports/safetensors.py`). |
| **Wed** | Implement GGUF/Ollama exporter (`exports/gguf.py`). |
| **Thu** | Implement vLLM, TensorRT‑LLM, MLX exporters (`exports/vllm.py`, etc.). |
| **Fri** | Add streaming response helper, set correct `Content‑Disposition`. Write integration tests for each format (small model). |

---

## Week 10 – Phase I: Marketplace & Leaderboard
| Day | Tasks |
|-----|-------|
| **Mon** | Design DB schema for `Recipe`, `ModelEntry`, `Score`, `UserRating`. Generate Alembic migration. |
| **Tue** | Implement CRUD API (`backend/marketplace/api.py`). Add pagination, filtering by tags. |
| **Wed** | Build front‑end gallery page (`marketplace_gallery.tsx`) with cards, star rating component, and “Install” button. |
| **Thu** | Implement leaderboard endpoint (`/api/leaderboard`) that aggregates scores. Build leaderboard UI (`leaderboard.tsx`). |
| **Fri** | Add community submission flow (upload model files, fill metadata). Write end‑to‑end test for a full recipe submission and rating cycle. |

---

## Weeks 11‑12 – Phase J: Polish, Performance & Documentation
| Day | Tasks |
|-----|-------|
| **Mon** | Perform visual audit: enforce dark‑mode, glassmorphism, micro‑animations across all pages. |
| **Tue** | Optimize bundle splitting (Next.js dynamic imports) and lazy‑load heavy components (evaluation chart, marketplace). |
| **Wed** | Add SEO meta tags, Open Graph data, and structured JSON‑LD for each page. |
| **Thu** | Update `README.md` with architecture diagram, hardware guide, export matrix, and quick‑start script. |
| **Fri** | Extend `CONTRIBUTING.md` with sections: *Add a new distillation method*, *Submit a recipe*, *Run CI locally*. Publish final release notes. |

---

### How to Use This Breakdown
- **Sprint Planning**: Treat each day as a sprint backlog item; the tasks are granular enough for a single developer to complete.
- **Tracking**: Create a JIRA/Linear board with columns *To‑Do → In‑Progress → Done* and copy the daily tasks.
- **Flexibility**: If a day overruns, roll the unfinished sub‑task to the next day; the weekly goal remains the same.
- **Review**: At the end of each week, run the verification plan (unit tests, integration checks, UI smoke tests) before moving to the next phase.

Feel free to adjust any day’s scope or reorder tasks based on team capacity or emerging priorities.
