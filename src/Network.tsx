import { useEffect, useRef, useState } from "react";

type Pt = { x: number; y: number; c: number };
const datasets: Record<string, () => Pt[]> = {
  "XOR (corners)": () =>
    Array.from({ length: 200 }, () => {
      const x = Math.random() * 2 - 1, y = Math.random() * 2 - 1;
      return { x, y, c: x * y > 0 ? 1 : 0 };
    }),
  "Circle": () =>
    Array.from({ length: 200 }, () => {
      const x = Math.random() * 2 - 1, y = Math.random() * 2 - 1;
      return { x, y, c: x * x + y * y < 0.4 ? 1 : 0 };
    }),
  "Straight line": () =>
    Array.from({ length: 200 }, () => {
      const x = Math.random() * 2 - 1, y = Math.random() * 2 - 1;
      return { x, y, c: y > x * 0.5 ? 1 : 0 };
    }),
};

const rnd = () => Math.random() * 2 - 1;
function makeNet(h: number) {
  return {
    w1: Array.from({ length: h }, () => [rnd(), rnd()]),
    b1: Array.from({ length: h }, () => 0),
    w2: Array.from({ length: h }, rnd),
    b2: 0,
  };
}
type Net = ReturnType<typeof makeNet>;
const sig = (z: number) => 1 / (1 + Math.exp(-z));
function forward(n: Net, x: number, y: number) {
  const h = n.w1.map((w, i) => Math.tanh(w[0] * x + w[1] * y + n.b1[i]));
  const o = sig(h.reduce((s, v, i) => s + v * n.w2[i], n.b2));
  return { h, o };
}
function step(n: Net, data: Pt[], lr: number) {
  let loss = 0;
  for (const p of data) {
    const { h, o } = forward(n, p.x, p.y);
    loss += -(p.c * Math.log(o + 1e-9) + (1 - p.c) * Math.log(1 - o + 1e-9));
    const d = o - p.c;
    for (let i = 0; i < h.length; i++) {
      const dh = d * n.w2[i] * (1 - h[i] * h[i]);
      n.w2[i] -= lr * d * h[i];
      n.w1[i][0] -= lr * dh * p.x;
      n.w1[i][1] -= lr * dh * p.y;
      n.b1[i] -= lr * dh;
    }
    n.b2 -= lr * d;
  }
  return loss / data.length;
}

export default function Network() {
  const [ds, setDs] = useState("XOR (corners)");
  const [hidden, setHidden] = useState(4);
  const [lr, setLr] = useState(0.05);
  const [running, setRunning] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [losses, setLosses] = useState<number[]>([]);
  const data = useRef<Pt[]>(datasets[ds]());
  const net = useRef<Net>(makeNet(hidden));
  const canvas = useRef<HTMLCanvasElement>(null);

  const reset = () => {
    net.current = makeNet(hidden);
    setEpoch(0); setLosses([]); draw();
  };
  useEffect(() => { data.current = datasets[ds](); reset(); }, [ds, hidden]);

  function draw() {
    const c = canvas.current; if (!c) return;
    const g = c.getContext("2d")!; const S = c.width, cell = 8;
    for (let i = 0; i < S; i += cell) for (let j = 0; j < S; j += cell) {
      const o = forward(net.current, (i / S) * 2 - 1, 1 - (j / S) * 2).o;
      g.fillStyle = `rgb(${255 - o * 120},${200 + o * 30},${140 + o * 115})`;
      g.fillRect(i, j, cell, cell);
    }
    for (const p of data.current) {
      g.beginPath(); g.arc((p.x + 1) / 2 * S, (1 - p.y) / 2 * S, 4, 0, 7);
      g.fillStyle = p.c ? "#2563eb" : "#ea580c"; g.fill();
      g.strokeStyle = "#fff"; g.stroke();
    }
  }

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      let l = 0;
      for (let k = 0; k < 5; k++) l = step(net.current, data.current, lr);
      setEpoch(e => e + 5);
      setLosses(ls => [...ls.slice(-99), l]);
      draw();
    }, 50);
    return () => clearInterval(id);
  }, [running, lr]);

  const acc = data.current.filter(p => (forward(net.current, p.x, p.y).o > 0.5 ? 1 : 0) === p.c).length / data.current.length;
  const maxL = Math.max(0.01, ...losses);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <canvas ref={canvas} width={360} height={360} className="rounded-xl shadow w-full max-w-[360px]" />
        <p className="text-sm text-slate-500 mt-2">Blue and orange dots are examples. The background color shows what the network guesses for every spot.</p>
      </div>
      <div className="space-y-4">
        <label className="block">Problem to learn
          <select value={ds} onChange={e => setDs(e.target.value)} className="block w-full border rounded p-2 mt-1">
            {Object.keys(datasets).map(k => <option key={k}>{k}</option>)}
          </select>
        </label>
        <label className="block">Hidden neurons (brain size): <b>{hidden}</b>
          <input type="range" min={1} max={12} value={hidden} onChange={e => setHidden(+e.target.value)} className="w-full" />
        </label>
        <label className="block">Learning rate (step size): <b>{lr}</b>
          <input type="range" min={0.005} max={0.3} step={0.005} value={lr} onChange={e => setLr(+e.target.value)} className="w-full" />
        </label>
        <div className="flex gap-2">
          <button onClick={() => setRunning(r => !r)} className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold">{running ? "⏸ Pause" : "▶ Train"}</button>
          <button onClick={reset} className="px-4 py-2 rounded-lg bg-slate-200">↺ Reset</button>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <Stat label="Epochs" v={epoch} />
          <Stat label="Loss (error)" v={losses.length ? losses[losses.length - 1].toFixed(3) : "–"} />
          <Stat label="Accuracy" v={(acc * 100).toFixed(0) + "%"} />
        </div>
        <svg viewBox="0 0 100 40" className="w-full h-24 bg-slate-50 rounded border">
          <polyline fill="none" stroke="#4f46e5" strokeWidth="0.8"
            points={losses.map((l, i) => `${i},${40 - (l / maxL) * 38}`).join(" ")} />
        </svg>
        <p className="text-sm text-slate-600">💡 Try it: set hidden neurons to <b>1</b> on XOR. It can't solve it, because one neuron can only draw a straight line. That's the same limit that caused the first "AI winter" in 1969!</p>
      </div>
    </div>
  );
}
const Stat = ({ label, v }: { label: string; v: any }) => (
  <div className="bg-indigo-50 rounded-lg p-2"><div className="text-xs text-slate-500">{label}</div><div className="font-bold text-lg">{v}</div></div>
);
