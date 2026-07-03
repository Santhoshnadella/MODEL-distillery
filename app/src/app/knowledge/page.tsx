import { Warehouse, Layers3 } from 'lucide-react';
import { DistilleryShell, SectionCard } from '@/components/distillery-shell';

export default function KnowledgePage() {
  return (
    <DistilleryShell
      title="Rows of oak barrels, each one a licensed source of intelligence."
      description="Inspect knowledge sources by domain, quality, token volume, and update history before blending them into your next recipe."
      eyebrow="KNOWLEDGE VAULT"
    >
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Programming', 'GitHub / StackOverflow', '63B', 'License: MIT'],
          ['Science', 'Research papers + arXiv', '48B', 'License: CC BY'],
          ['Medical', 'Clinical notes', '29B', 'License: restricted'],
          ['Legal', 'Internal playbooks', '17B', 'License: enterprise'],
        ].map(([name, source, tokens, license]) => (
          <SectionCard key={name} title={name} description={source} icon="warehouse">
            <div className="mt-6 space-y-3 text-sm text-[#f8f5f2]/70">
              <div className="rounded-2xl border border-white/10 bg-[#0f0c0a]/70 p-4">Tokens: {tokens}</div>
              <div className="rounded-2xl border border-white/10 bg-[#0f0c0a]/70 p-4">{license}</div>
            </div>
          </SectionCard>
        ))}
      </section>
    </DistilleryShell>
  );
}
