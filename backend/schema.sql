CREATE TABLE recipes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  base_model TEXT DEFAULT '',
  flavor_profile TEXT DEFAULT '',
  knowledge_blend INTEGER DEFAULT 0,
  reasoning_style INTEGER DEFAULT 0,
  tool_use INTEGER DEFAULT 0,
  context_length INTEGER DEFAULT 128,
  safety INTEGER DEFAULT 0,
  hardware_budget INTEGER DEFAULT 1,
  deployment_target TEXT DEFAULT '',
  version INTEGER DEFAULT 1,
  estimated_cost REAL DEFAULT 0.0,
  user_id TEXT NOT NULL DEFAULT 'system',
  workspace TEXT DEFAULT 'Amber Forge',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE model_artifacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  version TEXT DEFAULT '1.0',
  family TEXT DEFAULT '',
  downloads INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE knowledge_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  domain TEXT DEFAULT '',
  token_count INTEGER DEFAULT 0,
  quality TEXT DEFAULT 'A'
);

CREATE TABLE distillation_jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  stage TEXT DEFAULT 'Queued',
  progress INTEGER DEFAULT 0,
  gpu_hours REAL DEFAULT 0.0,
  status TEXT DEFAULT 'Queued',
  objective TEXT DEFAULT '',
  owner TEXT DEFAULT 'Team',
  eta TEXT DEFAULT 'TBD',
  user_id TEXT NOT NULL DEFAULT 'system',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT DEFAULT '',
  organization TEXT DEFAULT '',
  workspace TEXT DEFAULT 'Amber Forge',
  role TEXT DEFAULT 'Operator',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE datasets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  source TEXT DEFAULT '',
  token_count INTEGER DEFAULT 0,
  quality TEXT DEFAULT 'A',
  user_id TEXT NOT NULL,
  workspace TEXT DEFAULT 'Amber Forge',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE evaluations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id INTEGER NOT NULL,
  benchmark TEXT DEFAULT '',
  score REAL DEFAULT 0.0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES distillation_jobs(id)
);

CREATE TABLE team_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  workspace TEXT DEFAULT 'Amber Forge',
  role TEXT DEFAULT 'Reviewer',
  joined_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
