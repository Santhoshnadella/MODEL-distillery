import Link from 'next/link';
import { ArrowRight, CheckCircle2, Radar, Rocket } from 'lucide-react';
import { DistilleryShell, SectionCard } from '@/components/distillery-shell';
import {
  deploymentQueue,
  observabilitySignals,
  releaseHealth,
  rolloutChecklist,
} from '@/lib/ops-data';

export default function OpsPage() {
  return (
    <DistilleryShell
      title="Guide every release from the stillroom to production without losing control."
      description="Run deployment queues, monitor quality signals, and orchestrate rollout readiness from one polished operations view."
      eyebrow="OPS & DEPLOYMENT"
    >
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard title="Deployment queue" description="Track the next release wave across regions and rollout stages." icon="rocket">
          <div className="mt-6 space-y-3">
            {deploymentQueue.map((item) => (
              <div key={item.name} className="rounded-2xl border border-white/10 bg-[#0f0c0a]/70 p-4">
                <div className="flex items-center justify-between text-sm text-[#f8f5f2]/80">
                  <span>{item.name}</span>
                  <span className="text-[#ffb347]">{item.progress}</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white/10">
                  <div className="h-2 rounded-full bg-[#c87941]" style={{ width: item.progress }} />
                </div>
                <p className="mt-3 text-sm text-[#f8f5f2]/60">
                  {item.target} • {item.stage}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Release health" description="Quality and reliability metrics for the current release window." icon="bar-chart">
          <div className="mt-6 space-y-3">
            {releaseHealth.map((metric) => (
              <div key={metric.label} className="rounded-2xl border border-white/10 bg-[#0f0c0a]/70 p-4 text-sm text-[#f8f5f2]/80">
                <div className="flex items-center justify-between">
                  <span>{metric.label}</span>
                  <span className="text-[#ffb347]">{metric.value}</span>
                </div>
                <p className="mt-2 text-xs uppercase tracking-[0.25em] text-[#e8c98a]">{metric.trend}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SectionCard title="Observability signals" description="Live system and model safety signals that need attention." icon="sparkles">
          <div className="mt-6 space-y-3">
            {observabilitySignals.map((signal) => (
              <div key={signal} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-[#0f0c0a]/70 p-4 text-sm text-[#f8f5f2]/75">
                <Radar className="mt-0.5 h-4 w-4 text-[#ffb347]" />
                <span>{signal}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Rollout checklist" description="A calm, curated handoff before shipping to production." icon="shield">
          <div className="mt-6 space-y-3">
            {rolloutChecklist.map((detail) => (
              <div key={detail} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-[#0f0c0a]/70 p-4 text-sm text-[#f8f5f2]/75">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#ffb347]" />
                <span>{detail}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full bg-[#c87941] px-4 py-2 text-sm font-medium text-[#fff7eb]">
              Return to control room
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button type="button" className="rounded-full border border-white/10 px-4 py-2 text-sm text-[#f8f5f2]/80">
              Open incident log
            </button>
          </div>
        </SectionCard>
      </section>
    </DistilleryShell>
  );
}
