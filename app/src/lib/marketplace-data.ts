export type MarketplaceItem = {
  name: string;
  category: string;
  detail: string;
  price: string;
  rating: string;
  availability: string;
};

export const marketplaceItems: MarketplaceItem[] = [
  {
    name: 'Qwen Reasoning Blend',
    category: 'Base Models',
    detail: 'Advanced reasoning with knowledge synthesis',
    price: '$2,400',
    rating: '4.9/5',
    availability: 'Ready',
  },
  {
    name: 'Medical Knowledge Barrel',
    category: 'Knowledge',
    detail: '500K medical research tokens',
    price: '$1,200',
    rating: '4.8/5',
    availability: 'Ready',
  },
  {
    name: 'Code Generation v3',
    category: 'Base Models',
    detail: 'Specialized for software development',
    price: '$1,800',
    rating: '4.7/5',
    availability: 'Ready',
  },
  {
    name: 'Legal Document Analyzer',
    category: 'Knowledge',
    detail: '750K legal and regulatory tokens',
    price: '$3,200',
    rating: '4.9/5',
    availability: 'Ready',
  },
  {
    name: 'Scientific Research Blend',
    category: 'Knowledge',
    detail: '1M research paper tokens',
    price: '$2,800',
    rating: '4.6/5',
    availability: 'Ready',
  },
  {
    name: 'Llama 2 Fine-tuned',
    category: 'Base Models',
    detail: 'Pre-optimized for distillation workflows',
    price: '$1,400',
    rating: '4.5/5',
    availability: 'Ready',
  },
];

export const billingSummary = [
  { label: 'GPU hours', value: '2.4h' },
  { label: 'Storage', value: '4.2 TB' },
  { label: 'Bandwidth', value: '842 GB' },
  { label: 'Marketplace earnings', value: '$1,240' },
];
