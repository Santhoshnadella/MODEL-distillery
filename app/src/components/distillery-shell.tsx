'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Cpu,
  Database,
  FileSearch,
  FlaskConical,
  Gauge,
  Layers3,
  Library,
  Rocket,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Warehouse,
} from 'lucide-react';

const navigation = [
  { label: 'Landing', href: '/' },
  { label: 'Auth', href: '/auth' },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Recipes', href: '/recipes' },
  { label: 'Vault', href: '/knowledge' },
  { label: 'Datasets', href: '/datasets' },
  { label: 'Evaluation', href: '/evaluation' },
  { label: 'Synthetic', href: '/synthetic' },
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Workflows', href: '/workflows' },
  { label: 'Ops', href: '/ops' },
];

export function DistilleryShell({
  title,
  description,
  eyebrow = 'MODEL DISTILLERY',
  children,
}: {
  title: string;
  description: string;
  eyebrow?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#0C0B0A] text-[#FAEDCD] selection:bg-[#D4A373]/30">
      <header className="sticky top-0 z-20 border-b border-white/5 bg-[#0C0B0A]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link href="/" className="flex items-center gap-4 group">
            <div className="rounded-full border border-white/5 bg-[#12100E] p-2 transition-transform duration-500 group-hover:rotate-12">
              <FlaskConical className="h-4 w-4 text-[#D4A373]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-[#A9A59A] font-light">
                Model Distillery
              </p>
              <p className="text-xs text-[#FAEDCD]/70 font-light mt-0.5">Clarity through extraction.</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm transition-colors duration-300 font-light ${
                    isActive
                      ? 'text-[#D4A373] border-b border-[#D4A373]/30 pb-1'
                      : 'text-[#A9A59A] hover:text-[#FAEDCD] pb-1'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <Link
            href="/auth"
            className="flex items-center gap-2 border-b border-[#D4A373]/50 pb-1 text-sm text-[#D4A373] transition-all hover:border-[#D4A373] hover:text-[#FAEDCD]"
          >
            Enter Distillery
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-16 px-6 py-16 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="border-l border-[#D4A373]/20 pl-8"
        >
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-[#A9A59A] font-light">{eyebrow}</p>
              <h1 className="mt-4 text-4xl font-light tracking-tight text-[#FAEDCD] sm:text-5xl">
                {title}
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#A9A59A] font-light">
                {description}
              </p>
            </div>
            <div className="border-l border-white/10 pl-6 text-sm text-[#A9A59A] font-light space-y-3">
              <div className="flex items-center gap-3">
                <Gauge className="h-3.5 w-3.5 text-[#D4A373]" strokeWidth={1.5} />
                Purity: 97.4% craft fidelity
              </div>
              <div className="flex items-center gap-3">
                <FlaskConical className="h-3.5 w-3.5 text-[#D4A373]" strokeWidth={1.5} />
                Yield: 11 premium recipes
              </div>
            </div>
          </div>
        </motion.section>

        {children}
      </main>
    </div>
  );
}

type IconName =
  | 'flask'
  | 'layers'
  | 'sparkles'
  | 'warehouse'
  | 'cpu'
  | 'shield'
  | 'database'
  | 'bar-chart'
  | 'shopping'
  | 'file-search'
  | 'rocket';

function renderIcon(iconName: IconName) {
  switch (iconName) {
    case 'flask':
      return <FlaskConical className="h-4 w-4 text-[#D4A373]" strokeWidth={1.5} />;
    case 'layers':
      return <Layers3 className="h-4 w-4 text-[#D4A373]" strokeWidth={1.5} />;
    case 'sparkles':
      return <Sparkles className="h-4 w-4 text-[#D4A373]" strokeWidth={1.5} />;
    case 'warehouse':
      return <Warehouse className="h-4 w-4 text-[#D4A373]" strokeWidth={1.5} />;
    case 'cpu':
      return <Cpu className="h-4 w-4 text-[#D4A373]" strokeWidth={1.5} />;
    case 'shield':
      return <ShieldCheck className="h-4 w-4 text-[#D4A373]" strokeWidth={1.5} />;
    case 'database':
      return <Database className="h-4 w-4 text-[#D4A373]" strokeWidth={1.5} />;
    case 'bar-chart':
      return <BarChart3 className="h-4 w-4 text-[#D4A373]" strokeWidth={1.5} />;
    case 'shopping':
      return <ShoppingBag className="h-4 w-4 text-[#D4A373]" strokeWidth={1.5} />;
    case 'file-search':
      return <FileSearch className="h-4 w-4 text-[#D4A373]" strokeWidth={1.5} />;
    case 'rocket':
      return <Rocket className="h-4 w-4 text-[#D4A373]" strokeWidth={1.5} />;
    default:
      return <FlaskConical className="h-4 w-4 text-[#D4A373]" strokeWidth={1.5} />;
  }
}

export function SectionCard({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: IconName;
  children?: React.ReactNode;
}) {
  return (
    <div className="border border-white/5 bg-[#12100E] p-8 transition-colors duration-500 hover:border-white/10">
      <div className="flex items-center gap-4">
        <div className="p-1">
          {renderIcon(icon)}
        </div>
        <div>
          <h3 className="text-lg font-light text-[#FAEDCD]">{title}</h3>
          <p className="mt-1 text-sm text-[#A9A59A] font-light">{description}</p>
        </div>
      </div>
      <div className="mt-8">
        {children}
      </div>
    </div>
  );
}
