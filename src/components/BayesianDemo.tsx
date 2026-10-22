import { useState, useMemo } from "react";

export default function BayesianDemo() {
  const [prior, setPrior] = useState(0.5);
  const [sensitivity, setSensitivity] = useState(0.9);
  const [specificity, setSpecificity] = useState(0.95);

  const likelihoodTrue = sensitivity; // P(+|H₁)
  const likelihoodFalse = 1 - specificity; // P(+|H₀)

  const evidence = prior * likelihoodTrue + (1 - prior) * likelihoodFalse;
  const posterior = (prior * likelihoodTrue) / (evidence || 1);

  // Visualize with a bar chart
  const barData = [
    { label: "P(H₁) Prior", value: prior, color: "bg-indigo-500" },
    { label: "P(+|H₁) Likelihood", value: likelihoodTrue, color: "bg-purple-500" },
    { label: "P(+|H₀) 1−Specificity", value: likelihoodFalse, color: "bg-rose-500" },
    { label: "P(+) Evidence", value: evidence, color: "bg-amber-500" },
    { label: "P(H₁|+) Posterior", value: posterior, color: "bg-emerald-500" },
  ];

  // Diagnostic matrix
  const [tn, tp, fp, fn] = useMemo(() => {
    // simulate 10,000 people
    const n = 10000;
    const diseased = Math.round(prior * n);
    const healthy = n - diseased;
    const tp = Math.round(diseased * sensitivity);
    const fn = diseased - tp;
    const fp = Math.round(healthy * (1 - specificity));
    const tn = healthy - fp;
    return [tn, tp, fp, fn];
  }, [prior, sensitivity, specificity]);

  return (
    <div className="space-y-8">
      {/* Intro */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-600 text-white rounded-xl shadow-md text-2xl">🧮</div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Bayesian Inference: Prior × Likelihood = Posterior</h3>
            <p className="text-slate-600 mt-1 text-sm leading-relaxed">
              Bayes' theorem lets us update our beliefs when new evidence arrives. It's the math behind spam filters,
              medical diagnostics, recommendation engines, and A/B testing. The formula is beautifully simple:
              <strong> posterior = prior × likelihood / evidence</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Lab */}
      <div className="border border-slate-200 rounded-2xl bg-white p-6 shadow-sm space-y-5">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Bayes' Theorem Lab</span>
          <h4 className="text-lg font-bold text-slate-900">Medical Diagnostic Scenario</h4>
          <p className="text-xs text-slate-500 mt-0.5">A disease affects a fraction of the population. A test has certain sensitivity and specificity. If you test positive, what's the probability you actually have the disease?</p>
        </div>

        {/* Sliders */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Prior P(disease): <b className="text-blue-600">{(prior * 100).toFixed(1)}%</b></label>
            <input type="range" min={0.001} max={0.5} step={0.001} value={prior} onChange={(e) => setPrior(+e.target.value)} className="w-full accent-blue-600" />
            <p className="text-[11px] text-slate-500 mt-1">Base rate of the disease in the population.</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Sensitivity P(+|disease): <b className="text-purple-600">{(sensitivity * 100).toFixed(0)}%</b></label>
            <input type="range" min={0.5} max={1} step={0.01} value={sensitivity} onChange={(e) => setSensitivity(+e.target.value)} className="w-full accent-purple-600" />
            <p className="text-[11px] text-slate-500 mt-1">True positive rate — among diseased, how many test positive.</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Specificity P(−|healthy): <b className="text-rose-600">{(specificity * 100).toFixed(0)}%</b></label>
            <input type="range" min={0.5} max={1} step={0.01} value={specificity} onChange={(e) => setSpecificity(+e.target.value)} className="w-full accent-rose-600" />
            <p className="text-[11px] text-slate-500 mt-1">True negative rate — among healthy, how many test negative.</p>
          </div>
        </div>

        {/* Visualization bars */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
          <div className="text-xs font-bold text-slate-700">Bayes' Theorem Components</div>
          {barData.map((b) => (
            <div key={b.label} className="flex items-center gap-2 text-xs">
              <span className="w-48 font-mono font-bold text-slate-600">{b.label}</span>
              <div className="flex-1 h-8 bg-slate-200 rounded-lg relative overflow-hidden">
                <div className={`absolute bottom-0 left-0 right-0 ${b.color} rounded-lg`} style={{ height: `${b.value * 100}%` }} />
              </div>
              <span className="w-16 font-mono text-slate-500 text-right">{(b.value * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>

        {/* Posterior highlight */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-200 text-center">
            <div className="text-xs font-bold text-emerald-700 uppercase">Posterior P(disease|+)</div>
            <div className="text-4xl font-black text-emerald-800">{(posterior * 100).toFixed(1)}%</div>
            <p className="text-xs text-emerald-600 mt-1">After testing positive</p>
          </div>
          <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-200 text-center">
            <div className="text-xs font-bold text-indigo-700 uppercase">Prior P(disease)</div>
            <div className="text-4xl font-black text-indigo-800">{(prior * 100).toFixed(1)}%</div>
            <p className="text-xs text-indigo-600 mt-1">Before testing</p>
          </div>
        </div>

        {/* Diagnostic matrix */}
        <div className="bg-slate-900 text-white p-4 rounded-xl font-mono text-xs">
          <div className="text-slate-400 mb-2">// Confusion Matrix (10,000 people simulated)</div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-800 p-2 rounded-lg"><div className="text-slate-400 text-[10px]">Predicted +</div><div className="text-amber-400 font-bold text-sm">{fp + tp}</div></div>
            <div className="bg-slate-800 p-2 rounded-lg"><div className="text-slate-400 text-[10px]">Predicted −</div><div className="text-sky-400 font-bold text-sm">{tn + fn}</div></div>
            <div className="bg-slate-800 p-2 rounded-lg"><div className="text-slate-400 text-[10px]">Total</div><div className="text-slate-300 font-bold text-sm">10000</div></div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2 text-center">
            <div className="bg-slate-800 p-2 rounded-lg"><div className="text-slate-400 text-[10px]">True Diseased</div><div className="text-purple-400 font-bold text-sm">{tp + fn}</div></div>
            <div className="bg-slate-800 p-2 rounded-lg"><div className="text-slate-400 text-[10px]">True Healthy</div><div className="text-green-400 font-bold text-sm">{fp + tn}</div></div>
            <div className="bg-slate-800 p-2 rounded-lg"><div className="text-slate-400 text-[10px]">Actual Pos</div><div className="text-emerald-400 font-bold text-sm">{(posterior * 100).toFixed(1)}%</div></div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="bg-amber-900/50 p-2 rounded-lg text-center"><div className="text-amber-300 text-[10px]">TP (True Pos)</div><div className="text-amber-200 font-bold text-sm">{tp}</div></div>
            <div className="bg-rose-900/50 p-2 rounded-lg text-center"><div className="text-rose-300 text-[10px]">FP (False Pos)</div><div className="text-rose-200 font-bold text-sm">{fp}</div></div>
            <div className="bg-green-900/50 p-2 rounded-lg text-center"><div className="text-green-300 text-[10px]">TN (True Neg)</div><div className="text-green-200 font-bold text-sm">{tn}</div></div>
            <div className="bg-slate-700 p-2 rounded-lg text-center"><div className="text-slate-300 text-[10px]">FN (False Neg)</div><div className="text-slate-200 font-bold text-sm">{fn}</div></div>
          </div>
        </div>

        {/* Math */}
        <div className="bg-slate-900 text-blue-300 p-4 rounded-xl font-mono text-xs overflow-x-auto">
          <div className="text-slate-400 mb-1">// Bayes' Theorem</div>
          <pre className="whitespace-pre-wrap">P(H₁|evidence) = P(evidence|H₁) · P(H₁) / P(evidence)

P(+|disease) = sensitivity
P(+|healthy) = 1 − specificity
P(+) = P(+|disease)·P(disease) + P(+|healthy)·P(healthy)</pre>
          <p className="text-slate-400 mt-2">💡 Even with 90% sensitivity and 95% specificity, if the disease affects only 1% of people, a positive test still means only ~16% chance of actually having it! The base rate dominates.</p>
        </div>
      </div>
    </div>
  );
}
