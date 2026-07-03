'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, Cpu, FlaskConical, Gauge, ShieldCheck, Sparkles, Download } from 'lucide-react';
import { DistilleryShell, SectionCard } from '@/components/distillery-shell';
import { createRecipe, exportRecipe } from '@/lib/api';

const baseModels = ['Qwen 2.5 14B', 'Llama 3.1 8B', 'Mistral Nemo', 'Gemma 2 9B'];
const flavorProfiles = ['Analytical', 'Calm', 'Precise', 'Creative'];
const teacherOptions = ['Llama 3.1 70B', 'Mistral Large', 'DeepSeek R1', 'Phi-4'];
const deploymentTargets = ['Ollama', 'vLLM', 'SGLang', 'KServe'];

export default function RecipesPage() {
  const [recipeName, setRecipeName] = useState('Amber-Qwen Distill');
  const [baseModel, setBaseModel] = useState(baseModels[0]);
  const [flavorProfile, setFlavorProfile] = useState(flavorProfiles[0]);
  const [knowledgeBlend, setKnowledgeBlend] = useState(72);
  const [reasoningStyle, setReasoningStyle] = useState(68);
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>(['Llama 3.1 70B', 'Mistral Large']);
  const [toolUse, setToolUse] = useState(58);
  const [contextLength, setContextLength] = useState(128);
  const [safety, setSafety] = useState(84);
  const [hardwareBudget, setHardwareBudget] = useState(4);
  const [deploymentTarget, setDeploymentTarget] = useState(deploymentTargets[0]);
  const [version, setVersion] = useState(2);
  const [statusMessage, setStatusMessage] = useState('Draft recipe tuned for premium distillation.');
  const [currentRecipeId, setCurrentRecipeId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const metrics = useMemo(() => {
    const cost = (0.44 + knowledgeBlend / 100 * 0.92 + hardwareBudget * 0.08).toFixed(2);
    const benchmark = Math.round(72 + knowledgeBlend / 100 * 12 + reasoningStyle / 100 * 8 + safety / 100 * 6);
    const gpuHours = (hardwareBudget * 2.4 + knowledgeBlend / 100 * 3.1 + toolUse / 100 * 0.9).toFixed(1);
    const trainingTime = `${Math.round(5 + hardwareBudget * 0.7 + knowledgeBlend / 100 * 3.2)}h`;
    return { cost, benchmark, gpuHours, trainingTime };
  }, [hardwareBudget, knowledgeBlend, reasoningStyle, safety, toolUse]);

  const toggleTeacher = (teacher: string) => {
    setSelectedTeachers((current) =>
      current.includes(teacher) ? current.filter((item) => item !== teacher) : [...current, teacher],
    );
  };

  const saveRecipe = async () => {
    setIsSaving(true);
    setStatusMessage('Sealing the barrel...');
    try {
      const payload = {
        name: recipeName,
        description: `Version ${version} of ${recipeName}`,
        base_model: baseModel,
        flavor_profile: flavorProfile,
        knowledge_blend: knowledgeBlend,
        reasoning_style: reasoningStyle,
        tool_use: toolUse,
        context_length: contextLength,
        safety: safety,
        hardware_budget: hardwareBudget,
        deployment_target: deploymentTarget,
        version: version,
        estimated_cost: Number(metrics.cost),
      };
      const newRecipe = await createRecipe(payload);
      setCurrentRecipeId(newRecipe.id);
      setStatusMessage(`Barrel sealed successfully. Formulation ID: ${newRecipe.id}`);
    } catch (error) {
      console.error('Failed to save recipe', error);
      setStatusMessage('Failed to seal the barrel.');
    } finally {
      setIsSaving(false);
    }
  };

  const cloneRecipe = () => {
    setRecipeName(`${recipeName} Clone`);
    setStatusMessage('Recipe cloned and ready for refinement.');
  };

  const versionRecipe = () => {
    setVersion((current) => current + 1);
    setStatusMessage(`Version ${version + 1} of ${recipeName} is now staged.`);
  };

  const timeline = [
    { name: 'Grinding Knowledge', status: knowledgeBlend > 60 ? 'Optimized' : 'Draft' },
    { name: 'Fermenting', status: flavorProfile !== 'Analytical' ? 'Balanced' : 'Calm' },
    { name: 'Distilling', status: selectedTeachers.length > 1 ? 'Multi-teacher' : 'Single-teacher' },
    { name: 'Filtering', status: safety > 75 ? 'Safety pass' : 'Monitor' },
    { name: 'Laboratory Testing', status: 'Ready' },
    { name: 'Bottling', status: 'Ready' },
  ];

  return (
    <DistilleryShell
      title="The master distiller's workbench."
      description="Compose your recipe from base models, flavors, knowledge barrels, and deployment targets before moving into distillation."
      eyebrow="RECIPE BUILDER"
    >
      <section className="grid gap-12 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard 
          title="Recipe composition" 
          description="Tune the recipe with immersive sliders, selectors, and live estimates. Select the ingredients to form the perfect base." 
          icon="flask"
        >
          <div className="mt-8 space-y-10">
            <label className="block text-sm text-[#A9A59A] font-light">
              <span className="mb-3 flex items-center justify-between">
                <span>Vat Name</span>
                <span className="text-[0.65rem] uppercase tracking-[0.3em] text-[#D4A373]">Batch v{version}</span>
              </span>
              <input
                value={recipeName}
                onChange={(event) => setRecipeName(event.target.value)}
                className="w-full border-b border-white/10 bg-transparent px-2 py-3 text-[#FAEDCD] outline-none transition-colors focus:border-[#D4A373]"
                placeholder="Name this extraction..."
              />
              <span className="mt-2 block text-xs text-[#A9A59A]/70">The designated label for this specific barrel.</span>
            </label>

            <div className="grid gap-8 md:grid-cols-2">
              <label className="text-sm text-[#A9A59A] font-light">
                <p className="text-[0.65rem] uppercase tracking-[0.3em] text-[#D4A373]">Base Spirit (Model)</p>
                <select
                  value={baseModel}
                  onChange={(event) => setBaseModel(event.target.value)}
                  className="mt-4 w-full border-b border-white/10 bg-transparent px-2 py-2 text-[#FAEDCD] outline-none focus:border-[#D4A373]"
                >
                  {baseModels.map((model) => (
                    <option key={model} value={model} className="bg-[#12100E]">
                      {model}
                    </option>
                  ))}
                </select>
                <span className="mt-2 block text-xs text-[#A9A59A]/70">The raw, unaged model upon which we build the flavor.</span>
              </label>

              <label className="text-sm text-[#A9A59A] font-light">
                <p className="text-[0.65rem] uppercase tracking-[0.3em] text-[#D4A373]">Flavor Profile</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {flavorProfiles.map((profile) => (
                    <button
                      key={profile}
                      type="button"
                      onClick={() => setFlavorProfile(profile)}
                      className={`px-4 py-2 text-sm transition-all duration-300 ${
                        flavorProfile === profile
                          ? 'border border-[#D4A373] text-[#D4A373]'
                          : 'border border-transparent text-[#A9A59A] hover:text-[#FAEDCD]'
                      }`}
                    >
                      {profile}
                    </button>
                  ))}
                </div>
                <span className="mt-2 block text-xs text-[#A9A59A]/70">The character notes imparted during fermentation.</span>
              </label>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <label className="text-sm text-[#A9A59A] font-light">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[0.65rem] uppercase tracking-[0.3em] text-[#D4A373]">Knowledge Blend</span>
                  <span className="text-[#FAEDCD]">{knowledgeBlend}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={knowledgeBlend}
                  onChange={(event) => setKnowledgeBlend(Number(event.target.value))}
                  className="w-full accent-[#D4A373] h-px bg-white/10 appearance-none"
                />
                <span className="mt-3 block text-xs text-[#A9A59A]/70">Density of proprietary data infused into the mix.</span>
              </label>

              <label className="text-sm text-[#A9A59A] font-light">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[0.65rem] uppercase tracking-[0.3em] text-[#D4A373]">Reasoning Proof</span>
                  <span className="text-[#FAEDCD]">{reasoningStyle}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={reasoningStyle}
                  onChange={(event) => setReasoningStyle(Number(event.target.value))}
                  className="w-full accent-[#D4A373] h-px bg-white/10 appearance-none"
                />
                <span className="mt-3 block text-xs text-[#A9A59A]/70">The logical ABV (alcohol by volume) of the final model.</span>
              </label>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <label className="text-sm text-[#A9A59A] font-light">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[0.65rem] uppercase tracking-[0.3em] text-[#D4A373]">Tool Extensibility</span>
                  <span className="text-[#FAEDCD]">{toolUse}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={toolUse}
                  onChange={(event) => setToolUse(Number(event.target.value))}
                  className="w-full accent-[#D4A373] h-px bg-white/10 appearance-none"
                />
                <span className="mt-3 block text-xs text-[#A9A59A]/70">Ability for the distillate to interact with external barrels.</span>
              </label>

              <label className="text-sm text-[#A9A59A] font-light">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[0.65rem] uppercase tracking-[0.3em] text-[#D4A373]">Safety Filter</span>
                  <span className="text-[#FAEDCD]">{safety}%</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="100"
                  value={safety}
                  onChange={(event) => setSafety(Number(event.target.value))}
                  className="w-full accent-[#D4A373] h-px bg-white/10 appearance-none"
                />
                <span className="mt-3 block text-xs text-[#A9A59A]/70">Micro-filtration of impurities and harmful artifacts.</span>
              </label>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <label className="text-sm text-[#A9A59A] font-light">
                <p className="text-[0.65rem] uppercase tracking-[0.3em] text-[#D4A373]">Master Distillers (Teachers)</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {teacherOptions.map((teacher) => (
                    <button
                      key={teacher}
                      type="button"
                      onClick={() => toggleTeacher(teacher)}
                      className={`px-3 py-1.5 text-sm transition-all duration-300 ${
                        selectedTeachers.includes(teacher)
                          ? 'border-b border-[#D4A373] text-[#FAEDCD]'
                          : 'border-b border-transparent text-[#A9A59A] hover:text-[#FAEDCD]'
                      }`}
                    >
                      {teacher}
                    </button>
                  ))}
                </div>
                <span className="mt-3 block text-xs text-[#A9A59A]/70">The larger models guiding the distillation process.</span>
              </label>

              <label className="text-sm text-[#A9A59A] font-light">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[0.65rem] uppercase tracking-[0.3em] text-[#D4A373]">Context Barrel Size</span>
                  <span className="text-[#FAEDCD]">{contextLength}k</span>
                </div>
                <select
                  value={contextLength}
                  onChange={(event) => setContextLength(Number(event.target.value))}
                  className="w-full border-b border-white/10 bg-transparent px-2 py-2 text-[#FAEDCD] outline-none focus:border-[#D4A373]"
                >
                  {[32, 64, 128, 256].map((length) => (
                    <option key={length} value={length} className="bg-[#12100E]">
                      {length}k
                    </option>
                  ))}
                </select>
                <span className="mt-3 block text-xs text-[#A9A59A]/70">The total volume of context the model can hold at once.</span>
              </label>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <label className="text-sm text-[#A9A59A] font-light">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[0.65rem] uppercase tracking-[0.3em] text-[#D4A373]">Heating Power (Hardware)</span>
                  <span className="text-[#FAEDCD]">{hardwareBudget}x H100</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={hardwareBudget}
                  onChange={(event) => setHardwareBudget(Number(event.target.value))}
                  className="w-full accent-[#D4A373] h-px bg-white/10 appearance-none"
                />
                <span className="mt-3 block text-xs text-[#A9A59A]/70">GPU resources applied to boil the data.</span>
              </label>

              <label className="text-sm text-[#A9A59A] font-light">
                <p className="text-[0.65rem] uppercase tracking-[0.3em] text-[#D4A373]">Bottling Target</p>
                <select
                  value={deploymentTarget}
                  onChange={(event) => setDeploymentTarget(event.target.value)}
                  className="mt-4 w-full border-b border-white/10 bg-transparent px-2 py-2 text-[#FAEDCD] outline-none focus:border-[#D4A373]"
                >
                  {deploymentTargets.map((target) => (
                    <option key={target} value={target} className="bg-[#12100E]">
                      {target}
                    </option>
                  ))}
                </select>
                <span className="mt-3 block text-xs text-[#A9A59A]/70">The final serving format for the distillate.</span>
              </label>
            </div>
          </div>
        </SectionCard>

        <div className="space-y-12">
          <SectionCard title="Distillation Outlook" description="Live metrics predicting the yield of this formulation." icon="sparkles">
            <div className="mt-8 space-y-6">
              <div className="border-b border-white/5 pb-4">
                <div className="flex items-center justify-between text-sm text-[#A9A59A] font-light">
                  <span>Projected Capital (Cost)</span>
                  <span className="text-2xl font-light text-[#FAEDCD]">${metrics.cost}</span>
                </div>
              </div>
              <div className="border-b border-white/5 pb-4">
                <div className="flex items-center justify-between text-sm text-[#A9A59A] font-light">
                  <span>Proof Estimate (Benchmark)</span>
                  <span className="text-2xl font-light text-[#FAEDCD]">{metrics.benchmark}%</span>
                </div>
              </div>
              <div className="border-b border-white/5 pb-4">
                <div className="flex items-center justify-between text-sm text-[#A9A59A] font-light">
                  <span>Boiling Energy (GPU Hours)</span>
                  <span className="text-2xl font-light text-[#FAEDCD]">{metrics.gpuHours}h</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm text-[#A9A59A] font-light">
                  <span>Fermentation Time</span>
                  <span className="text-2xl font-light text-[#FAEDCD]">{metrics.trainingTime}</span>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Craft Progression" description="The journey from raw data to bottled intelligence." icon="sparkles">
            <div className="mt-8 space-y-4 border-l border-white/5 pl-4">
              {timeline.map((step) => (
                <div key={step.name} className="flex items-center justify-between text-sm text-[#A9A59A] font-light">
                  <span>{step.name}</span>
                  <span className="text-[#D4A373] text-xs uppercase tracking-widest">{step.status}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Actions" description="Commit this formulation." icon="flask">
            <div className="mt-8 space-y-6">
              <div className="text-sm text-[#A9A59A] font-light italic">
                "{statusMessage}"
              </div>
              <div className="flex flex-wrap gap-4 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={saveRecipe}
                  disabled={isSaving}
                  className={`inline-flex items-center gap-2 border border-white/10 px-6 py-2 text-sm transition-colors ${
                    isSaving ? 'text-[#A9A59A] bg-[#12100E]' : 'text-[#FAEDCD] hover:border-white/30'
                  }`}
                >
                  <FlaskConical className="h-4 w-4 text-[#D4A373]" />
                  {isSaving ? 'Sealing...' : 'Seal the Barrel (Save)'}
                </button>
                <button
                  type="button"
                  onClick={cloneRecipe}
                  className="px-4 py-2 text-sm text-[#A9A59A] font-light transition-colors hover:text-[#FAEDCD]"
                >
                  Clone Recipe
                </button>
                <button
                  type="button"
                  onClick={versionRecipe}
                  className="px-4 py-2 text-sm text-[#A9A59A] font-light transition-colors hover:text-[#FAEDCD]"
                >
                  Stage New Version
                </button>
                <button
                  type="button"
                  onClick={() => currentRecipeId && exportRecipe(currentRecipeId)}
                  disabled={!currentRecipeId}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-light transition-colors ${
                    currentRecipeId ? 'text-[#D4A373] hover:text-[#FAEDCD]' : 'text-[#A9A59A] cursor-not-allowed'
                  }`}
                >
                  <Download className="h-4 w-4" />
                  Export Label (JSON)
                </button>
              </div>
            </div>
          </SectionCard>
        </div>
      </section>
    </DistilleryShell>
  );
}
