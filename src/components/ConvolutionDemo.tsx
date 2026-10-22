import { useState, useRef, useEffect, useCallback } from "react";

type Kernel = { name: string; matrix: number[][]; desc: string };

const KERNELS: Kernel[] = [
  { name: "Identity (no change)", matrix: [[0, 0, 0], [0, 1, 0], [0, 0, 0]], desc: "Center weight = 1, all neighbors = 0" },
  { name: "Gaussian Blur", matrix: [[1, 2, 1], [2, 4, 2], [1, 2, 1]], desc: "Weighted average of neighbors → smooths noise" },
  { name: "Sharpen", matrix: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]], desc: "Boosts center, subtracts neighbors → edges pop" },
  { name: "Edge Detect (Laplacian)", matrix: [[0, 1, 0], [1, -4, 1], [0, 1, 0]], desc: "Sums neighbors, subtracts center → highlights discontinuities" },
  { name: "Emboss", matrix: [[-2, -1, 0], [-1, 1, 1], [0, 1, 2]], desc: "Directional gradient → 3D relief lighting effect" },
  { name: "Sobel X (vertical edge)", matrix: [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], desc: "Detects horizontal gradients (left/right edges)" },
];

export default function ConvolutionDemo() {
  const [kernelIdx, setKernelIdx] = useState(0);
  const kernel = KERNELS[kernelIdx];
  const [stride, setStride] = useState(1);
  const [padding, setPadding] = useState(1);

  const imgSize = 8; // 8x8 grayscale image
  const [img] = useState<number[][]>(() => {
    const arr: number[][] = [];
    for (let y = 0; y < imgSize; y++) {
      const row: number[] = [];
      for (let x = 0; x < imgSize; x++) {
        // Draw a circle pattern
        const dx = x - imgSize / 2 + 0.5, dy = y - imgSize / 2 + 0.5;
        row.push(Math.sqrt(dx * dx + dy * dy) < 2.5 ? 200 : 40);
      }
      arr.push(row);
    }
    return arr;
  });

  const imgCanvas = useRef<HTMLCanvasElement>(null);
  const convCanvas = useRef<HTMLCanvasElement>(null);

  const drawImg = useCallback(() => {
    const c = imgCanvas.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const cell = c.width / imgSize;
    ctx.clearRect(0, 0, c.width, c.height);
    for (let y = 0; y < imgSize; y++) {
      for (let x = 0; x < imgSize; x++) {
        const g = Math.max(0, Math.min(255, img[y][x]));
        ctx.fillStyle = `rgb(${g}, ${g}, ${g})`;
        ctx.fillRect(x * cell, y * cell, cell, cell);
      }
    }
  }, [img]);

  useEffect(() => { drawImg(); }, [drawImg]);

  const convolve = () => {
    const out: number[][] = [];
    const k = kernel.matrix;
    const ks = k.length;
    const pad = padding;
    const st = stride;
    const ow = Math.floor((imgSize + 2 * pad - ks) / st) + 1;
    const oh = ow;
    for (let oy = 0; oy < oh; oy++) {
      const row: number[] = [];
      for (let ox = 0; ox < ow; ox++) {
        let sum = 0;
        for (let ky = 0; ky < ks; ky++) {
          for (let kx = 0; kx < ks; kx++) {
            const iy = oy * st - pad + ky;
            const ix = ox * st - pad + kx;
            if (iy >= 0 && iy < imgSize && ix >= 0 && ix < imgSize) {
              sum += img[iy][ix] * k[ky][kx];
            }
          }
        }
        row.push(sum);
      }
      out.push(row);
    }
    return out;
  };

  const convImg = convolve();

  const drawConv = useCallback(() => {
    const c = convCanvas.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const cell = c.width / convImg.length;
    ctx.clearRect(0, 0, c.width, c.height);
    // normalize
    let min = Infinity, max = -Infinity;
    for (const row of convImg) for (const v of row) { if (v < min) min = v; if (v > max) max = v; }
    for (let y = 0; y < convImg.length; y++) {
      for (let x = 0; x < convImg[y].length; x++) {
        const v = convImg[y][x];
        const norm = max > min ? (v - min) / (max - min) : 0.5;
        const g = Math.round(norm * 255);
        ctx.fillStyle = `rgb(${g}, ${g}, ${g})`;
        ctx.fillRect(x * cell, y * cell, cell, cell);
      }
    }
  }, [convImg]);

  useEffect(() => { drawConv(); }, [drawConv]);

  return (
    <div className="space-y-8">
      {/* Intro */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-100 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-teal-600 text-white rounded-xl shadow-md text-2xl">🎯</div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Convolution: The Math Behind Image AI</h3>
            <p className="text-slate-600 mt-1 text-sm leading-relaxed">
              Convolution is how Computer Vision networks "see": a small sliding window (kernel) multiplies against
              the image pixels it covers, producing a feature map. This is exactly how filters (blur, sharpen, edge detect)
              work in photo editors—and how CNNs detect edges, then textures, then shapes, then objects.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Lab */}
      <div className="border border-slate-200 rounded-2xl bg-white p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">2D Convolution Lab</span>
            <h4 className="text-lg font-bold text-slate-900">Slide a Kernel Over an Image</h4>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold gap-1 flex-wrap">
            {KERNELS.map((k, i) => (
              <button
                key={k.name}
                onClick={() => setKernelIdx(i)}
                className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${kernelIdx === i ? "bg-white text-teal-700 shadow-xs font-bold" : "text-slate-600"}`}
              >
                {k.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Kernel display */}
        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-bold text-slate-700 w-48">Kernel (3×3 weights):</div>
          <div className="grid grid-cols-3 gap-1">
            {kernel.matrix.flat().map((v, i) => {
              const intensity = Math.abs(v) / 2;
              return (
                <div
                  key={i}
                  className="w-14 h-14 flex items-center justify-center rounded-lg font-mono font-bold text-sm"
                  style={{ background: `rgb(${Math.round(100 + intensity * 155)}, ${Math.round(100 - intensity * 80)}, ${Math.round(100 - intensity * 60)})` }}
                >
                  {v}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-slate-500 flex-1">{kernel.desc}</p>
        </div>

        {/* Image comparison */}
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <div className="text-xs font-bold text-slate-700 mb-2">Input Image ({imgSize}×{imgSize})</div>
            <canvas ref={imgCanvas} width={240} height={240} className="w-full rounded-xl border border-slate-200 bg-slate-50" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-700 mb-2">Feature Map (after convolution)</div>
            <canvas ref={convCanvas} width={240} height={240} className="w-full rounded-xl border border-slate-200 bg-slate-50" />
          </div>
        </div>

        {/* Controls */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Stride: <b className="text-teal-600">{stride}</b></label>
            <input type="range" min={1} max={2} value={stride} onChange={(e) => setStride(+e.target.value)} className="w-full accent-teal-600" />
            <p className="text-[11px] text-slate-500 mt-1">How many pixels the window slides each step.</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Padding: <b className="text-teal-600">{padding}</b></label>
            <input type="range" min={0} max={2} value={padding} onChange={(e) => setPadding(+e.target.value)} className="w-full accent-teal-600" />
            <p className="text-[11px] text-slate-500 mt-1">Zero-padding around the image border.</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Output size: {convImg.length}×{convImg.length}</label>
            <p className="text-[11px] text-slate-500 mt-1">Out = ⌊(I + 2P − K)/S⌋ + 1</p>
          </div>
        </div>

        {/* Math */}
        <div className="bg-slate-900 text-teal-300 p-4 rounded-xl font-mono text-xs overflow-x-auto">
          <div className="text-slate-400 mb-1">// 2D Discrete Convolution</div>
          <pre className="whitespace-pre-wrap">(f * g)[y,x] = Σ<sub>i</sub> Σ<sub>j</sub> f[i,j] · g[y−i, x−j]</pre>
          <p className="text-slate-400 mt-2">💡 CNNs use <b>cross-correlation</b> (no flipping) — but the math is identical in spirit. Each kernel layer is a "feature detector". Stack them → deep CNNs!</p>
        </div>
      </div>
    </div>
  );
}
