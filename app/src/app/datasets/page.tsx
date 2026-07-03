'use client';

import { useState, useEffect } from 'react';
import { Database, FileSearch, Upload, CheckCircle2 } from 'lucide-react';
import { DistilleryShell, SectionCard } from '@/components/distillery-shell';
import { getDatasets, uploadDataset } from '@/lib/api';

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      const data = await getDatasets();
      setDatasets(data);
    } catch (error) {
      console.error("Failed to fetch datasets", error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    try {
      const file = e.target.files[0];
      await uploadDataset(file);
      await fetchDatasets();
    } catch (error) {
      console.error("Failed to upload dataset", error);
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset input
    }
  };
  return (
    <DistilleryShell
      title="Curate raw ingredients with absolute precision."
      description="Select, clean, and version your datasets. High-fidelity extraction begins with immaculate ingredients."
      eyebrow="INGREDIENT SOURCING"
    >
      <section className="grid gap-12 xl:grid-cols-[1fr_0.9fr]">
        <SectionCard title="Raw Ingredients" description="Manage your local ingredient stockpiles." icon="database">
          <div className="mt-8 space-y-6">
            <label className="flex cursor-pointer flex-col items-center justify-center border border-dashed border-white/10 bg-transparent p-12 transition-colors hover:border-[#D4A373]/30 hover:bg-[#D4A373]/5">
              <div className="text-center">
                <Upload className="mx-auto h-6 w-6 text-[#D4A373]" strokeWidth={1.5} />
                <span className="mt-4 block text-sm font-light text-[#FAEDCD]">
                  {uploading ? 'Infusing...' : 'Click to add ingredients'}
                </span>
                <span className="mt-2 block text-xs text-[#A9A59A] font-light">
                  JSONL, CSV, Parquet up to 50MB.
                </span>
              </div>
              <input type="file" className="hidden" accept=".jsonl,.csv,.parquet,.txt" onChange={handleFileUpload} disabled={uploading} />
            </label>
            
            <div className="mt-8 space-y-4 border-t border-white/5 pt-6">
              {datasets.map((dataset) => (
                <div key={dataset.id} className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div>
                    <p className="text-sm font-light text-[#FAEDCD]">{dataset.name}</p>
                    <p className="text-xs text-[#A9A59A] font-light mt-1">Yield: {dataset.token_count.toLocaleString()} tokens</p>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-[#D4A373]/80" strokeWidth={1.5} />
                </div>
              ))}
              {datasets.length === 0 && (
                <div className="text-center text-sm text-[#A9A59A] font-light py-8 italic">
                  The barrel is empty. Upload your first dataset.
                </div>
              )}
            </div>
          </div>
        </SectionCard>
      </section>
    </DistilleryShell>
  );
}
