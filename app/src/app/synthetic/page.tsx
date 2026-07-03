'use client';

import { useState, useRef } from 'react';
import { Sparkles, CheckCircle2, Upload, FileText, X } from 'lucide-react';
import { DistilleryShell, SectionCard } from '@/components/distillery-shell';
import { createJob } from '@/lib/api';

export default function SyntheticGeneratorPage() {
  const [distillationScale, setDistillationScale] = useState('Proof of Concept / Niche Task');
  const [fileMeta, setFileMeta] = useState<{ name: string; size: number; lines: number } | null>({
    name: 'proof_of_concept_5k.txt (Pre-bundled)',
    size: 485000,
    lines: 5000
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [seedPrompts, setSeedPrompts] = useState('[PRE-BUNDLED PACK: 5,000 Prompts Loaded via backend/packs/proof_of_concept_5k.txt]');
  const [teacherModel, setTeacherModel] = useState('Llama-3.1-70B-Instruct');
  const [systemPrompt, setSystemPrompt] = useState(
    'You are an expert, highly capable AI teacher model designated to generate premium, diverse training data for a smaller student model.\n\n' +
    'INSTRUCTIONS:\n' +
    '1. Analyze the provided seed question or topic carefully.\n' +
    '2. Craft a comprehensive, accurate, and highly structured response.\n' +
    '3. Ensure your tone is objective, deeply analytical, and easy for a smaller model to learn from.\n' +
    '4. Include step-by-step reasoning where applicable.\n' +
    '5. Avoid fluff, repetitive disclaimers, or conversational filler (e.g., "Certainly!", "Here is the answer...").\n' +
    '6. If the question requires code, provide robust, well-commented solutions using modern best practices.\n\n' +
    'OUTPUT FORMAT: Your output must be purely the instructional response, ready to be paired with the user\'s prompt as a perfect {"instruction", "response"} distillation pair.'
  );
  
  const handleScaleChange = (scale: string) => {
    setDistillationScale(scale);
    
    if (scale.includes('Proof of Concept')) {
      setFileMeta({ name: 'proof_of_concept_5k.txt (Pre-bundled)', size: 485000, lines: 5000 });
      setSeedPrompts('[PRE-BUNDLED PACK: 5,000 Prompts Loaded via backend/packs/proof_of_concept_5k.txt]');
    } else if (scale.includes('Task-Specific')) {
      setFileMeta({ name: 'task_specific_50k.txt (Pre-bundled)', size: 5200000, lines: 50000 });
      setSeedPrompts('[PRE-BUNDLED PACK: 50,000 Prompts Loaded via backend/packs/task_specific_50k.txt]');
    } else {
      setFileMeta({ name: 'general_foundation_150k.txt (Pre-bundled)', size: 16500000, lines: 150000 });
      setSeedPrompts('[PRE-BUNDLED PACK: 150,000 Prompts Loaded via backend/packs/general_foundation_150k.txt]');
    }
  };

  const [isFermenting, setIsFermenting] = useState(false);
  const [resultId, setResultId] = useState<number | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const lines = content.split('\n').filter((l) => l.trim().length > 0).length;
      
      // Store in memory (can handle 15MB+ easily), but DO NOT render to textarea
      setSeedPrompts(content);
      setFileMeta({
        name: file.name,
        size: file.size,
        lines: lines,
      });
    };
    reader.readAsText(file);
  };

  const clearFile = () => {
    setFileMeta(null);
    setSeedPrompts('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    // do not auto-restore bundle on manual clear
  };

  const handleFerment = async () => {
    if (!seedPrompts.trim()) return;
    setIsFermenting(true);
    setResultId(null);
    try {
      const job = await createJob({
        objective: `[SYNTHETIC GENERATION - ${distillationScale}] Teacher: ${teacherModel}\nSystem Prompt: ${systemPrompt}\n\nSeed Pack:\n${seedPrompts}`
      });
      setResultId(job.id);
    } catch (error) {
      console.error('Failed to create synthetic generation job', error);
    } finally {
      setIsFermenting(false);
    }
  };

  return (
    <DistilleryShell
      title="Generate synthetic data from a Teacher Model."
      description="Provide a diverse set of seed questions and a predetermined system prompt. The Teacher Model will chat with these prompts to generate a high-quality distillation dataset."
      eyebrow="CHAT FERMENTER"
    >
      <section className="grid gap-12 xl:grid-cols-[1fr_0.9fr]">
        <SectionCard title="Diverse Prompts & Teacher" description="Configure the synthetic generation parameters." icon="flask">
          <div className="mt-8 space-y-8 text-sm text-[#A9A59A] font-light">
            <label className="block">
              <span className="mb-3 block text-[0.65rem] uppercase tracking-[0.3em] text-[#D4A373]">Distillation Scale</span>
              <select
                className="w-full border-b border-white/10 bg-transparent px-2 py-3 text-[#FAEDCD] outline-none transition-colors focus:border-[#D4A373]"
                value={distillationScale}
                onChange={(event) => handleScaleChange(event.target.value)}
              >
                <option value="Proof of Concept / Niche Task" className="bg-[#12100E]">Proof of Concept (1,000 - 5,000 Prompts)</option>
                <option value="Task-Specific Mastery" className="bg-[#12100E]">Task-Specific Mastery (10,000 - 50,000 Prompts)</option>
                <option value="General Purpose / Foundation" className="bg-[#12100E]">General Purpose / Foundation (100,000+ Prompts)</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-3 block text-[0.65rem] uppercase tracking-[0.3em] text-[#D4A373]">Teacher Model</span>
              <select
                className="w-full border-b border-white/10 bg-transparent px-2 py-3 text-[#FAEDCD] outline-none transition-colors focus:border-[#D4A373]"
                value={teacherModel}
                onChange={(event) => setTeacherModel(event.target.value)}
              >
                <option value="Llama-3.1-70B-Instruct" className="bg-[#12100E]">Llama-3.1-70B-Instruct</option>
                <option value="GPT-4o" className="bg-[#12100E]">GPT-4o (OpenAI)</option>
                <option value="Claude-3.5-Sonnet" className="bg-[#12100E]">Claude 3.5 Sonnet</option>
                <option value="Mixtral-8x22B" className="bg-[#12100E]">Mixtral 8x22B</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-3 flex items-center justify-between text-[0.65rem] uppercase tracking-[0.3em] text-[#D4A373]">
                <span>Diverse Seed Questions</span>
                <span className="text-[#A9A59A] lowercase tracking-normal">({fileMeta ? fileMeta.lines : seedPrompts.split('\n').length} prompts loaded)</span>
              </span>
              
              {fileMeta ? (
                <div className="flex flex-col items-center justify-center rounded border border-dashed border-[#D4A373]/50 bg-[#D4A373]/5 p-8 text-center transition-colors">
                  <FileText className="mb-4 h-8 w-8 text-[#D4A373]" />
                  <p className="text-sm text-[#FAEDCD]">{fileMeta.name}</p>
                  <p className="mt-2 text-xs text-[#A9A59A]">
                    {(fileMeta.size / 1024 / 1024).toFixed(2)} MB • {fileMeta.lines.toLocaleString()} Prompts
                  </p>
                  <button
                    onClick={clearFile}
                    className="mt-6 flex items-center gap-2 rounded border border-red-500/30 px-4 py-2 text-xs text-red-400 hover:bg-red-500/10"
                  >
                    <X className="h-3 w-3" /> Remove File
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <textarea
                    className="min-h-48 w-full border border-white/10 bg-transparent px-4 py-3 text-[#FAEDCD] outline-none transition-colors focus:border-[#D4A373]"
                    placeholder="Paste a few examples manually, OR upload a bulk file below..."
                    value={seedPrompts}
                    onChange={(e) => setSeedPrompts(e.target.value)}
                  />
                  <div className="relative">
                    <input
                      type="file"
                      accept=".txt,.jsonl,.csv"
                      className="absolute inset-0 z-50 h-full w-full cursor-pointer opacity-0"
                      onChange={handleFileUpload}
                      ref={fileInputRef}
                    />
                    <div className="flex items-center justify-center gap-3 rounded border border-dashed border-white/10 bg-white/5 py-4 text-xs text-[#A9A59A] transition-colors hover:border-[#D4A373]/50 hover:text-[#D4A373]">
                      <Upload className="h-4 w-4" />
                      Upload massive prompt file (100k+ lines, .txt or .jsonl)
                    </div>
                  </div>
                </div>
              )}
            </label>

            <label className="block">
              <span className="mb-3 block text-[0.65rem] uppercase tracking-[0.3em] text-[#D4A373]">Predetermined System Prompt (Teacher Persona)</span>
              <textarea
                className="min-h-32 w-full border border-white/10 bg-transparent px-4 py-3 text-[#FAEDCD] outline-none transition-colors focus:border-[#D4A373]"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
              />
            </label>

            <button
              type="button"
              onClick={handleFerment}
              disabled={isFermenting || !seedPrompts.trim()}
              className={`inline-flex items-center gap-2 border border-[#D4A373]/50 px-6 py-2.5 text-sm transition-colors ${
                isFermenting || !seedPrompts.trim() ? 'text-[#A9A59A] bg-[#12100E]' : 'text-[#FAEDCD] hover:bg-[#D4A373]/10'
              }`}
            >
              <Sparkles className="h-4 w-4 text-[#D4A373]" />
              {isFermenting ? 'Fermenting Data...' : 'Generate Distillation Dataset'}
            </button>
          </div>
        </SectionCard>

        <SectionCard title="Fermentation Output" description="The resulting distillation dataset." icon="database">
          <div className="mt-8 space-y-6">
            {!resultId ? (
              <div className="text-center text-sm text-[#A9A59A] font-light py-8 italic border border-dashed border-white/10">
                The vat is empty. Provide diverse questions to begin generation.
              </div>
            ) : (
              <div className="border border-white/10 bg-[#12100E] p-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <h3 className="text-sm font-light text-[#FAEDCD]">Job Queued Successfully</h3>
                  <CheckCircle2 className="h-4 w-4 text-[#D4A373]" strokeWidth={1.5} />
                </div>
                <div className="mt-4 space-y-2 text-xs text-[#A9A59A] font-light">
                  <p>Workflow ID: {resultId}</p>
                  <p>Status: Fermenting in background workers...</p>
                  <p className="mt-4 text-[#D4A373] italic">
                    The resulting dataset will be automatically deposited in your Ingredient Sourcing (Datasets) tab once complete.
                  </p>
                </div>
              </div>
            )}
          </div>
        </SectionCard>
      </section>
    </DistilleryShell>
  );
}
