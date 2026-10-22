import { useState, useMemo } from "react";

function log2(x: number) { return Math.log(x) / Math.log(2); }

export default function EntropyDemo() {
  // Distribution over N categories
  const [N, setN] = useState(4);
  const [dist, setDist] = useState<number[]>([0.25, 0.25, 0.25, 0.25, 0.5, 0.1, 0.05, 0.05]);

  // Normalize dist to sum to 1 (keep first N)
  const normalized = useMemo(() => {
    const slice = dist.slice(0, N);
    const sum = slice.reduce((a, b) => a + b, 0) || 1;
    return slice.map((v) => v / sum);
  }, [dist, N]);

  const entropy = useMemo(() => {
    return normalized.reduce((sum, p) => (p > 0 ? sum - p * log2(p) : sum), 0);
  }, [normalized]);

  const maxEntropy = log2(N);

  // Kullback-Leibler divergence demo
  const [p, setP] = useState<number[]>([0.7, 0.3, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]);
  const [q, setQ] = useState<number[]>([0.5, 0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]);

  const normP = useMemo(() => {
    const slice = p.slice(0, N);
    const sum = slice.reduce((a, b) => a + b, 0) || 1;
    return slice.map((v) => v / sum);
  }, [p, N]);

  const normQ = useMemo(() => {
    const slice = q.slice(0, N);
    const sum = slice.reduce((a, b) => a + b, 0) || 1;
    return slice.map((v) => v / sum);
  }, [q, N]);

  const kl = useMemo(() => {
    return normP.reduce((sum, pi, i) => (pi > 0 && normQ[i] > 0 ? sum + pi * log2(pi / normQ[i]) : sum), 0);
  }, [normP, normQ]);

  const crossEntropy = useMemo(() => {
    return normP.reduce((sum, pi, i) => (pi > 0 && normQ[i] > 0 ? sum - pi * log2(normQ[i]) : sum), 0);
  }, [normP, normQ]);

  return (
    <div className="space-y-8">
      {/* Intro */}
      <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-rose-600 text-white rounded-xl shadow-md text-2xl">⚖️</div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Information Theory: Entropy, KL Divergence & Cross-Entropy</h3>
            <p className="text-slate-600 mt-1 text-sm leading-relaxed">
              Entropy measures uncertainty. KL divergence measures how far one distribution is from another.
              Cross-entropy is the objective function used to train almost every classification neural network.
              These aren't just abstract math—they're the loss functions in ChatGPT, AlphaFold, and self-driving cars.
            </p>
          </div>
        </div>
      </div>

      {/* Shannon Entropy Lab */}
      <div className="border border-slate-200 rounded-2xl bg-white p-6 shadow-sm space-y-5">
        <div>
          <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">Shannon Entropy</span>
          <h4 className="text-lg font-bold text-slate-900">Adjust the Probability Distribution</h4>
          <p className="text-xs text-slate-500 mt-0.5">Lower probability → higher uncertainty contribution. Uniform distribution = maximum entropy.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Number of categories N: <b className="text-rose-600">{N}</b></label>
              <input type="range" min={2} max={8} value={N} onChange={(e) => setN(+e.target.value)} className="w-full accent-rose-600" />
            </div>

            {/* Sliders for probabilities */}
            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-xs font-bold text-slate-700">Probability P(xᵢ)</div>
              {Array.from({ length: N }, (_, i) => (
                <label key={i} className="flex items-center gap-2 text-xs">
                  <span className="w-12 font-mono font-bold text-rose-700">P{i + 1}</span>
                  <input
                    type="range" min={0} max={1} step={0.05} value={dist[i]}
                    onChange={(e) => setDist((old) => { const n = [...old]; n[i] = +e.target.value; return n; })}
                    className="flex-1 accent-rose-600"
                  />
                  <span className="w-12 font-mono text-slate-500">{normalized[i].toFixed(2)}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {/* Entropy bars */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-xs font-bold text-slate-700 mb-3">Entropy per category: −Pᵢ·log₂(Pᵢ)</div>
              <div className="space-y-2">
                {normalized.map((pi, i) => {
                  const contribution = pi > 0 ? -pi * log2(pi) : 0;
                  const maxCont = maxEntropy / N;
                  const height = maxCont > 0 ? (contribution / maxCont) * 100 : 0;
                  return (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="w-12 font-mono font-bold text-slate-600">P{i + 1}</span>
                      <div className="flex-1 h-12 bg-slate-200 rounded-lg relative overflow-hidden">
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-rose-500 to-rose-400 rounded-lg" style={{ height: `${height}%` }} />
                      </div>
                      <span className="w-16 font-mono text-slate-500 text-right">{contribution.toFixed(3)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Entropy summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-rose-50 p-4 rounded-xl border border-rose-200">
                <div className="text-xs text-rose-700 font-bold uppercase">Total Entropy H(X)</div>
                <div className="text-2xl font-black text-rose-800">{entropy.toFixed(3)} <span className="text-sm">bits</span></div>
              </div>
              <div className="bg-pink-50 p-4 rounded-xl border border-pink-200">
                <div className="text-xs text-pink-700 font-bold uppercase">Max (uniform)</div>
                <div className="text-2xl font-black text-pink-800">{maxEntropy.toFixed(3)} <span className="text-sm">bits</span></div>
              </div>
            </div>
            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">
              {entropy >= maxEntropy - 0.01
                ? "✅ Uniform distribution achieves maximum entropy — every outcome is equally surprising."
                : `📉 This distribution has ${(1 - entropy / maxEntropy) * 100}% less entropy than uniform. Some outcomes are more predictable.`}
            </p>
          </div>
        </div>

        {/* Math */}
        <div className="bg-slate-900 text-rose-300 p-4 rounded-xl font-mono text-xs overflow-x-auto">
          <div className="text-slate-400 mb-1">// Shannon Entropy</div>
          <pre className="whitespace-pre-wrap">H(X) = − Σ<sub>i=1</sub><sup>N</sup> P(xᵢ) · log₂(P(xᵢ))</pre>
          <p className="text-slate-400 mt-2">💡 A biased coin (99% heads) has ~0.08 bits of entropy—almost no uncertainty. A fair coin has exactly 1 bit.</p>
        </div>
      </div>

      {/* KL Divergence & Cross-Entropy Lab */}
      <div className="border border-slate-200 rounded-2xl bg-white p-6 shadow-sm space-y-5">
        <div>
          <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">KL Divergence & Cross-Entropy</span>
          <h4 className="text-lg font-bold text-slate-900">Compare Two Distributions P vs Q</h4>
          <p className="text-xs text-slate-500 mt-0.5">P = true distribution, Q = model's guess. Cross-entropy = how wrong the model is. KL = how much the model is off by.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-xs font-bold text-slate-700 mb-2">P (True / Actual)</div>
              {Array.from({ length: N }, (_, i) => (
                <label key={i} className="flex items-center gap-2 text-xs">
                  <span className="w-12 font-mono font-bold text-rose-700">P{i + 1}</span>
                  <input type="range" min={0} max={1} step={0.05} value={p[i]}
                    onChange={(e) => setP((old) => { const n = [...old]; n[i] = +e.target.value; return n; })}
                    className="flex-1 accent-rose-600" />
                  <span className="w-12 font-mono text-slate-500">{normP[i].toFixed(2)}</span>
                </label>
              ))}
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-xs font-bold text-slate-700 mb-2">Q (Model's Guess)</div>
              {Array.from({ length: N }, (_, i) => (
                <label key={i} className="flex items-center gap-2 text-xs">
                  <span className="w-12 font-mono font-bold text-sky-700">Q{i + 1}</span>
                  <input type="range" min={0} max={1} step={0.05} value={q[i]}
                    onChange={(e) => setQ((old) => { const n = [...old]; n[i] = +e.target.value; return n; })}
                    className="flex-1 accent-sky-600" />
                  <span className="w-12 font-mono text-slate-500">{normQ[i].toFixed(2)}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {/* Visual comparison */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-700">Visual Comparison (P = rose, Q = sky)</div>
              <div className="flex items-end gap-1 h-20">
                {normP.map((pi, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end">
                    <div className="w-full bg-rose-500 rounded-t" style={{ height: `${pi * 100}%` }} title={`P${i + 1}=${pi}`} />
                  </div>
                ))}
              </div>
              <div className="flex items-end gap-1 h-20">
                {normQ.map((qi, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end">
                    <div className="w-full bg-sky-500 rounded-t" style={{ height: `${qi * 100}%` }} title={`Q${i + 1}=${qi}`} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span className="text-rose-600 font-bold">P (True)</span>
                <span className="text-sky-600 font-bold">Q (Model)</span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-rose-50 p-3 rounded-xl border border-rose-200">
                <div className="text-xs text-rose-700 font-bold uppercase">Cross-Entropy</div>
                <div className="text-lg font-black text-rose-800">{crossEntropy.toFixed(3)}</div>
              </div>
              <div className="bg-sky-50 p-3 rounded-xl border border-sky-200">
                <div className="text-xs text-sky-700 font-bold uppercase">KL Divergence</div>
                <div className="text-lg font-black text-sky-800">{kl.toFixed(3)}</div>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                <div className="text-xs text-emerald-700 font-bold uppercase">H(P)</div>
                <div className="text-lg font-black text-emerald-800">{normP.reduce((s, pi) => pi > 0 ? s - pi * log2(pi) : s, 0).toFixed(3)}</div>
              </div>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">
              {kl < 0.01
                ? "✅ P ≈ Q — the model's distribution matches reality!"
                : `📉 KL divergence = ${kl.toFixed(3)} bits. The model needs to adjust its probabilities to reduce this loss.`}
            </p>
          </div>
        </div>

        {/* Math */}
        <div className="bg-slate-900 text-sky-300 p-4 rounded-xl font-mono text-xs overflow-x-auto">
          <div className="text-slate-400 mb-1">// Cross-Entropy & KL Divergence</div>
          <pre className="whitespace-pre-wrap">H(P, Q) = − Σ P(x) · log₂(Q(x))
D<sub>KL</sub>(P‖Q) = Σ P(x) · log₂(P(x)/Q(x)) = H(P,Q) − H(P)</pre>
          <p className="text-slate-400 mt-2">💡 Cross-entropy is the standard loss for classification networks. The model minimizes H(P,Q) by pushing Q closer to P. KL divergence is always ≥ 0 (Gibbs' inequality).</p>
        </div>
      </div>
    </div>
  );
}
