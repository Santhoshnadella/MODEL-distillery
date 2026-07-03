'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, KeyRound, ShieldCheck } from 'lucide-react';
import { DistilleryShell, SectionCard } from '@/components/distillery-shell';
import { useAuth } from '@/components/auth-provider';
import { login } from '@/lib/auth';
import { roleOptions, workspaceOptions } from '@/lib/auth-store';

export default function AuthPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState('master-distiller@modeldistillery.ai');
  const [password, setPassword] = useState('password123');
  const [workspace, setWorkspace] = useState(workspaceOptions[0]);
  const [role, setRole] = useState(roleOptions[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await login(email, password, workspace, role as 'Owner' | 'Operator' | 'Reviewer');
      if (result) {
        refreshUser();
        router.push('/dashboard');
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Authentication error. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DistilleryShell
      title="Welcome to the distillery vault."
      description="Authenticate into your organization workspace and prepare your first premium recipe."
      eyebrow="AUTHENTICATION"
    >
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionCard title="Secure access" description="JWT, OAuth, RBAC, and organization-ready onboarding." icon="shield">
          <div className="mt-6 space-y-3 text-sm text-[#f8f5f2]/70">
            <div className="rounded-2xl border border-white/10 bg-[#0f0c0a]/70 p-4">JWT-protected API access with token refresh.</div>
            <div className="rounded-2xl border border-white/10 bg-[#0f0c0a]/70 p-4">Team invites, role controls, and audit logs included.</div>
            <div className="rounded-2xl border border-white/10 bg-[#0f0c0a]/70 p-4">Advanced mode unlocks hidden training knobs and GPU policies.</div>
          </div>
        </SectionCard>

        <div className="rounded-[2rem] border border-white/10 bg-[#120f0d]/80 p-8 shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-[#c87941]/50 bg-[#c87941]/10 p-2">
              <KeyRound className="h-4 w-4 text-[#ffb347]" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-[#fff7eb]">Sign in to your workspace</h2>
              <p className="text-sm text-[#f8f5f2]/60">Access your recipes, datasets, and model cellar.</p>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {error && (
              <div className="rounded-2xl border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-300">
                {error}
              </div>
            )}
            
            <label className="block text-sm text-[#f8f5f2]/70">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isLoading}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f0c0a]/70 px-4 py-3 outline-none disabled:opacity-50"
                placeholder="master-distiller@domain.com"
              />
            </label>
            
            <label className="block text-sm text-[#f8f5f2]/70">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isLoading}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f0c0a]/70 px-4 py-3 outline-none disabled:opacity-50"
                placeholder="••••••••"
              />
            </label>
            
            <label className="block text-sm text-[#f8f5f2]/70">
              Workspace
              <select
                value={workspace}
                onChange={(event) => setWorkspace(event.target.value)}
                disabled={isLoading}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f0c0a]/70 px-4 py-3 outline-none disabled:opacity-50"
              >
                {workspaceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            
            <label className="block text-sm text-[#f8f5f2]/70">
              Role
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as typeof role)}
                disabled={isLoading}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f0c0a]/70 px-4 py-3 outline-none disabled:opacity-50"
              >
                {roleOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            
            <div className="flex items-center gap-3 rounded-2xl border border-[#c87941]/30 bg-[#c87941]/10 p-4 text-sm text-[#f8f5f2]/80">
              <ShieldCheck className="h-4 w-4 text-[#ffb347]" />
              SSL-encrypted, JWT-authenticated access.
            </div>
            
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-full bg-[#c87941] px-5 py-3 text-sm font-medium text-[#fff7eb] transition hover:bg-[#b66e35] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Authenticating...' : 'Enter the Distillery'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </DistilleryShell>
  );
}
