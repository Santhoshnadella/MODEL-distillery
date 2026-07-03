'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, FlaskConical, Layers3, Sparkles, Warehouse } from 'lucide-react';
import { DistilleryShell, SectionCard } from '@/components/distillery-shell';
import { barrelCards, featureCards, processSteps } from '@/lib/distillery-data';
import { getRecipes } from '@/lib/api';
import type { Recipe } from '@/lib/types';

export default function HomePage() {
  const [latestRecipe, setLatestRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    getRecipes().then(recipes => {
      if (recipes && recipes.length > 0) {
        // Sort by id descending to get latest
        const sorted = [...recipes].sort((a, b) => b.id - a.id);
        setLatestRecipe(sorted[0]);
      }
    }).catch(console.error);
  }, []);
  return (
    <DistilleryShell
      title="Craft specialized intelligence like a master distiller."
      description="Model Distillery transforms machine learning into a luxury craft workflow. Blend ingredients, ferment data, distill logic, and bottle specialized intelligence—all wrapped in a premium, quiet experience."
      eyebrow="THE ART OF EXTRACTION"
    >
      <section className="grid gap-12 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="border border-[#D4A373]/20 bg-transparent p-10 transition-colors hover:border-[#D4A373]/40">
          <div className="flex items-center gap-3 text-[0.65rem] uppercase tracking-[0.3em] text-[#D4A373] font-light">
            <FlaskConical className="h-4 w-4" strokeWidth={1.5} />
            Immersive craft workflow
          </div>
          <h2 className="mt-6 text-3xl font-light text-[#FAEDCD] sm:text-4xl leading-tight">
            No generic dashboards.<br />Every flow feels handcrafted.
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#A9A59A] font-light">
            Start from a raw spirit (base model), select ingredients and oak barrels, then guide your formulation through fermentation, distillation, evaluation, and bottling.
          </p>
          <div className="mt-10 flex flex-wrap gap-6 border-t border-white/5 pt-8">
            <Link
              href="/auth"
              className="inline-flex items-center gap-3 border border-white/10 px-6 py-3 text-sm font-light text-[#FAEDCD] transition hover:border-white/30"
            >
              Enter the Distiller's Workbench
              <ArrowRight className="h-4 w-4 text-[#D4A373]" strokeWidth={1.5} />
            </Link>
            <Link
              href="/recipes"
              className="px-6 py-3 text-sm font-light text-[#A9A59A] transition hover:text-[#FAEDCD]"
            >
              Review the Formulations
            </Link>
          </div>
        </div>

        <div className="border border-white/5 bg-[#12100E] p-10 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-[#A9A59A] font-light">Latest Formulation</p>
              <h3 className="mt-2 text-xl font-light text-[#FAEDCD]">
                {latestRecipe ? latestRecipe.name : 'No formulations yet'}
              </h3>
            </div>
            {latestRecipe && (
              <div className="border border-[#D4A373]/20 bg-transparent px-3 py-1 text-[0.65rem] uppercase tracking-widest text-[#D4A373]">
                {latestRecipe.safety}% Purity
              </div>
            )}
          </div>
          <div className="mt-8 space-y-4">
            <div className="flex justify-between items-center text-sm font-light text-[#A9A59A] border-l border-[#D4A373]/30 pl-4">
              <span>Base Spirit</span>
              <span className="text-[#FAEDCD]">{latestRecipe ? latestRecipe.base_model : '---'}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-light text-[#A9A59A] border-l border-[#D4A373]/30 pl-4">
              <span>Knowledge Blend</span>
              <span className="text-[#FAEDCD]">{latestRecipe ? `${latestRecipe.knowledge_blend}%` : '---'}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-light text-[#A9A59A] border-l border-[#D4A373]/30 pl-4">
              <span>Reasoning Proof</span>
              <span className="text-[#FAEDCD]">{latestRecipe ? latestRecipe.flavor_profile : '---'}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-light text-[#A9A59A] border-l border-[#D4A373]/30 pl-4">
              <span>Capital Cost</span>
              <span className="text-[#FAEDCD]">{latestRecipe ? `$${latestRecipe.estimated_cost}` : '---'}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-12 md:grid-cols-2 xl:grid-cols-4">
        {featureCards.map((feature) => (
          <SectionCard key={feature.title} title={feature.title} description={feature.description} icon="layers">
            <div className="mt-8 h-px w-full bg-white/5 relative">
               <div className="absolute top-0 left-0 h-full w-1/3 bg-[#D4A373]/30" />
            </div>
          </SectionCard>
        ))}
      </section>

      <section className="grid gap-12 xl:grid-cols-[1fr_0.9fr]">
        <SectionCard title="The Distillation Journey" description="Every stage is a ritual, from fermentation to bottling." icon="sparkles">
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {processSteps.map((step, index) => (
              <div key={step} className="border-l border-white/10 pl-4 py-2 text-sm">
                <p className="text-[0.65rem] uppercase tracking-[0.3em] text-[#D4A373] font-light">Stage 0{index + 1}</p>
                <p className="mt-1 font-light text-[#FAEDCD]">{step}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Knowledge Barrels" description="Versioned, premium ingredients that power specialized intelligence." icon="warehouse">
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {barrelCards.map((barrel) => (
              <div key={barrel.name} className="border border-white/5 bg-[#12100E] p-5 transition-colors hover:border-[#D4A373]/30">
                <p className="text-sm font-light text-[#FAEDCD]">{barrel.name}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-[#A9A59A] font-light">
                  <span>{barrel.tokenCount} units</span>
                  <span className="border-b border-[#D4A373]/50 text-[#D4A373]">{barrel.quality}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>
    </DistilleryShell>
  );
}
