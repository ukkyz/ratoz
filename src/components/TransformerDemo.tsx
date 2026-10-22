import { useState } from "react";
import { Sparkles, Eye, BookOpen } from "lucide-react";

type SentencePreset = {
  id: string;
  label: string;
  tokens: string[];
  attentionMaps: Record<
    string, // Head name
    Record<number, { targetIdx: number; weight: number; reason: string }[]>
  >;
};

const PRESETS: SentencePreset[] = [
  {
    id: "tired",
    label: "Winograd Schema A (Tired Animal)",
    tokens: ["The", "animal", "didn't", "cross", "the", "street", "because", "it", "was", "too", "tired"],
    attentionMaps: {
      "Coreference Head (Who is 'it'?)": {
        7: [
          { targetIdx: 1, weight: 0.88, reason: "'tired' applies to living creatures -> resolves to 'animal'" },
          { targetIdx: 5, weight: 0.08, reason: "Streets do not experience fatigue" },
          { targetIdx: 3, weight: 0.04, reason: "Action verb" },
        ],
        10: [
          { targetIdx: 1, weight: 0.74, reason: "Attribute connects to the subject 'animal'" },
          { targetIdx: 7, weight: 0.22, reason: "Direct predicate of pronoun 'it'" },
        ],
      },
      "Syntax & Action Head": {
        3: [
          { targetIdx: 1, weight: 0.65, reason: "Subject doing the action 'cross'" },
          { targetIdx: 5, weight: 0.31, reason: "Direct object being crossed" },
        ],
        7: [
          { targetIdx: 8, weight: 0.55, reason: "Subject-verb link to 'was'" },
          { targetIdx: 3, weight: 0.35, reason: "Action dependency" },
        ],
      },
    },
  },
  {
    id: "wide",
    label: "Winograd Schema B (Wide Street)",
    tokens: ["The", "animal", "didn't", "cross", "the", "street", "because", "it", "was", "too", "wide"],
    attentionMaps: {
      "Coreference Head (Who is 'it'?)": {
        7: [
          { targetIdx: 5, weight: 0.92, reason: "'wide' describes physical spans -> resolves to 'street'" },
          { targetIdx: 1, weight: 0.05, reason: "An animal is rarely described as too wide to cross" },
          { targetIdx: 3, weight: 0.03, reason: "Action verb" },
        ],
        10: [
          { targetIdx: 5, weight: 0.82, reason: "Attribute connects to the obstacle 'street'" },
          { targetIdx: 7, weight: 0.15, reason: "Direct predicate of pronoun 'it'" },
        ],
      },
      "Syntax & Action Head": {
        3: [
          { targetIdx: 1, weight: 0.62, reason: "Subject 'animal'" },
          { targetIdx: 5, weight: 0.34, reason: "Object 'street'" },
        ],
        7: [
          { targetIdx: 8, weight: 0.52, reason: "Subject-verb link to 'was'" },
          { targetIdx: 5, weight: 0.40, reason: "Obstacle link" },
        ],
      },
    },
  },
  {
    id: "bank_river",
    label: "Disambiguation (River Bank)",
    tokens: ["The", "fisherman", "sat", "on", "the", "grassy", "bank", "by", "the", "river"],
    attentionMaps: {
      "Coreference Head (Who is 'it'?)": {
        6: [
          { targetIdx: 9, weight: 0.78, reason: "River context clarifies 'bank' as shoreline, not money vault!" },
          { targetIdx: 5, weight: 0.16, reason: "'grassy' reinforces natural terrain" },
          { targetIdx: 1, weight: 0.06, reason: "Fisherman context" },
        ],
      },
      "Syntax & Action Head": {
        2: [
          { targetIdx: 1, weight: 0.58, reason: "Fisherman is the agent sitting" },
          { targetIdx: 6, weight: 0.36, reason: "Location where sitting occurred" },
        ],
        6: [
          { targetIdx: 5, weight: 0.50, reason: "Direct adjective modifying 'bank'" },
          { targetIdx: 9, weight: 0.45, reason: "Prepositional object 'river'" },
        ],
      },
    },
  },
];

export default function TransformerDemo() {
  const [presetIndex, setPresetIndex] = useState<number>(0);
  const activePreset = PRESETS[presetIndex];
  const headNames = Object.keys(activePreset.attentionMaps);
  const [selectedHead, setSelectedHead] = useState<string>(headNames[0] || "");
  const [selectedTokenIdx, setSelectedTokenIdx] = useState<number>(7); // Default to 'it' or focus word

  // Fallback if head changed
  const currentHead = activePreset.attentionMaps[selectedHead]
    ? selectedHead
    : headNames[0];

  const headData = activePreset.attentionMaps[currentHead] || {};
  const activeAttentionList = headData[selectedTokenIdx] || [];

  // QKV interactive step state
  const [qkvStep, setQkvStep] = useState<number>(1);

  return (
    <div className="space-y-8">
      {/* Concept Header */}
      <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-violet-600 text-white rounded-xl shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">The 2017 Breakthrough: Transformers & Attention</h3>
            <p className="text-slate-600 mt-1">
              Before 2017, AI processed language word-by-word like a human reading a line. By the time it reached word 50,
              it had forgotten word 1. The Transformer changed everything with <strong>Self-Attention</strong>:
              all words are processed <em>simultaneously</em>, and each word casts an "attention spotlight" onto every other word
              to figure out what it truly means in context.
            </p>
          </div>
        </div>
      </div>

      {/* Preset Selector */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
          Step 1: Choose a sentence with ambiguous words
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PRESETS.map((p, idx) => {
            const isSel = idx === presetIndex;
            return (
              <button
                key={p.id}
                onClick={() => {
                  setPresetIndex(idx);
                  const newHeads = Object.keys(p.attentionMaps);
                  setSelectedHead(newHeads[0]);
                  // pick first indexed token
                  const firstIdx = Object.keys(p.attentionMaps[newHeads[0]] || {})[0];
                  setSelectedTokenIdx(firstIdx !== undefined ? +firstIdx : 0);
                }}
                className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                  isSel
                    ? "border-violet-600 bg-violet-50/60 shadow-sm ring-2 ring-violet-200"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="font-bold text-xs text-slate-800">{p.label}</div>
                <div className="text-[11px] text-slate-500 mt-1 italic font-serif truncate">
                  "{p.tokens.join(" ")}"
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Attention Canvas */}
      <div className="border border-slate-200 rounded-2xl bg-white p-6 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold text-violet-600 uppercase tracking-widest">Interactive Attention Explorer</span>
            <h4 className="text-lg font-bold text-slate-900">
              Click any highlighted token to see what it pays attention to
            </h4>
          </div>
          {/* Head Picker */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold gap-1">
            {headNames.map((hName) => (
              <button
                key={hName}
                onClick={() => setSelectedHead(hName)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  currentHead === hName
                    ? "bg-white text-violet-700 shadow-sm font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {hName}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Token Ribbon */}
        <div>
          <div className="text-xs text-slate-500 mb-2 font-medium">
            Sentence Tokens (Click on <span className="text-violet-700 font-bold">purple tokens</span> to inspect attention spotlights):
          </div>
          <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
            {activePreset.tokens.map((token, idx) => {
              const isSource = idx === selectedTokenIdx;
              const hasAttentionData = Boolean(headData[idx]);
              const targetItem = activeAttentionList.find((item) => item.targetIdx === idx);
              const isTarget = Boolean(targetItem);

              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (hasAttentionData) setSelectedTokenIdx(idx);
                  }}
                  className={`relative px-3.5 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isSource
                      ? "bg-violet-600 text-white shadow-md ring-4 ring-violet-200 scale-105 font-bold"
                      : isTarget
                      ? "bg-amber-100 text-amber-900 border-2 border-amber-400 font-bold"
                      : hasAttentionData
                      ? "bg-white border-2 border-violet-300 text-violet-900 hover:bg-violet-50 cursor-pointer"
                      : "bg-white border border-slate-200 text-slate-600 cursor-default"
                  }`}
                >
                  <span>{token}</span>
                  {isSource && (
                    <span className="absolute -top-2 -right-1 px-1.5 py-0.2 bg-violet-900 text-white text-[9px] font-bold rounded-full">
                      Query
                    </span>
                  )}
                  {isTarget && targetItem && (
                    <span className="absolute -bottom-2 -right-1 px-1.5 py-0.2 bg-amber-600 text-white text-[9px] font-bold rounded-full">
                      {(targetItem.weight * 100).toFixed(0)}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Attention Connection Arc Breakdown */}
        {activeAttentionList.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6 bg-gradient-to-br from-violet-50/50 to-slate-50 p-5 rounded-xl border border-violet-100">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-violet-600" />
                <span className="text-sm font-bold text-slate-800">
                  Token "{activePreset.tokens[selectedTokenIdx]}" is looking at:
                </span>
              </div>
              <div className="space-y-2">
                {activeAttentionList.map((item, i) => (
                  <div key={i} className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">
                        "{activePreset.tokens[item.targetIdx]}"
                      </span>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-violet-100 text-violet-800">
                        Attention Weight: {(item.weight * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-violet-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${item.weight * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 leading-tight">{item.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Why This Matters Explainer */}
            <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-violet-100 text-violet-800 rounded-md text-xs font-bold mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Semantic Disambiguation
                </div>
                <h5 className="font-bold text-slate-800 text-sm mb-1">
                  How Attention Solves Common-Sense Logic
                </h5>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  Compare <strong>Preset A ("tired")</strong> vs <strong>Preset B ("wide")</strong>: the exact same pronoun{" "}
                  <code className="bg-slate-100 px-1 py-0.5 rounded font-bold text-violet-700">"it"</code> is used in both sentences!
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Traditional algorithms failed here because they had no common sense. But because the Transformer calculates
                  attention between all words simultaneously, the word "tired" automatically pulls the attention of "it" toward{" "}
                  <strong>"animal" (88%)</strong>, whereas "wide" pulls it toward <strong>"street" (92%)</strong>!
                </p>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 font-medium">
                💡 <strong>Multi-Head Attention:</strong> Models don't just use 1 attention map! GPT-4 uses over{" "}
                <strong>96 attention heads</strong> working in parallel: some track grammar, some track sentiment, some track quotes, and some track dates!
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-6 bg-slate-50 rounded-xl text-slate-500 text-sm">
            Click on a highlighted token above to inspect its attention links.
          </div>
        )}
      </div>

      {/* The Famous Q, K, V (Query, Key, Value) Engine */}
      <div className="border border-slate-200 rounded-2xl bg-white p-6 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-bold text-violet-600 uppercase tracking-widest">Under the Hood</span>
          <h4 className="text-xl font-bold text-slate-900 mt-0.5">
            How Attention is Calculated: The Q, K, V Metaphor
          </h4>
          <p className="text-slate-600 text-sm mt-1">
            Every token in a Transformer is converted into three distinct vectors: <strong>Query (Q)</strong>,{" "}
            <strong>Key (K)</strong>, and <strong>Value (V)</strong>. Think of it like a search engine or library lookup:
          </p>
        </div>

        {/* 3 Steps Interactive Card */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div
            onClick={() => setQkvStep(1)}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              qkvStep === 1
                ? "border-violet-600 bg-violet-50/50 shadow-md ring-2 ring-violet-200"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-violet-600 text-white font-bold flex items-center justify-center text-xs">
                Q
              </span>
              <span className="font-bold text-sm text-slate-900">1. Query</span>
            </div>
            <div className="text-xs text-slate-600">
              <strong>"What am I looking for?"</strong>
              <p className="mt-1 text-slate-500">
                Word "it" asks: <em>"Find a living entity that experienced this fatigue."</em>
              </p>
            </div>
          </div>

          <div
            onClick={() => setQkvStep(2)}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              qkvStep === 2
                ? "border-violet-600 bg-violet-50/50 shadow-md ring-2 ring-violet-200"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                K
              </span>
              <span className="font-bold text-sm text-slate-900">2. Key</span>
            </div>
            <div className="text-xs text-slate-600">
              <strong>"What label do I advertise?"</strong>
              <p className="mt-1 text-slate-500">
                Word "animal" says: <em>"I am a biological subject capable of tiredness."</em>
              </p>
            </div>
          </div>

          <div
            onClick={() => setQkvStep(3)}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              qkvStep === 3
                ? "border-violet-600 bg-violet-50/50 shadow-md ring-2 ring-violet-200"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                V
              </span>
              <span className="font-bold text-sm text-slate-900">3. Value</span>
            </div>
            <div className="text-xs text-slate-600">
              <strong>"What content do I transfer?"</strong>
              <p className="mt-1 text-slate-500">
                The actual rich representation blended into "it" to make its meaning concrete.
              </p>
            </div>
          </div>
        </div>

        {/* Step details */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 font-mono text-xs space-y-3">
          <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
            <span>The Mathematical Heart: Attention(Q, K, V) = Softmax( Q · Kᵀ / √dₖ ) × V</span>
            <span className="text-violet-400">Vaswani et al. 2017</span>
          </div>
          <div className="grid md:grid-cols-3 gap-4 pt-2">
            <div className="space-y-1">
              <span className="text-violet-400 font-bold block">1. Dot Product Match</span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Take the Query vector of word A and dot-multiply with the Key vectors of all other words. High score = high relevance.
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-indigo-400 font-bold block">2. Scale & Softmax</span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Divide by the square root of dimension size (to prevent exploding numbers), then apply softmax so all weights add up to 1.0 (100%).
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-emerald-400 font-bold block">3. Weighted Blend</span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Multiply each attention percentage by its corresponding Value vector and sum them up. Now word A knows its context!
              </p>
            </div>
          </div>
        </div>

        {/* Positional Encoding Note */}
        <div className="flex items-start gap-3 bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-900">
          <BookOpen className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold mb-0.5">Wait, how does it know word order? (Positional Encoding)</strong>
            Because Transformers process all words at once, the sentence <em>"Dog bites man"</em> would look identical to <em>"Man bites dog"</em>!
            To fix this, scientists add a special mathematical waveform (sine and cosine waves) to each token that stamps its exact position: #1, #2, #3, etc.
          </div>
        </div>
      </div>
    </div>
  );
}
