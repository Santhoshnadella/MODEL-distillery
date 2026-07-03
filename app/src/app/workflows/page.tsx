'use client';

import { useMemo, useState, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import { createJob, getJobs } from '@/lib/api';
import { ArrowRight, PlusCircle, Rocket } from 'lucide-react';
import { DistilleryShell, SectionCard } from '@/components/distillery-shell';
import {
  initialWorkflowJobs,
  workflowHighlights,
  workflowTemplates,
  type WorkflowJob,
} from '@/lib/workflow-data';

export default function WorkflowsPage() {
  const [jobs, setJobs] = useState<WorkflowJob[]>(initialWorkflowJobs);
  const [template, setTemplate] = useState('distill');
  const [objective, setObjective] = useState('Fine-tune a compact model for tool calling');
  const [budget, setBudget] = useState('4');
  const [region, setRegion] = useState('us-east');

  const activeRuns = useMemo(() => jobs.filter((job) => job.status !== 'Completed').length, [jobs]);

  useEffect(() => {
    getJobs().then(setJobs).catch(console.error);
  }, []);

  const handleCreateJob = async (event: FormEvent) => {
    event.preventDefault();
    const selectedTemplate = workflowTemplates.find((item) => item.value === template);
    
    try {
      const newJob = await createJob({
        objective: objective || `${selectedTemplate?.label ?? 'Workflow'} run`
      });
      
      setJobs((current) => [newJob, ...current]);
      
      // Connect to WebSocket for real-time progress
      const wsUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('http', 'ws') || 'ws://localhost:8000';
      const ws = new WebSocket(`${wsUrl}/api/jobs/${newJob.id}/ws`);
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setJobs((current) => 
          current.map(job => 
            job.id === newJob.id 
              ? { ...job, progress: `${data.progress}%`, stage: data.stage, status: data.status || job.status } 
              : job
          )
        );
      };
      
    } catch (error) {
      console.error('Failed to create job', error);
    }
    
    setObjective('');
    setBudget('4');
    setRegion('us-east');
  };

  return (
    <DistilleryShell
      title="Monitor the flow of your distillations."
      description="Launch new formulations, monitor active pipelines, and track every drop of intelligence as it refines from raw data to bottled logic."
      eyebrow="DISTILLERY OPERATIONS"
    >
      <section className="grid gap-12 md:grid-cols-3">
        {workflowHighlights.map((item) => (
          <div key={item.label} className="border-l border-[#D4A373]/20 pl-6">
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-[#A9A59A] font-light">{item.label}</p>
            <p className="mt-4 text-3xl font-light text-[#FAEDCD]">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-12 xl:grid-cols-[0.95fr_1.05fr]">
        <SectionCard title="Ignite the Still" description="Queue a new formulation for processing." icon="rocket">
          <form onSubmit={handleCreateJob} className="mt-8 space-y-8 text-sm text-[#A9A59A] font-light">
            <label className="block">
              <span className="mb-3 block text-[0.65rem] uppercase tracking-[0.3em] text-[#D4A373]">Extraction Process (Template)</span>
              <select
                className="w-full border-b border-white/10 bg-transparent px-2 py-3 text-[#FAEDCD] outline-none transition-colors focus:border-[#D4A373]"
                value={template}
                onChange={(event) => setTemplate(event.target.value)}
              >
                {workflowTemplates.map((item) => (
                  <option key={item.value} value={item.value} className="bg-[#12100E]">
                    {item.label}
                  </option>
                ))}
              </select>
              <span className="mt-2 block text-xs text-[#A9A59A]/70">The methodology used to extract intelligence.</span>
            </label>

            <label className="block">
              <span className="mb-3 block text-[0.65rem] uppercase tracking-[0.3em] text-[#D4A373]">Tasting Notes (Objective)</span>
              <textarea
                className="min-h-24 w-full border border-white/10 bg-transparent px-4 py-3 text-[#FAEDCD] outline-none transition-colors focus:border-[#D4A373]"
                value={objective}
                onChange={(event) => setObjective(event.target.value)}
              />
            </label>

            <div className="grid gap-8 sm:grid-cols-2">
              <label className="block">
                <span className="mb-3 block text-[0.65rem] uppercase tracking-[0.3em] text-[#D4A373]">Heating Power</span>
                <select
                  className="w-full border-b border-white/10 bg-transparent px-2 py-3 text-[#FAEDCD] outline-none transition-colors focus:border-[#D4A373]"
                  value={budget}
                  onChange={(event) => setBudget(event.target.value)}
                >
                  <option value="2" className="bg-[#12100E]">2 GPUs</option>
                  <option value="4" className="bg-[#12100E]">4 GPUs</option>
                  <option value="8" className="bg-[#12100E]">8 GPUs</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-3 block text-[0.65rem] uppercase tracking-[0.3em] text-[#D4A373]">Cellar Location (Region)</span>
                <select
                  className="w-full border-b border-white/10 bg-transparent px-2 py-3 text-[#FAEDCD] outline-none transition-colors focus:border-[#D4A373]"
                  value={region}
                  onChange={(event) => setRegion(event.target.value)}
                >
                  <option value="us-east" className="bg-[#12100E]">US East</option>
                  <option value="eu-west" className="bg-[#12100E]">EU West</option>
                  <option value="apac" className="bg-[#12100E]">APAC</option>
                </select>
              </label>
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 border border-[#D4A373]/50 px-6 py-2.5 text-sm text-[#FAEDCD] transition-colors hover:bg-[#D4A373]/10"
            >
              <PlusCircle className="h-4 w-4 text-[#D4A373]" />
              Ignite Boiler
            </button>
          </form>
        </SectionCard>

        <SectionCard title="Active Piping (Stream)" description="Live pipeline status of all active formulations." icon="layers">
          <div className="mt-8 space-y-6">
            {jobs.map((job) => (
              <div key={job.id} className="border-b border-white/5 pb-6">
                <div className="flex items-center justify-between text-sm text-[#FAEDCD]">
                  <span className="font-light">{job.name}</span>
                  <span className="text-[#D4A373]">{job.progress}</span>
                </div>
                <div className="mt-4 h-px w-full bg-white/5">
                  <div className="h-px bg-[#D4A373] transition-all duration-500 ease-out" style={{ width: job.progress }} />
                </div>
                <p className="mt-4 text-xs text-[#A9A59A] font-light italic">
                  {job.stage} • {job.status} • Overseer: {job.owner}
                </p>
              </div>
            ))}
            {jobs.length === 0 && (
              <div className="text-center text-sm text-[#A9A59A] font-light py-8 italic">
                The pipes are quiet. Ignite a workflow to begin.
              </div>
            )}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-[#A9A59A] font-light pt-6">
            <div>
              <span className="text-[#FAEDCD]">{activeRuns}</span> active flows
            </div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 transition-colors hover:text-[#FAEDCD]">
              Inspect Output Terminal
              <ArrowRight className="h-3.5 w-3.5 text-[#D4A373]" strokeWidth={1.5} />
            </Link>
          </div>
        </SectionCard>
      </section>
    </DistilleryShell>
  );
}
