import { CreditCard, TrendingUp } from 'lucide-react';
import { DistilleryShell, SectionCard } from '@/components/distillery-shell';
import { billingSummary } from '@/lib/marketplace-data';

export default function BillingPage() {
  return (
    <DistilleryShell
      title="Billing that feels as clear as a polished ledger."
      description="Track usage, invoices, marketplace earnings, and plan health from a premium operations view."
      eyebrow="BILLING"
    >
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {billingSummary.map((item) => (
          <div key={item.label} className="rounded-[1.6rem] border border-white/10 bg-[#16120e]/80 p-6">
            <p className="text-sm uppercase tracking-[0.25em] text-[#e8c98a]">{item.label}</p>
            <p className="mt-3 text-3xl font-semibold text-[#fff7eb]">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Usage overview" description="GPU and storage consumption over the last 30 days." icon="bar-chart">
          <div className="mt-6 space-y-4">
            {[
              ['GPU usage', '184h / 250h'],
              ['Storage', '1.9 TB / 3 TB'],
              ['Bandwidth', '82 GB / 120 GB'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-[#0f0c0a]/70 p-4 text-sm text-[#f8f5f2]/80">
                <div className="flex items-center justify-between">
                  <span>{label}</span>
                  <span className="text-[#ffb347]">{value}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Invoice & subscription" description="Keep your plan, invoices, and marketplace activity in sync." icon="shopping">
          <div className="mt-6 space-y-3 text-sm text-[#f8f5f2]/70">
            <div className="rounded-2xl border border-white/10 bg-[#0f0c0a]/70 p-4">Plan: Premium Distiller</div>
            <div className="rounded-2xl border border-white/10 bg-[#0f0c0a]/70 p-4">Next invoice: July 15, 2026</div>
            <div className="rounded-2xl border border-white/10 bg-[#0f0c0a]/70 p-4">Marketplace earnings: $12.4K</div>
          </div>
        </SectionCard>
      </section>
    </DistilleryShell>
  );
}
