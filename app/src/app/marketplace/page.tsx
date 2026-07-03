'use client';

import { useState } from 'react';
import { Package, Download, Globe, Server, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { DistilleryShell, SectionCard } from '@/components/distillery-shell';
import { publishModel } from '@/lib/api';

export default function MarketplacePage() {
  const [deployingId, setDeployingId] = useState<number | null>(null);
  const [deployedId, setDeployedId] = useState<number | null>(null);

  const [publishingId, setPublishingId] = useState<number | null>(null);
  const [publishedId, setPublishedId] = useState<number | null>(null);

  const handleDeploy = (id: number) => {
    setDeployingId(id);
    setTimeout(() => {
      setDeployingId(null);
      setDeployedId(id);
    }, 2000);
  };

  const handlePublish = async (id: number) => {
    setPublishingId(id);
    try {
      await publishModel(id);
      setPublishedId(id);
    } catch (e) {
      console.error(e);
    } finally {
      setPublishingId(null);
    }
  };

  const models = [
    {
      id: 1,
      name: 'Llama-3-8B-Code-Ninja',
      base: 'meta-llama/Meta-Llama-3-8B',
      dataset: 'task_specific_50k.txt',
      size: '14.2 GB',
      date: 'Just now'
    },
    {
      id: 2,
      name: 'Mistral-7B-Pirate-Tone',
      base: 'mistralai/Mistral-7B-v0.1',
      dataset: 'proof_of_concept_5k.txt',
      size: '13.8 GB',
      date: '2 days ago'
    }
  ];

  return (
    <DistilleryShell
      title="The Cellar (Marketplace)"
      description="View your successfully distilled models. Deploy them locally to an inference endpoint or publish them globally to Hugging Face."
      eyebrow="MODEL DEPLOYMENT"
    >
      <section className="space-y-8">
        
        {models.map((model) => (
          <SectionCard key={model.id} title={model.name} description={`Distilled from ${model.base} • ${model.size}`} icon="package">
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              
              <div className="flex flex-col gap-4 rounded border border-white/5 bg-white/[0.02] p-6">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-[#D4A373]" />
                  <h3 className="text-sm font-medium text-[#FAEDCD]">Publish to Hugging Face</h3>
                </div>
                <p className="text-xs text-[#A9A59A] leading-relaxed">
                  Upload the `.safetensors` weights and tokenizer configuration directly to your Hugging Face Hub account, making it available to the open-source community.
                </p>
                <div className="mt-auto pt-4">
                  {publishedId === model.id ? (
                    <div className="flex items-center gap-2 text-xs font-medium text-green-400">
                      <CheckCircle2 className="h-4 w-4" /> Published Successfully
                    </div>
                  ) : (
                    <button
                      onClick={() => handlePublish(model.id)}
                      disabled={publishingId === model.id}
                      className="flex w-full items-center justify-center gap-2 rounded border border-[#D4A373]/30 bg-transparent py-2 text-xs font-medium text-[#D4A373] transition-colors hover:bg-[#D4A373]/10"
                    >
                      {publishingId === model.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
                      {publishingId === model.id ? 'Publishing via API...' : 'Publish to Hub'}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-4 rounded border border-[#D4A373]/20 bg-[#D4A373]/5 p-6">
                <div className="flex items-center gap-3">
                  <Server className="h-5 w-5 text-[#D4A373]" />
                  <h3 className="text-sm font-medium text-[#FAEDCD]">Local Inference Endpoint</h3>
                </div>
                <p className="text-xs text-[#A9A59A] leading-relaxed">
                  Instantly spin up a local FastAPI / vLLM server to expose this model as a standard REST API endpoint (OpenAI compatible).
                </p>
                <div className="mt-auto pt-4">
                  {deployedId === model.id ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-xs font-medium text-green-400">
                        <CheckCircle2 className="h-4 w-4" /> Deployed Locally
                      </div>
                      <div className="rounded bg-black/50 p-2 text-[10px] font-mono text-[#D4A373]">
                        POST http://localhost:8000/v1/chat/completions
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDeploy(model.id)}
                      disabled={deployingId === model.id}
                      className="flex w-full items-center justify-center gap-2 rounded bg-[#D4A373] py-2 text-xs font-medium text-black transition-colors hover:bg-[#D4A373]/80"
                    >
                      {deployingId === model.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                      {deployingId === model.id ? 'Starting vLLM...' : 'Deploy Endpoint'}
                    </button>
                  )}
                </div>
              </div>

            </div>
          </SectionCard>
        ))}

      </section>
    </DistilleryShell>
  );
}
