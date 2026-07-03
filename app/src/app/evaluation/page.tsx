'use client';

import { useState } from 'react';
import { Play, Send, Zap, Brain, ShieldAlert, Sparkles } from 'lucide-react';
import { DistilleryShell, SectionCard } from '@/components/distillery-shell';

export default function TastingRoomPage() {
  const [prompt, setPrompt] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  
  const [messages, setMessages] = useState<{
    prompt: string;
    teacher: string;
    student: string;
  }[]>([
    {
      prompt: 'Explain the difference between threading and multiprocessing in Python.',
      teacher: 'Threading in Python uses concurrent threads but is limited by the Global Interpreter Lock (GIL), meaning only one thread executes Python bytecode at a time. It is best for I/O-bound tasks. Multiprocessing bypasses the GIL by creating separate processes, each with its own Python interpreter and memory space, making it ideal for CPU-bound tasks.',
      student: 'Threading is for I/O-bound tasks (like web scraping) because the GIL prevents true parallel execution. Multiprocessing is for CPU-bound tasks (like math calculations) because it spins up entirely new processes, bypassing the GIL completely.'
    }
  ]);

  const handleTest = () => {
    if (!prompt.trim()) return;
    setIsEvaluating(true);
    
    // Simulate testing delay
    setTimeout(() => {
      setMessages(prev => [
        {
          prompt,
          teacher: 'Simulated Teacher Response: The underlying architecture relies on attention mechanisms which scale quadratically O(N^2) with sequence length...',
          student: 'Simulated Distilled Student Response: Attention mechanisms scale at O(N^2), meaning as the context grows, memory usage explodes quadratically...'
        },
        ...prev
      ]);
      setPrompt('');
      setIsEvaluating(false);
    }, 1500);
  };

  return (
    <DistilleryShell
      title="The Tasting Room"
      description="Evaluate your newly distilled models. Chat side-by-side with the Teacher Model and view automated benchmark regressions."
      eyebrow="MODEL EVALUATION"
    >
      <section className="grid gap-12 xl:grid-cols-[1fr_0.9fr]">
        
        {/* Side-by-Side Chat */}
        <SectionCard title="Blind Taste Test" description="Directly compare outputs between Teacher and Student." icon="flask">
          <div className="mt-6 flex flex-col gap-6">
            
            <div className="flex gap-4">
              <input
                className="w-full border-b border-white/10 bg-transparent px-2 py-3 text-[#FAEDCD] outline-none transition-colors focus:border-[#D4A373]"
                placeholder="Ask both models a question..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTest()}
              />
              <button
                onClick={handleTest}
                disabled={isEvaluating || !prompt.trim()}
                className="flex items-center justify-center rounded border border-[#D4A373]/30 px-6 py-2 text-[#D4A373] transition-colors hover:bg-[#D4A373]/10"
              >
                {isEvaluating ? <Zap className="h-4 w-4 animate-pulse" /> : <Send className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex flex-col gap-8 max-h-[600px] overflow-y-auto pr-2">
              {messages.map((msg, idx) => (
                <div key={idx} className="flex flex-col gap-4 border-l border-white/5 pl-4 pb-4">
                  <div className="text-sm font-medium text-[#FAEDCD]">"{msg.prompt}"</div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="rounded border border-white/5 bg-white/[0.02] p-4">
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#A9A59A]">
                        <Brain className="h-3 w-3" /> Teacher (70B)
                      </div>
                      <p className="text-sm text-[#FAEDCD]/80 leading-relaxed font-light">{msg.teacher}</p>
                    </div>
                    
                    <div className="rounded border border-[#D4A373]/20 bg-[#D4A373]/5 p-4">
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#D4A373]">
                        <Zap className="h-3 w-3" /> Distilled Student (8B)
                      </div>
                      <p className="text-sm text-[#FAEDCD]/90 leading-relaxed font-light">{msg.student}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </SectionCard>

        {/* Benchmarks */}
        <SectionCard title="Automated Benchmarks" description="Scientific evaluation of the distillation process." icon="bar-chart">
          <div className="mt-8 space-y-8">
            
            <div className="rounded border border-white/10 p-6">
              <h4 className="text-sm font-medium text-[#FAEDCD] mb-4">MMLU (Massive Multitask Language Understanding)</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-[#A9A59A] mb-1">
                    <span>Teacher (Llama-3-70B)</span>
                    <span>82.4%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                    <div className="h-full bg-white/20" style={{ width: '82.4%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-[#D4A373] mb-1">
                    <span>Student (Distilled-8B)</span>
                    <span>79.1%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                    <div className="h-full bg-[#D4A373]" style={{ width: '79.1%' }} />
                  </div>
                </div>
              </div>
              <p className="mt-4 text-xs text-[#A9A59A] italic flex items-center gap-2">
                <ShieldAlert className="h-3 w-3 text-green-400" />
                96% retention of teacher logic across general knowledge.
              </p>
            </div>

            <div className="rounded border border-white/10 p-6">
              <h4 className="text-sm font-medium text-[#FAEDCD] mb-4">HumanEval (Coding)</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-[#A9A59A] mb-1">
                    <span>Teacher (Llama-3-70B)</span>
                    <span>74.2%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                    <div className="h-full bg-white/20" style={{ width: '74.2%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-[#D4A373] mb-1">
                    <span>Student (Distilled-8B)</span>
                    <span>76.8%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                    <div className="h-full bg-[#D4A373]" style={{ width: '76.8%' }} />
                  </div>
                </div>
              </div>
              <p className="mt-4 text-xs text-[#A9A59A] italic flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-[#D4A373]" />
                Student outperformed teacher due to task-specific synthetic data!
              </p>
            </div>

          </div>
        </SectionCard>

      </section>
    </DistilleryShell>
  );
}
