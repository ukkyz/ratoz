import { useState, useRef, useEffect, useCallback } from "react";

type Preset = { name: string; amp: (k: number) => number; phase: (k: number) => number };

const PRESETS: Preset[] = [
  { name: "Square", amp: (k) => (k % 2 === 1 ? 4 / Math.PI / k : 0), phase: () => 0 },
  { name: "Triangle", amp: (k) => (k % 2 === 1 ? 8 / (Math.PI ** 2 * k ** 2) : 0), phase: () => 0 },
  { name: "Sawtooth", amp: (k) => 2 / (Math.PI * k), phase: (k) => (k % 2 === 0 ? Math.PI : 0) },
  { name: "Sine", amp: (k) => (k === 1 ? 1 : 0), phase: () => 0 },
];

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

function reconstruct(X: Complex[], cutoff: number, pass: "low" | "high", N: number): number[] {
  const out = new Array(N);
  const mean = X[0].re / N;
  for (let n = 0; n < N; n++) {
    let y = mean;
    for (let k = 1; k < N; k++) {
      const keep = pass === "low" ? k <= cutoff : k > cutoff;
      if (!keep) continue;
      const ang = 2 * Math.PI * k * n / N;
      y += (X[k].re * Math.cos(ang) - X[k].im * Math.sin(ang)) / N;
    }
    out[n] = y;
  }
  return out;
}

function normalize(signal: number[]): number[] {
  const N = signal.length;
  const mean = signal.reduce((a, b) => a + b, 0) / N;
  const maxAbs = Math.max(0.001, ...signal.map((v) => Math.abs(v - mean)));
  return signal.map((v) => (v - mean) / maxAbs);
}

export default function FourierPlayground() {
  const [presetIdx, setPresetIdx] = useState(0);
  const [N, setN] = useState(8);
  const [freq, setFreq] = useState(1);
  const [amps, setAmps] = useState<number[]>(Array(10).fill(0));
  const [phases, setPhases] = useState<number[]>(Array(6).fill(0));

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const specRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const p = PRESETS[presetIdx];
    setAmps(Array.from({ length: 10 }, (_, k) => p.amp(k + 1)));
    setPhases(Array.from({ length: 6 }, (_, k) => p.phase(k + 1)));
  }, [presetIdx]);

  const getAmp = (k: number) => (k <= N ? amps[k - 1] || 0 : 0);
  const getPhase = (k: number) => (k <= 6 ? phases[k - 1] || 0 : 0);

  const drawWave = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);
    const cy = H / 2;
    let maxSum = 0;
    for (let k = 1; k <= N; k++) maxSum += Math.abs(getAmp(k));
    if (maxSum === 0) maxSum = 1;
    const scale = (cy - 34) / maxSum;

    ctx.strokeStyle = "#e5e7eb"; ctx.lineWidth = 1;
    for (let i = 0; i <= 8; i++) { const x = (i / 8) * W; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.strokeStyle = "#9ca3af"; ctx.stroke();

    ctx.strokeStyle = "#4f46e5"; ctx.lineWidth = 2.5; ctx.beginPath();
    for (let x = 0; x < W; x++) {
      const t = x / W;
      let y = 0;
      for (let k = 1; k <= N; k++) y += getAmp(k) * Math.sin(2 * Math.PI * k * freq * t + getPhase(k));
      const py = cy - y * scale;
      if (x === 0) ctx.moveTo(x, py); else ctx.lineTo(x, py);
    }
    ctx.stroke();

    if (presetIdx === 0) {
      const ov = 1.0895;
      ctx.strokeStyle = "#ef4444"; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(0, cy - ov * scale); ctx.lineTo(W, cy - ov * scale); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, cy + ov * scale); ctx.lineTo(W, cy + ov * scale); ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [N, freq, amps, phases, presetIdx]);

  useEffect(() => { drawWave(); }, [drawWave]);

  useEffect(() => {
    const c = specRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);
    const bars = Array.from({ length: 10 }, (_, i) => Math.abs(getAmp(i + 1)));
    const max = Math.max(0.001, ...bars);
    const bw = W / 10;
    for (let i = 0; i < 10; i++) {
      const h = (bars[i] / max) * (H - 24);
      ctx.fillStyle = i < N ? "#6366f1" : "#e5e7eb";
      ctx.fillRect(i * bw + 3, H - h - 12, bw - 6, h);
      ctx.fillStyle = "#6b7280"; ctx.font = "10px monospace";
      ctx.fillText(`${i + 1}`, i * bw + bw / 2 - 3, H - 2);
    }
  }, [N, amps]);

  const terms = Array.from({ length: Math.min(4, N) }, (_, i) => {
    const k = i + 1;
    const a = getAmp(k);
    const ph = getPhase(k);
    return `${a.toFixed(2)}·sin(2π·${k}·${freq}·t${ph !== 0 ? `+${ph.toFixed(2)}` : ""})`;
  });
  const math = `f(t) = ${terms.join(" + ")}${N > 4 ? " + …" : ""}`;

  // ---- Draw your own wave + DFT ----
  const [showDraw, setShowDraw] = useState(false);
  const [cutoff, setCutoff] = useState(8);
  const [passType, setPassType] = useState<"low" | "high">("low");
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const resCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawSpecRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const points = useRef<{ x: number; y: number }[]>([]);
  const [spectrum, setSpectrum] = useState<number[] | null>(null);
  const [filtered, setFiltered] = useState<number[] | null>(null);
  const [original, setOriginal] = useState<number[] | null>(null);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return { x: ((clientX - rect.left) / rect.width) * canvas.width, y: ((clientY - rect.top) / rect.height) * canvas.height };
  };

  const onDown = (e: React.MouseEvent | React.TouchEvent) => {
    drawing.current = true;
    points.current = [];
    const c = drawCanvasRef.current!;
    const p = getPos(e, c);
    points.current.push(p);
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.strokeStyle = "#4f46e5"; ctx.lineWidth = 3; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y); ctx.stroke();
  };
  const onMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current) return;
    const c = drawCanvasRef.current!;
    const p = getPos(e, c);
    points.current.push(p);
    const ctx = c.getContext("2d")!;
    ctx.beginPath();
    const last = points.current[points.current.length - 2];
    ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke();
  };
  const onUp = () => {
    if (!drawing.current) return;
    drawing.current = false;
    const pts = points.current;
    const N = 128;
    const ptsSorted = pts.slice().sort((a, b) => a.x - b.x);
    const xs = ptsSorted.map((p) => p.x);
    const minX = xs[0], maxX = xs[xs.length - 1];
    const yAt = (x: number) => {
      if (x <= minX) return ptsSorted[0].y;
      if (x >= maxX) return ptsSorted[ptsSorted.length - 1].y;
      for (let i = 0; i < ptsSorted.length - 1; i++) {
        if (x >= ptsSorted[i].x && x <= ptsSorted[i + 1].x) {
          const t = (x - ptsSorted[i].x) / (ptsSorted[i + 1].x - ptsSorted[i].x);
          return ptsSorted[i].y * (1 - t) + ptsSorted[i + 1].y * t;
        }
      }
      return ptsSorted[0].y;
    };
    const signal = Array.from({ length: N }, (_, i) => yAt(minX + ((maxX - minX) * i) / (N - 1)));
    const norm = normalize(signal);
    setOriginal(norm);
    const X = dft(norm);
    const mags = X.map((c) => Math.sqrt(c.re ** 2 + c.im ** 2) / N);
    setSpectrum(mags.slice(0, 32));
    const rec = reconstruct(X, cutoff, passType, N);
    setFiltered(rec);
  };

  useEffect(() => {
    const c = resCanvasRef.current;
    if (!c || !filtered || !original) return;
    const ctx = c.getContext("2d")!;
    const W = c.width, H = c.height, cy = H / 2;
    ctx.clearRect(0, 0, W, H);

    ctx.strokeStyle = "#9ca3af"; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let i = 0; i < original.length; i++) {
      const x = (i / (original.length - 1)) * W;
      const py = cy - original[i] * (cy - 10);
      if (i === 0) ctx.moveTo(x, py); else ctx.lineTo(x, py);
    }
    ctx.stroke();

    ctx.strokeStyle = "#4f46e5"; ctx.lineWidth = 2.5; ctx.beginPath();
    for (let i = 0; i < filtered.length; i++) {
      const x = (i / (filtered.length - 1)) * W;
      const py = cy - filtered[i] * (cy - 10);
      if (i === 0) ctx.moveTo(x, py); else ctx.lineTo(x, py);
    }
    ctx.stroke();
  }, [filtered, original]);

  useEffect(() => {
    if (!spectrum) return;
    const c = drawSpecRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);
    const max = Math.max(0.001, ...spectrum);
    const bw = W / spectrum.length;
    for (let i = 0; i < spectrum.length; i++) {
      const h = (spectrum[i] / max) * (H - 20);
      ctx.fillStyle = passType === "low" ? (i < cutoff ? "#6366f1" : "#e5e7eb") : (i >= cutoff ? "#6366f1" : "#e5e7eb");
      ctx.fillRect(i * bw, H - h - 14, bw - 1, h);
    }
  }, [spectrum, cutoff, passType]);

  return (
    <div className="space-y-8">
      {/* Intro */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-md text-2xl">🌊</div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">The Fourier Transform: Time ↔ Frequency</h3>
            <p className="text-slate-600 mt-1 text-sm leading-relaxed">
              Any periodic signal—no matter how complex—can be decomposed into a sum of pure sine waves.
              This is the mathematics behind JPEG compression, MP3 audio, Wi-Fi, and how AI models process sound and images.
              Move the sliders to build waves from their harmonic building blocks.
            </p>
          </div>
        </div>
      </div>

      {/* Main playground */}
      <div className="border border-slate-200 rounded-2xl bg-white p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Harmonic Synthesis</span>
            <h4 className="text-lg font-bold text-slate-900">Build a Wave from Sine Harmonics</h4>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold gap-1">
            {PRESETS.map((p, i) => (
              <button
                key={p.name}
                onClick={() => setPresetIdx(i)}
                className={`px-3 py-1.5 rounded-lg transition-all ${presetIdx === i ? "bg-white text-indigo-700 shadow-xs font-bold" : "text-slate-600"}`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <canvas ref={canvasRef} width={600} height={260} className="w-full rounded-xl border border-slate-200 bg-slate-50" />
            <p className="text-xs text-slate-500 mt-2">Time domain. The red dashed lines mark the theoretical <b>Gibbs overshoot (~8.95%)</b> near sharp corners.</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Number of harmonics N: <b className="text-indigo-600">{N}</b></label>
              <input type="range" min={1} max={20} value={N} onChange={(e) => setN(+e.target.value)} className="w-full accent-indigo-600" />
              <p className="text-xs text-slate-500 mt-0.5">A square wave needs infinitely many harmonics (1/k amplitudes) for perfect corners.</p>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Base frequency f₀: <b className="text-indigo-600">{freq}</b></label>
              <input type="range" min={0.5} max={4} step={0.1} value={freq} onChange={(e) => setFreq(+e.target.value)} className="w-full accent-indigo-600" />
            </div>
            <div className="bg-slate-900 text-emerald-300 p-4 rounded-xl font-mono text-xs overflow-x-auto">
              <div className="text-slate-400 mb-1">// Live Fourier Series</div>
              <pre className="text-emerald-300 whitespace-pre-wrap">{math}</pre>
            </div>
          </div>
        </div>

        {/* Amplitude & phase sliders */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="text-xs font-bold text-slate-700 mb-2">Amplitudes A₁…A₈ (uses N={N})</div>
            <div className="space-y-1.5">
              {Array.from({ length: 8 }, (_, i) => (
                <label key={i} className="flex items-center gap-2 text-xs">
                  <span className="w-8 font-mono font-bold text-indigo-700">A{i + 1}</span>
                  <input
                    type="range" min={-1} max={1} step={0.01} value={amps[i] || 0}
                    onChange={(e) => setAmps((old) => { const n = [...old]; n[i] = +e.target.value; return n; })}
                    className="flex-1 accent-indigo-600"
                  />
                  <span className="w-10 font-mono text-slate-500">{(amps[i] || 0).toFixed(2)}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="text-xs font-bold text-slate-700 mb-2">Phases φ₁…φ₄ (radians)</div>
            <div className="space-y-1.5">
              {Array.from({ length: 4 }, (_, i) => (
                <label key={i} className="flex items-center gap-2 text-xs">
                  <span className="w-8 font-mono font-bold text-purple-700">φ{i + 1}</span>
                  <input
                    type="range" min={-Math.PI} max={Math.PI} step={0.05} value={phases[i] || 0}
                    onChange={(e) => setPhases((old) => { const n = [...old]; n[i] = +e.target.value; return n; })}
                    className="flex-1 accent-purple-600"
                  />
                  <span className="w-10 font-mono text-slate-500">{(phases[i] || 0).toFixed(2)}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Spectrum */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-bold text-slate-700 mb-2">Frequency Spectrum |X(k)| (k = 1…10)</div>
          <canvas ref={specRef} width={600} height={120} className="w-full rounded-xl border border-slate-200" />
        </div>

        {/* Math equations */}
        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 font-mono text-indigo-900">
            <strong>Fourier Series:</strong> f(t) = Σ<sub>k=1</sub><sup>∞</sup> A<sub>k</sub>·sin(2πkf₀t + φ<sub>k</sub>)
          </div>
          <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 font-mono text-purple-900">
            <strong>Gibbs Phenomenon:</strong> Truncation overshoot ≈ 8.95% at discontinuities
          </div>
        </div>
      </div>

      {/* Draw your own */}
      <div className="border border-slate-200 rounded-2xl bg-white p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Interactive DFT</span>
            <h4 className="text-lg font-bold text-slate-900">Draw Any Wave → See Its Fourier Spectrum</h4>
          </div>
          <button
            onClick={() => setShowDraw((s) => !s)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs"
          >
            {showDraw ? "Hide" : "Show DFT Lab"}
          </button>
        </div>

        {showDraw && (
          <div className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-2">1. Draw a periodic wave</div>
                <canvas
                  ref={drawCanvasRef}
                  width={500}
                  height={160}
                  onMouseDown={onDown}
                  onMouseMove={onMove}
                  onMouseUp={onUp}
                  onMouseLeave={onUp}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 touch-none"
                />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-2">2. Frequency spectrum (DFT)</div>
                <canvas ref={drawSpecRef} width={500} height={160} className="w-full rounded-xl border border-slate-200 bg-slate-50" />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cutoff k: <b className="text-indigo-600">{cutoff}</b></label>
                <input type="range" min={1} max={32} value={cutoff} onChange={(e) => setCutoff(+e.target.value)} className="w-full accent-indigo-600" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Filter type</label>
                <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
                  <button onClick={() => setPassType("low")} className={`py-1 rounded ${passType === "low" ? "bg-white text-indigo-700 font-bold shadow-xs" : "text-slate-600"}`}>Low-pass</button>
                  <button onClick={() => setPassType("high")} className={`py-1 rounded ${passType === "high" ? "bg-white text-indigo-700 font-bold shadow-xs" : "text-slate-600"}`}>High-pass</button>
                </div>
              </div>
              <div className="text-xs text-slate-500 self-end pb-2">
                {passType === "low" ? "Keep frequencies ≤ cutoff (smooths sharp edges)" : "Keep frequencies > cutoff (extracts rapid changes)"}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-600 mb-2">3. Reconstructed wave (gray = original, blue = filtered)</div>
              <canvas ref={resCanvasRef} width={500} height={180} className="w-full rounded-xl border border-slate-200 bg-slate-50" />
            </div>

            <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto">
              <div className="text-slate-400 mb-1">// Discrete Fourier Transform (DFT)</div>
              <pre className="whitespace-pre-wrap">X[k] = Σ<sub>n=0</sub><sup>N−1</sup> x[n] · e<sup>−2πi·k·n/N</sup>
x̂[n] = (1/N) Σ<sub>k=0</sub><sup>N−1</sup> X[k] · e<sup>2πi·k·n/N</sup></pre>
              <p className="text-slate-400 mt-2">💡 Try drawing a sharp square wave and apply low-pass with cutoff 3 — you'll see the Gibbs ripples smooth out.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
