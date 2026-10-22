import { useState, useRef, useEffect, useCallback } from "react";

const GRID = 8;
type Cell = { wall: boolean; reward: number };

function makeMaze(_seed: number): Cell[][] {
  const grid: Cell[][] = [];
  for (let y = 0; y < GRID; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < GRID; x++) {
      row.push({ wall: false, reward: 0 });
    }
    grid.push(row);
  }
  // walls (simple pattern)
  const walls = [
    [3, 3], [3, 4], [3, 5], [4, 3], [4, 4], [4, 5],
    [1, 1], [1, 2], [2, 1], [5, 6], [5, 7], [6, 6], [7, 5],
    [0, 3], [0, 4], [0, 5], [7, 0], [7, 1], [7, 2],
  ];
  for (const [y, x] of walls) grid[y][x].wall = true;
  // rewards
  grid[7][7].reward = 10; // goal
  grid[0][0].reward = -1; // start penalty
  return grid;
}

const ACTIONS = [
  { name: "↑", dy: -1, dx: 0 },
  { name: "→", dy: 0, dx: 1 },
  { name: "↓", dy: 1, dx: 0 },
  { name: "←", dy: 0, dx: -1 },
];

export default function QLearningDemo() {
  const [lr, setLr] = useState(0.5);
  const [gamma, setGamma] = useState(0.9);
  const [epsilon, setEpsilon] = useState(0.2);
  const [running, setRunning] = useState(false);
  const [episodes, setEpisodes] = useState(0);
  const [bestReward, setBestReward] = useState(-Infinity);
  const [rewardHistory, setRewardHistory] = useState<number[]>([]);

  const grid = useRef<Cell[][]>(makeMaze(0));
  const initQTable = () => Array.from({ length: GRID }, () => Array.from({ length: GRID }, () => [0, 0, 0, 0]));
  const qTable = useRef<number[][][]>(initQTable());
  const pos = useRef({ y: 0, x: 0 });
  const done = useRef(false);
  const rewards = useRef<number[]>([]);

  const reset = () => {
    pos.current = { y: 0, x: 0 };
    done.current = false;
  };

  const step = () => {
    if (done.current) reset();
    const { y, x } = pos.current;
    // epsilon-greedy
    const exploit = Math.random() > epsilon;
    let actionIdx = 0;
    if (exploit) {
      let best = -Infinity;
      for (let a = 0; a < 4; a++) {
        if (qTable.current[y][x][a] > best) { best = qTable.current[y][x][a]; actionIdx = a; }
      }
    } else {
      actionIdx = Math.floor(Math.random() * 4);
    }

    const action = ACTIONS[actionIdx];
    const ny = Math.max(0, Math.min(GRID - 1, y + action.dy));
    const nx = Math.max(0, Math.min(GRID - 1, x + action.dx));

    let reward = -1;
    let newDone = false;
    if (grid.current[ny][nx].wall) {
      // stay in place
      reward = -2;
    } else if (grid.current[ny][nx].reward === 10) {
      reward = 10;
      newDone = true;
    } else {
      reward = grid.current[ny][nx].reward;
    }

    // Q-learning update
    if (!newDone) {
      let maxNext = -Infinity;
      for (let a = 0; a < 4; a++) {
        if (qTable.current[ny][nx][a] > maxNext) maxNext = qTable.current[ny][nx][a];
      }
      qTable.current[y][x][actionIdx] += lr * (reward + gamma * maxNext - qTable.current[y][x][actionIdx]);
    } else {
      qTable.current[y][x][actionIdx] += lr * (reward - qTable.current[y][x][actionIdx]);
    }

    pos.current = { y: ny, x: nx };
    done.current = newDone;
    rewards.current.push(reward);

    if (newDone) {
      setEpisodes((e) => e + 1);
      const epReward = rewards.current.reduce((a, b) => a + b, 0);
      rewards.current = [];
      setBestReward((b) => Math.max(b, epReward));
      setRewardHistory((h) => [...h.slice(-49), epReward]);
      reset();
    }
  };

  // Auto-run loop
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      step();
    }, 200);
    return () => clearInterval(id);
  }, [running, lr, gamma, epsilon]);

  const gridCanvas = useRef<HTMLCanvasElement>(null);

  const drawGrid = useCallback(() => {
    const c = gridCanvas.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const cell = c.width / GRID;
    ctx.clearRect(0, 0, c.width, c.height);
    for (let y = 0; y < GRID; y++) {
      for (let x = 0; x < GRID; x++) {
        const g = grid.current[y][x];
        if (g.wall) {
          ctx.fillStyle = "#334155";
        } else if (g.reward === 10) {
          ctx.fillStyle = "#dcfce7";
        } else if (g.reward === -1) {
          ctx.fillStyle = "#fee2e2";
        } else {
          ctx.fillStyle = "#f1f5f9";
        }
        ctx.fillRect(x * cell, y * cell, cell, cell);
        ctx.strokeStyle = "#e2e8f0";
        ctx.strokeRect(x * cell, y * cell, cell, cell);

        // Q-values in corner
        const qs = qTable.current[y][x];
        const maxQ = Math.max(...qs);
        if (maxQ > 0.1) {
          ctx.fillStyle = "#6366f1";
          ctx.font = `${Math.max(8, cell / 5)}px monospace`;
          ctx.fillText(`${maxQ.toFixed(1)}`, x * cell + 2, y * cell + 10);
        }
      }
    }
    // Agent
    const { y, x } = pos.current;
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(x * cell + cell / 2, y * cell + cell / 2, cell / 3, 0, Math.PI * 2);
    ctx.fill();
  }, [qTable]);

  useEffect(() => { drawGrid(); }, [drawGrid]);

  // Redraw when pos/done changes
  useEffect(() => { drawGrid(); }, [pos, done, episodes]);

  return (
    <div className="space-y-8">
      {/* Intro */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-md text-2xl">🎮</div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Reinforcement Learning: Q-Learning Agent</h3>
            <p className="text-slate-600 mt-1 text-sm leading-relaxed">
              An agent learns by trial and error in an environment. It picks actions (up/right/down/left), receives rewards,
              and updates its Q-table (the expected value of each state-action pair) using the Bellman equation.
              This is how AlphaGo, self-driving cars, and robots learn to navigate.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Lab */}
      <div className="border border-slate-200 rounded-2xl bg-white p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Q-Learning Gridworld</span>
            <h4 className="text-lg font-bold text-slate-900">Train an Agent to Navigate a Maze</h4>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setRunning((r) => !r)}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${running ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-700"}`}
            >
              {running ? "⏸ Pause" : "▶ Train"}
            </button>
            <button
              onClick={() => { qTable.current = Array.from({ length: GRID }, () => Array.from({ length: GRID }, () => [0, 0, 0, 0])); setEpisodes(0); setRewardHistory([]); setBestReward(-Infinity); reset(); }}
              className="px-4 py-2 rounded-xl font-bold text-sm bg-slate-200 text-slate-700"
            >
              ↺ Reset
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="text-xs font-bold text-slate-700 mb-2">Grid (red dot = agent, green = goal, gray = wall)</div>
            <canvas ref={gridCanvas} width={320} height={320} className="w-full max-w-[320px] rounded-xl border border-slate-200 bg-slate-50" />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Learning rate α: <b className="text-emerald-600">{lr}</b></label>
              <input type="range" min={0.05} max={1} step={0.05} value={lr} onChange={(e) => setLr(+e.target.value)} className="w-full accent-emerald-600" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Discount γ: <b className="text-emerald-600">{gamma}</b></label>
              <input type="range" min={0} max={0.99} step={0.01} value={gamma} onChange={(e) => setGamma(+e.target.value)} className="w-full accent-emerald-600" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Exploration ε: <b className="text-emerald-600">{epsilon}</b></label>
              <input type="range" min={0} max={0.9} step={0.05} value={epsilon} onChange={(e) => setEpsilon(+e.target.value)} className="w-full accent-emerald-600" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Stat label="Episodes" v={episodes} />
              <Stat label="Best Reward" v={bestReward === -Infinity ? "–" : bestReward} />
            </div>
          </div>
        </div>

        {/* Reward history chart */}
        {rewardHistory.length > 0 && (
          <div>
            <div className="text-xs font-bold text-slate-700 mb-2">Episode Reward History (last 50)</div>
            <svg viewBox="0 0 100 30" className="w-full h-24 bg-slate-50 rounded-xl border">
              <line x1="0" y1="30" x2="100" y2="30" stroke="#cbd5e1" strokeWidth="0.3" />
              <polyline fill="none" stroke="#10b981" strokeWidth="0.5"
                points={rewardHistory.map((r, i) => `${(i / (rewardHistory.length - 1)) * 100},${30 - (r / 10) * 30}`).join(" ")} />
            </svg>
          </div>
        )}

        {/* Math */}
        <div className="bg-slate-900 text-emerald-300 p-4 rounded-xl font-mono text-xs overflow-x-auto">
          <div className="text-slate-400 mb-1">// Q-Learning Update (Bellman Equation)</div>
          <pre className="whitespace-pre-wrap">Q(s,a) ← Q(s,a) + α · [ r + γ·max<sub>a'</sub> Q(s',a') − Q(s,a) ]</pre>
          <p className="text-slate-400 mt-2">💡 High ε = explore more. High γ = cares about future rewards. The agent learns the optimal policy by balancing exploration vs exploitation.</p>
        </div>
      </div>
    </div>
  );
}

const Stat = ({ label, v }: { label: string; v: any }) => (
  <div className="bg-emerald-50 rounded-lg p-2"><div className="text-xs text-slate-500">{label}</div><div className="font-bold text-lg">{v}</div></div>
);
