export type Recipe = {
  id?: number;
  name: string;
  description: string;
  base_model: string;
  flavor_profile: string;
  knowledge_blend: number;
  reasoning_style: number;
  tool_use: number;
  context_length: number;
  safety: number;
  hardware_budget: number;
  deployment_target: string;
  version: number;
  estimated_cost: number;
  created_at?: string;
};

export type KnowledgeSource = {
  id: number;
  name: string;
  domain: string;
  token_count: number;
  quality: string;
};

export type WorkflowJob = {
  id: string | number;
  name: string;
  objective: string;
  status: 'Queued' | 'Running' | 'Completed';
  progress: string;
  stage: string;
  owner: string;
  eta: string;
  gpu_hours?: number;
  created_at?: string;
};

export type Overview = {
  recipes: number;
  models: number;
  knowledge_sources: number;
  jobs: number;
};
