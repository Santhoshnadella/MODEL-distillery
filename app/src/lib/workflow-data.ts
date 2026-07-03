export type WorkflowJob = {
  id: string | number;
  name: string;
  objective: string;
  status: 'Queued' | 'Running' | 'Completed';
  progress: string;
  stage: string;
  owner: string;
  eta: string;
};

export const workflowTemplates = [
  { value: 'distill', label: 'Knowledge distillation' },
  { value: 'evaluate', label: 'Evaluation sweep' },
  { value: 'synthetic', label: 'Synthetic data generation' },
];

export const workflowHighlights = [
  { label: 'Active runs', value: '3' },
  { label: 'Average quality', value: '92%' },
  { label: 'Cost efficiency', value: '87%' },
];

export const initialWorkflowJobs: WorkflowJob[] = [
  {
    id: 1,
    name: 'Workflow: Amber Qwen Distillation',
    objective: 'Distill Qwen 14B with knowledge blend',
    status: 'Running',
    progress: '65%',
    stage: 'Fermentation',
    owner: 'You',
    eta: '2h 15m',
  },
  {
    id: 2,
    name: 'Workflow: Legal Model Fine-tune',
    objective: 'Fine-tune with legal knowledge',
    status: 'Running',
    progress: '38%',
    stage: 'Distillation',
    owner: 'Team',
    eta: '4h 30m',
  },
  {
    id: 3,
    name: 'Workflow: Medical Knowledge Blend',
    objective: 'Blend medical dataset into base model',
    status: 'Queued',
    progress: '0%',
    stage: 'Queued',
    owner: 'You',
    eta: '6h 00m',
  },
];
