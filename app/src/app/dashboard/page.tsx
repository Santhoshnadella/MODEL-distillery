'use client';

import Link from 'next/link';
import { ArrowRight, Cpu, FlaskConical } from 'lucide-react';
import { ProtectedRoute } from '@/components/protected-route';
import { DistilleryShell, SectionCard } from '@/components/distillery-shell';
import { dashboardCards } from '@/lib/distillery-data';
import { initialWorkflowJobs } from '@/lib/workflow-data';
import { useAuth } from '@/components/auth-provider';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <DistilleryShell
        title={`Welcome back, ${user?.name ?? 'Master Distiller'}.`}
        description="Monitor active distillations, GPU consumption, recent recipes, datasets, and platform health from a single premium control room."
        eyebrow="DASHBOARD"
      >
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {dashboardCards.map((card) => (
            <div key={card.label} className="rounded-[1.6rem] border border-white/10 bg-[#16120e]/80 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.3)]">
              <p className="text-sm uppercase tracking-[0.25em] text-[#e8c98a]">{card.label}</p>
              <p className="mt-3 text-3xl font-semibold text-[#fff7eb]">{card.value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <SectionCard title="Workflow queue" description="Keep training and evaluation jobs moving from one controlled stage to the next." icon="flask">
            <div className="mt-6 space-y-3">
              {initialWorkflowJobs.slice(0, 3).map((job) => (
                <div key={job.id} className="rounded-2xl border border-white/10 bg-[#0f0c0a]/70 p-4">
                  <div className="flex items-center justify-between text-sm text-[#f8f5f2]/80">
                    <span>{job.name}</span>
                    <span className="text-[#ffb347]">{job.progress}</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-white/10">
                    <div className="h-2 rounded-full bg-[#c87941]" style={{ width: job.progress }} />
                  </div>
                  <p className="mt-3 text-sm text-[#f8f5f2]/60">{job.stage} • {job.status}</p>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Link href="/workflows" className="inline-flex items-center gap-2 rounded-full bg-[#c87941] px-4 py-2 text-sm font-medium text-[#fff7eb]">
                Open workflow studio
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </SectionCard>

          <SectionCard title="Workspace pulse" description="Role-aware context and GPU pressure." icon="cpu">
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-[#0f0c0a]/70 p-4">
                <div className="flex items-center justify-between text-sm text-[#f8f5f2]/75">
                  <span>Workspace</span>
                  <span className="text-[#ffb347]">{user?.workspace}</span>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0f0c0a]/70 p-4">
                <div className="flex items-center justify-between text-sm text-[#f8f5f2]/75">
                  <span>Role</span>
                  <span className="text-[#ffb347]">{user?.role}</span>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0f0c0a]/70 p-4">
                <div className="flex items-center justify-between text-sm text-[#f8f5f2]/75">
                  <span>GPU utilization</span>
                  <span className="text-[#ffb347]">74%</span>
                </div>
              </div>
            </div>
          </SectionCard>
        </section>

      </DistilleryShell>
    </ProtectedRoute>
  );
}
