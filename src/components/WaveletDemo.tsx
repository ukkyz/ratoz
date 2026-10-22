import { useState, useRef, useEffect, useCallback } from "react";

type Complex = { re: number; im: number };

function dft(x: number[]): Complex[] {
  const N = x.length;
  const X: Complex[] = [];
  for (let k = 0; k < N; k++) {
    let re = 0, im = 0;
    for (let n = 0; n < N; n++) {
      const ang = -2 * Math.PI * k * n / N;
      re += x[n] * Math.cos(ang);
      im += x[n] * Math.sin(ang);
    }
    X.push({ re, im });
  }
  return X;
}

type SignalType = "sine" | "square" | "noise" | "sawtooth";

function buildSignal(type: SignalType, N: number): number[] {
  const out = new Array(N);
  for (let i = 0; i < N; i++) {
    const t = i / N;
    switch (type) {
      case "sine": out[i] = Math.sin(2 * Math.PI * 4 * t); break;
      case "square": out[i] = Math.sin(2 * Math.PI * 4 * t) > 0 ? 1 : -1; break;
      case "sawtooth": out[i] = 2 * (t * 4 - Math.floor(t * 4 + 0.5)); break;
      case "noise": out[i] = Math.sin(2 * Math.PI * 4 * t) + (Math.random() - 0.5) * 1.5; break;
    }
  }
  return out;
}

export default function WaveletDemo() {
  const N = 64;
  const [signalType, setSignalType] = useState<SignalType>("sine");
  const [level, setLevel] = useState(3);
  const [threshold, setThreshold] = useState(0.3);
  const [showNoise, setShowNoise] = useState(false);

  const signal = useRef(buildSignal(signalType, N));
  const sigCanvas = useRef<HTMLCanvasElement>(null);
  const specCanvas = useRef<HTMLCanvasElement>(null);
  const wavCanvas = useRef<HTMLCanvasElement>(null);
  const recCanvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    signal.current = buildSignal(signalType, N);
  }, [signalType]);

  // Haar wavelet transform (1D)
  const haarTransform = (arr: number[], lvl: number): { approx: number[][]; detail: number[][] } => {
    let current = arr.slice();
    const approx: number[][] = [current];
    const detail: number[][] = [];
    let n = current.length;
    for (let l = 0; l < lvl; l++) {
      if (n < 2) break;
      const half = n / 2;
      const a = new Array(half), d = new Array(half);
      for (let i = 0; i < half; i++) {
        a[i] = (current[2 * i] + current[2 * i + 1]) / Math.SQRT2;
        d[i] = (current[2 * i] - current[2 * i + 1]) / Math.SQRT2;
      }
      approx.push(a);
      detail.push(d);
      current = a;
      n = half;
    }
    return { approx, detail };
  };

  const haarReconstruct = (approx: number[][], detail: number[][]) => {
    let current = approx[approx.length - 1].slice();
    for (let l = detail.length - 1; l >= 0; l--) {
      const a = current, d = detail[l];
      const n = a.length * 2;
      current = new Array(n);
      for (let i = 0; i < a.length; i++) {
        current[2 * i] = (a[i] + d[i]) / Math.SQRT2;
        current[2 * i + 1] = (a[i] - d[i]) / Math.SQRT2;
      }
    }
    return current;
  };

  const { approx, detail } = haarTransform(signal.current, level);
  const denoisedDetail = detail.map((d, i) => i === detail.length - 1 ? d.map(v => Math.abs(v) > threshold ? v : 0) : d);
  const rec = haarReconstruct(approx, denoisedDetail);

  const drawSignal = useCallback(() => {
    const c = sigCanvas.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const W = c.width, H = c.height, cy = H / 2;
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "#e5e7eb"; ctx.lineWidth = 1;
    for (let i = 0; i <= 8; i++) { const x = (i / 8) * W; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.strokeStyle = "#9ca3af"; ctx.stroke();
    ctx.strokeStyle = "#4f46e5"; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const x = (i / (N - 1)) * W;
      const py = cy - signal.current[i] * (cy - 10);
      if (i === 0) ctx.moveTo(x, py); else ctx.lineTo(x, py);
    }
    ctx.stroke();
  }, [signalType]);

  useEffect(() => { drawSignal(); }, [drawSignal]);

  const drawSpec = useCallback(() => {
    const c = specCanvas.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);
    const X = dft(signal.current);
    const mags = X.slice(0, 32).map((c2) => Math.sqrt(c2.re ** 2 + c2.im ** 2) / N);
    const max = Math.max(0.001, ...mags);
    const bw = W / mags.length;
    for (let i = 0; i < mags.length; i++) {
      const h = (mags[i] / max) * (H - 24);
      ctx.fillStyle = i < level * 2 + 1 ? "#f59e0b" : "#e5e7eb";
      ctx.fillRect(i * bw, H - h - 12, bw - 1, h);
    }
  }, [signalType, level]);

  useEffect(() => { drawSpec(); }, [drawSpec]);

  const drawWavelets = useCallback(() => {
    const c = wavCanvas.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);
    const numWavelets = 4;
    for (let w = 0; w < numWavelets; w++) {
      const cy = H * (w + 0.5) / numWavelets;
      const scale = 0.15 * H / 2;
      const amp = detail[detail.length - 1 - w] || approx[approx.length - 1];
      const len = amp.length;
      ctx.strokeStyle = `hsl(${w * 55}, 70%, 55%)`; ctx.lineWidth = 1.8; ctx.beginPath();
      for (let i = 0; i < len; i++) {
        const px = w * W / numWavelets + (i / (len - 1)) * (W / numWavelets);
        const py = cy - amp[i] * scale;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  }, [detail, approx]);

  useEffect(() => { drawWavelets(); }, [drawWavelets]);

  const drawRec = useCallback(() => {
    const c = recCanvas.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const W = c.width, H = c.height, cy = H / 2;
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "#e5e7eb"; ctx.lineWidth = 1;
    for (let i = 0; i <= 8; i++) { const x = (i / 8) * W; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.strokeStyle = "#9ca3af"; ctx.stroke();
    ctx.strokeStyle = "#10b981"; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const x = (i / (N - 1)) * W;
      const py = cy - rec[i] * (cy - 10);
      if (i === 0) ctx.moveTo(x, py); else ctx.lineTo(x, py);
    }
    ctx.stroke();
  }, [rec]);

  useEffect(() => { drawRec(); }, [drawRec]);

  return (
    <div className="space-y-8">
      {/* Intro */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-600 text-white rounded-xl shadow-md text-2xl">🔬</div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Wavelet Transform: Local Time-Frequency Analysis</h3>
            <p className="text-slate-600 mt-1 text-sm leading-relaxed">
              While the Fourier Transform shows <em>which</em> frequencies exist, it loses <em>where</em> they occur.
              Wavelets (like Haar or Daubechy) use short, localized "window" functions that slide across the signal,
              preserving both time and frequency information. This is how JPEG 2000, MP3, and audio denoising actually work!
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Lab */}
      <div className="border border-slate-200 rounded-2xl bg-white p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Haar Wavelet Lab</span>
            <h4 className="text-lg font-bold text-slate-900">Decompose → Threshold → Reconstruct</h4>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold gap-1">
            {(["sine", "square", "noise", "sawtooth"] as SignalType[]).map((t) => (
              <button
                key={t}
                onClick={() => setSignalType(t)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all ${signalType === t ? "bg-white text-amber-700 shadow-xs font-bold" : "text-slate-600"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <div className="text-xs font-bold text-slate-700 mb-2">1. Original Signal</div>
            <canvas ref={sigCanvas} width={500} height={160} className="w-full rounded-xl border border-slate-200 bg-slate-50" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-700 mb-2">2. Reconstructed (after thresholding)</div>
            <canvas ref={recCanvas} width={500} height={160} className="w-full rounded-xl border border-slate-200 bg-slate-50" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <div className="text-xs font-bold text-slate-700 mb-2">3. Fourier Spectrum (global — no timing)</div>
            <canvas ref={specCanvas} width={500} height={120} className="w-full rounded-xl border border-slate-200 bg-slate-50" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-700 mb-2">4. Wavelet Detail Coefficients (local windows)</div>
            <canvas ref={wavCanvas} width={500} height={160} className="w-full rounded-xl border border-slate-200 bg-slate-50" />
          </div>
        </div>

        {/* Controls */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Decomposition Level: <b className="text-amber-600">{level}</b></label>
            <input type="range" min={1} max={5} value={level} onChange={(e) => setLevel(+e.target.value)} className="w-full accent-amber-600" />
            <p className="text-[11px] text-slate-500 mt-1">Each level halves the resolution and doubles the frequency localization.</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Threshold (denoise): <b className="text-amber-600">{threshold.toFixed(2)}</b></label>
            <input type="range" min={0} max={1.5} step={0.05} value={threshold} onChange={(e) => setThreshold(+e.target.value)} className="w-full accent-amber-600" />
            <p className="text-[11px] text-slate-500 mt-1">Zero out small detail coefficients to remove noise.</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Show noise added to signal</label>
            <button
              onClick={() => { setShowNoise((s) => !s); setSignalType("noise"); }}
              className={`w-full py-2 px-3 rounded-lg text-xs font-bold border transition-all ${showNoise ? "bg-amber-500 text-white border-amber-600" : "bg-slate-100 text-slate-700 border-slate-300"}`}
            >
              {showNoise ? "Noise ON" : "Noise OFF"}
            </button>
            <p className="text-[11px] text-slate-500 mt-1">Random noise spikes high-frequency details.</p>
          </div>
        </div>

        {/* Math */}
        <div className="bg-slate-900 text-amber-300 p-4 rounded-xl font-mono text-xs overflow-x-auto">
          <div className="text-slate-400 mb-1">// Haar Wavelet Transform</div>
          <pre className="whitespace-pre-wrap">approx[i] = (x[2i] + x[2i+1]) / √2
detail[i] = (x[2i] − x[2i+1]) / √2

reconstruct:  x̂[2i] = (a[i] + d[i]) / √2
              x̂[2i+1] = (a[i] − d[i]) / √2</pre>
          <p className="text-slate-400 mt-2">💡 With threshold 0.5, the noise signal's spikes (high detail coefficients) are preserved, while smooth sine regions collapse to zero.</p>
        </div>
      </div>
    </div>
  );
}
