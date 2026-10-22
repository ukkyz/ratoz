import { useState } from "react";
import { GitFork, Zap, Gauge, CheckCircle2 } from "lucide-react";

type Expert = {
  id: number;
  name: string;
  icon: string;
  domain: string;
  description: string;
  color: string;
};

const EXPERTS: Expert[] = [
  { id: 1, name: "Math & Symbolic Algebra", icon: "🧮", domain: "Calculus, equations, proofs", description: "Trained on LaTeX math repos and step-by-step arithmetic deductions.", color: "from-blue-500 to-indigo-600" },
  { id: 2, name: "Python & Systems Code", icon: "💻", domain: "Algorithms, syntax, debugging", description: "Specialized in Python, Rust, algorithms, and AST structure parsing.", color: "from-emerald-500 to-teal-600" },
  { id: 3, name: "Creative Prose & Metaphor", icon: "✍️", domain: "Poetry, fiction, rhetoric", description: "Deep stylistic nuance, evocative vocabulary, and emotional cadence.", color: "from-pink-500 to-rose-600" },
  { id: 4, name: "Multi-Language Translation", icon: "🌍", domain: "Cross-lingual alignment", description: "Translates idioms, honorifics, and syntax between 100+ global languages.", color: "from-amber-500 to-orange-600" },
  { id: 5, name: "Physics & Natural Science", icon: "🔬", domain: "Chemistry, biology, dynamics", description: "Thermodynamics, genetics, quantum mechanics, and empirical formulas.", color: "from-cyan-500 to-blue-600" },
  { id: 6, name: "History & Legal Thought", icon: "🏛️", domain: "Precedent, historical epochs", description: "Constitutional analysis, geopolitical history, and archival records.", color: "from-yellow-500 to-amber-700" },
  { id: 7, name: "Logic & Fact Verification", icon: "🛡️", domain: "Truth checking, consistency", description: "Validates premise syllogisms and flags factual hallucinations.", color: "from-violet-500 to-purple-600" },
  { id: 8, name: "JSON, SQL & Data Schemas", icon: "📦", domain: "Relational queries, APIs", description: "Strict format enforcer for database schemas, JSON trees, and YAML.", color: "from-slate-600 to-slate-800" },
];

type MoEPrompt = {
  text: string;
  category: string;
  expertScores: Record<number, number>; // Expert ID -> Router probability %
};

const PROMPTS: MoEPrompt[] = [
  {
    text: "Calculate the definite integral ∫ 3x² dx from 0 to 4",
    category: "Mathematics",
    expertScores: { 1: 86, 5: 11, 7: 2, 2: 1, 3: 0, 4: 0, 6: 0, 8: 0 },
  },
  {
    text: "def quicksort(arr): return arr if len(arr) <= 1 else ...",
    category: "Coding & Algorithms",
    expertScores: { 2: 89, 8: 7, 1: 3, 7: 1, 3: 0, 4: 0, 5: 0, 6: 0 },
  },
  {
    text: "Write a melancholic sonnet about ancient lighthouses and the sea",
    category: "Creative Writing",
    expertScores: { 3: 91, 6: 5, 7: 3, 4: 1, 1: 0, 2: 0, 5: 0, 8: 0 },
  },
  {
    text: "Translate 'The early bird catches the worm' into conversational Japanese",
    category: "Translation",
    expertScores: { 4: 93, 3: 4, 7: 2, 6: 1, 1: 0, 2: 0, 5: 0, 8: 0 },
  },
  {
    text: "SELECT user_id, COUNT(*) FROM orders GROUP BY user_id HAVING COUNT(*) > 5",
    category: "Database & JSON",
    expertScores: { 8: 88, 2: 9, 1: 2, 7: 1, 3: 0, 4: 0, 5: 0, 6: 0 },
  },
];

export default function MixtureOfExpertsDemo() {
  const [selectedPromptIdx, setSelectedPromptIdx] = useState<number>(0);
  const [topK, setTopK] = useState<number>(2);
  const [isDenseMode, setIsDenseMode] = useState<boolean>(false);

  const currentPrompt = PROMPTS[selectedPromptIdx];
  const scores = currentPrompt.expertScores;

  // Sort experts by score
  const sortedExperts = [...EXPERTS].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0));
  const activeExpertIds = isDenseMode
    ? EXPERTS.map((e) => e.id)
    : sortedExperts.slice(0, topK).map((e) => e.id);

  // Compute metrics: assume total 8 experts with 6B params each = 48B total params
  const totalParams = 48; // Billion
  const activeParams = isDenseMode ? 48 : (48 / 8) * topK;
  const computeSavedPct = Math.round(((totalParams - activeParams) / totalParams) * 100);

  return (
    <div className="space-y-8">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-md">
            <GitFork className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Mixture of Experts (MoE): The Secret to Frontier Speed
            </h3>
            <p className="text-slate-600 mt-1">
              Imagine a hospital where every single doctor attends to every single patient, even for a stubbed toe. That's a{" "}
              <strong>Dense Model</strong> (slow, expensive). Modern giants like <strong>Mixtral, DeepSeek-V3, and GPT-4</strong> use a{" "}
              <strong>Sparse Mixture of Experts (MoE)</strong>: a lightweight <em>Router</em> inspects each incoming word and dispatches it
              only to the <strong>Top-2 specialist experts</strong> who know that topic best!
            </p>
          </div>
        </div>
      </div>

      {/* Preset Prompt Picker */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
          Step 1: Choose a prompt to send to the MoE Router
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {PROMPTS.map((p, idx) => {
            const isSel = idx === selectedPromptIdx;
            return (
              <button
                key={idx}
                onClick={() => setSelectedPromptIdx(idx)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  isSel
                    ? "border-emerald-600 bg-emerald-50/60 shadow-sm ring-2 ring-emerald-200"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {p.category}
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-800 line-clamp-2">"{p.text}"</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Controls & Efficiency Barometer */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Router Gating Config */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700">Router Strategy: Top-K</label>
            <span className="text-xs font-mono font-bold text-emerald-600">
              {isDenseMode ? "Dense (All 8)" : `Top-${topK} Experts`}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            {[1, 2, 4].map((k) => (
              <button
                key={k}
                disabled={isDenseMode}
                onClick={() => setTopK(k)}
                className={`py-1.5 rounded transition-all ${
                  !isDenseMode && topK === k
                    ? "bg-white text-emerald-700 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900 disabled:opacity-40"
                }`}
              >
                Top-{k}
              </button>
            ))}
          </div>

          <div>
            <button
              onClick={() => setIsDenseMode((d) => !d)}
              className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold border transition-all ${
                isDenseMode
                  ? "bg-amber-500 border-amber-600 text-white"
                  : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {isDenseMode ? "⚠️ Mode: Dense (100% Compute Burn)" : "⚡ Mode: Sparse MoE (Top-K Active)"}
            </button>
          </div>
        </div>

        {/* Compute & Speed Comparison */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Gauge className="w-4 h-4 text-emerald-600" />
            Compute & Parameter Efficiency
          </div>

          <div className="flex justify-between items-baseline pt-1">
            <span className="text-xs text-slate-500">Active Parameters:</span>
            <span className="text-sm font-bold font-mono text-slate-900">
              {activeParams}B / {totalParams}B params
            </span>
          </div>

          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isDenseMode ? "bg-amber-500" : "bg-emerald-500"
              }`}
              style={{ width: `${(activeParams / totalParams) * 100}%` }}
            />
          </div>

          <div className="text-[11px] text-slate-500 flex justify-between">
            <span>{isDenseMode ? "0% compute saved" : `${computeSavedPct}% compute saved!`}</span>
            <span className="text-emerald-700 font-bold">
              {isDenseMode ? "1x Speed (Standard)" : `${(totalParams / activeParams).toFixed(1)}x Faster & Cheaper`}
            </span>
          </div>
        </div>

        {/* The Dispatcher Insight */}
        <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 space-y-1.5 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
            <Zap className="w-3.5 h-3.5" />
            How Softmax Gating Works
          </div>
          <p className="text-[11px] text-emerald-900 leading-relaxed">
            The Router is a tiny neural network that takes the token vector and produces a probability distribution.
            Only the top {isDenseMode ? 8 : topK} scores receive input; the other {isDenseMode ? 0 : 8 - topK} experts are completely bypassed,
            consuming zero GPU arithmetic cycles!
          </p>
        </div>
      </div>

      {/* The 8 Experts Board & Live Routing Animation */}
      <div className="border border-slate-200 rounded-2xl bg-white p-6 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Live Dispatcher View</span>
            <h4 className="text-lg font-bold text-slate-900">
              Router Softmax Distribution for Current Token
            </h4>
          </div>
          <div className="text-xs font-mono text-slate-500">
            Prompt: <span className="text-slate-800 font-bold">"{currentPrompt.text.slice(0, 35)}..."</span>
          </div>
        </div>

        {/* 8 Experts Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {EXPERTS.map((expert) => {
            const score = scores[expert.id] || 0;
            const isActive = activeExpertIds.includes(expert.id);

            return (
              <div
                key={expert.id}
                className={`relative p-4 rounded-xl border-2 transition-all duration-300 flex flex-col justify-between ${
                  isActive
                    ? "border-emerald-500 bg-emerald-50/40 shadow-md ring-2 ring-emerald-100"
                    : "border-slate-200 bg-slate-50/40 opacity-45 grayscale-[40%]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{expert.icon}</span>
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {score}% router score
                    </span>
                  </div>

                  <h5 className="font-bold text-xs text-slate-900 leading-snug">{expert.name}</h5>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-0.5">
                    {expert.domain}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                    {expert.description}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  {isActive ? (
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE (Running)
                    </span>
                  ) : (
                    <span className="text-slate-400 font-medium">Sleeping (0 FLOPs)</span>
                  )}
                  <span className="font-mono text-slate-400 text-[10px]">6B Params</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dataflow diagram from Router to Output */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="text-xs uppercase font-mono tracking-wider text-slate-400">
            Step-by-step MoE Execution Pipeline
          </div>
          <div className="grid md:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 space-y-1">
              <span className="text-emerald-400 font-bold block">1. Token Input</span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Word token arrives from the Transformer attention layer.
              </p>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 space-y-1">
              <span className="text-emerald-400 font-bold block">2. Gating Network</span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Calculates dot product of token with expert embeddings to produce softmax scores.
              </p>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 space-y-1">
              <span className="text-emerald-400 font-bold block">3. Sparse Top-K Gate</span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Routes token only to the {topK} highest-scoring expert neural networks.
              </p>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 space-y-1">
              <span className="text-emerald-400 font-bold block">4. Weighted Sum</span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Combines expert outputs weighted by their gating probabilities to emit the next token!
              </p>
            </div>
          </div>
        </div>

        {/* Real-world models quote card */}
        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <strong className="text-slate-800 block mb-1">🔥 Why Mixtral 8x7B shocked the world (2023)</strong>
            Mistral released Mixtral 8x7B with 47B total parameters. But because it only routes 2 experts per token, it runs at the inference cost and speed of a tiny 13B model, while beating much larger dense models!
          </div>
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <strong className="text-slate-800 block mb-1">🚀 DeepSeek-V3 & GPT-4 Architecture</strong>
            DeepSeek-V3 uses 256 fine-grained experts, activating 8 per token with shared experts for common knowledge. This architecture drastically reduces training and serving costs for frontier reasoning.
          </div>
        </div>
      </div>
    </div>
  );
}
