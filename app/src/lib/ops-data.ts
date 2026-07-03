export const deploymentQueue = [
  { name: 'Aurora-7B', target: 'EU West', stage: 'Canary', progress: '76%' },
  { name: 'Cedar-R1', target: 'US East', stage: 'Shadow', progress: '54%' },
  { name: 'Amber-13B', target: 'APAC', stage: 'Approved', progress: '92%' },
];

export const releaseHealth = [
  { label: 'Latency', value: '187 ms', trend: '+4%' },
  { label: 'Hallucination rate', value: '0.8%', trend: '-12%' },
  { label: 'Safety pass rate', value: '99.1%', trend: '+1.2%' },
];

export const observabilitySignals = [
  'Drift score remains within target bands',
  'Inference cache hit rate improved to 86%',
  'Two new evaluation recipes entered QA',
];

export const rolloutChecklist = [
  'Rehearse rollback on the canary cluster',
  'Confirm compliance tags and licensing bundles',
  'Publish a release note for downstream teams',
];
