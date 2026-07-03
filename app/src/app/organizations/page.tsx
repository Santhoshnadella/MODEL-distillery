import { ShieldCheck, Users } from 'lucide-react';
import { DistilleryShell, SectionCard } from '@/components/distillery-shell';

export default function OrganizationsPage() {
  return (
    <DistilleryShell
      title="Your organization, distilled into a premium operating layer."
      description="Manage members, roles, permissions, teams, projects, and audit trails with a calm, polished workspace experience."
      eyebrow="ORGANIZATIONS"
    >
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Members & teams" description="Coordinate people, projects, and permissions from one HQ." icon="shield">
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {['Owner', 'Operator', 'Reviewer', 'Invited'].map((role) => (
              <div key={role} className="rounded-2xl border border-white/10 bg-[#0f0c0a]/70 p-4 text-sm text-[#f8f5f2]/80">
                {role}
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Audit & permissions" description="Keep every action documented and reviewable." icon="warehouse">
          <div className="mt-6 space-y-3 text-sm text-[#f8f5f2]/70">
            <div className="rounded-2xl border border-white/10 bg-[#0f0c0a]/70 p-4">4 active projects</div>
            <div className="rounded-2xl border border-white/10 bg-[#0f0c0a]/70 p-4">12 team invites pending</div>
            <div className="rounded-2xl border border-white/10 bg-[#0f0c0a]/70 p-4">RBAC and audit logs in place</div>
          </div>
        </SectionCard>
      </section>
    </DistilleryShell>
  );
}
