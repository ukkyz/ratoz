import { useState, useRef, useEffect, useCallback } from "react";

export default function OverfittingDemo() {
  const [degree, setDegree] = useState(3);
  const [lambda, setLambda] = useState(0);
  const [showTest, setShowTest] = useState(true);
  const [regType, setRegType] = useState<"none" | "l2" | "l1">("none");

  // Generate training data
  const trainX = useRef<number[]>([]);
  const trainY = useRef<number[]>([]);
  const testX = useRef<number[]>([]);
  const testY = useRef<number[]>([]);

  const generateData = useCallback(() => {
    const trueFn = (x: number) => Math.sin(2 * Math.PI * x) * 0.5 + 0.5 * x;
    const trainXs: number[] = [], trainYs: number[] = [];
    for (let i = 0; i < 12; i++) {
      const x = i / 11;
      const noise = (Math.random() - 0.5) * 0.15;
      trainXs.push(x);
      trainYs.push(trueFn(x) + noise);
    }
    trainX.current = trainXs;
    trainY.current = trainYs;

    const testXs: number[] = [], testYs: number[] = [];
    for (let i = 0; i < 40; i++) {
      const x = i / 39;
      testXs.push(x);
      testYs.push(trueFn(x));
    }
    testX.current = testXs;
    testY.current = testYs;
  }, []);

  useEffect(() => { generateData(); }, [generateData]);

  // Polynomial regression with regularization
  const fitPolynomial = (xs: number[], ys: number[], deg: number, reg: number, type: "none" | "l2" | "l1"): number[] => {
    const n = xs.length;
    const d = deg + 1;
    // Build Vandermonde matrix X
    const X: number[][] = [];
    for (let i = 0; i < n; i++) {
      const row: number[] = [];
      let pow = 1;
      for (let j = 0; j < d; j++) { row.push(pow); pow *= xs[i]; }
      X.push(row);
    }
    // Solve normal equations: (XᵀX + λI)θ = Xᵀy
    // For L1, use simple iterative soft-thresholding
    if (type === "l1" && reg > 0) {
      // Coordinate descent for L1
      const theta = new Array(d).fill(0);
      for (let iter = 0; iter < 500; iter++) {
        for (let j = 0; j < d; j++) {
          const residual = ys.map((yi) => yi - xs.reduce((s, x, k) => s + x ** j * theta[k], 0));
          const grad = residual.reduce((s, r, i) => s + r * xs[i] ** j, 0) / n;
          theta[j] = softThreshold(grad, reg / n);
        }
      }
      return theta;
    }

    // Normal equations for L2 or none
    const XtX: number[][] = Array.from({ length: d }, () => new Array(d).fill(0));
    const Xty: number[] = new Array(d).fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < d; j++) {
        Xty[j] += X[i][j] * ys[i];
        for (let k = 0; k < d; k++) {
          XtX[j][k] += X[i][j] * X[i][k];
        }
      }
    }
    if (reg > 0 && type === "l2") {
      for (let j = 0; j < d; j++) XtX[j][j] += reg;
    }
    // Gaussian elimination
    const A = XtX.map((r, i) => [...r, Xty[i]]);
    for (let i = 0; i < d; i++) {
      let maxRow = i;
      for (let k = i + 1; k < d; k++) if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) maxRow = k;
      [A[i], A[maxRow]] = [A[maxRow], A[i]];
      for (let k = i + 1; k < d; k++) {
        const f = A[k][i] / A[i][i];
        for (let j = i; j <= d; j++) A[k][j] -= f * A[i][j];
      }
    }
    const theta = new Array(d).fill(0);
    for (let i = d - 1; i >= 0; i--) {
      theta[i] = A[i][d];
      for (let j = i + 1; j < d; j++) theta[i] -= A[i][j] * theta[j];
      theta[i] /= A[i][i];
    }
    return theta;
  };

  const softThreshold = (v: number, t: number) => {
    if (v > t) return v - t;
    if (v < -t) return v + t;
    return 0;
  };

  const evalPoly = (theta: number[], x: number): number => {
    let y = 0;
    let pow = 1;
    for (let i = 0; i < theta.length; i++) { y += theta[i] * pow; pow *= x; }
    return y;
  };

  const theta = fitPolynomial(trainX.current, trainY.current, degree, lambda, regType);

  // Compute metrics
  const trainRMSE = Math.sqrt(trainX.current.reduce((s, x, i) => {
    const y = evalPoly(theta, x);
    return s + (y - trainY.current[i]) ** 2;
  }, 0) / trainX.current.length);

  const testRMSE = Math.sqrt(testX.current.reduce((s, x, i) => {
    const y = evalPoly(theta, x);
    return s + (y - testY.current[i]) ** 2;
  }, 0) / testX.current.length);

  // Plot
  const plotCanvas = useRef<HTMLCanvasElement>(null);

  const drawPlot = useCallback(() => {
    const c = plotCanvas.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);
    const pad = 30;

    // Background
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = "#e2e8f0"; ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = pad + (i / 10) * (W - 2 * pad);
      ctx.beginPath(); ctx.moveTo(x, pad); ctx.lineTo(x, H - pad); ctx.stroke();
      const y = pad + (i / 10) * (H - 2 * pad);
      ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W - pad, y); ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = "#475569"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(pad, H - pad); ctx.lineTo(W - pad, H - pad); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pad, pad); ctx.lineTo(pad, H - pad); ctx.stroke();

    // Labels
    ctx.fillStyle = "#64748b"; ctx.font = "10px sans-serif";
    ctx.fillText("x", W - pad + 8, H - pad + 5);
    ctx.fillText("y", pad - 5, pad - 8);
    ctx.fillText("0", pad - 8, H - pad + 14);
    ctx.fillText("1", W - pad - 5, H - pad + 14);

    // True function (dashed)
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]);
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
      const x = i / 100;
      const px = pad + x * (W - 2 * pad);
      const py = H - pad - (Math.sin(2 * Math.PI * x) * 0.5 + 0.5 * x) * (H - 2 * pad);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke(); ctx.setLineDash([]);

    // Fitted curve
    ctx.strokeStyle = "#4f46e5"; ctx.lineWidth = 2.5; ctx.beginPath();
    for (let i = 0; i <= 200; i++) {
      const x = i / 200;
      const px = pad + x * (W - 2 * pad);
      const py = H - pad - evalPoly(theta, x) * (H - 2 * pad);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Training points
    ctx.fillStyle = "#4f46e5";
    for (let i = 0; i < trainX.current.length; i++) {
      const px = pad + trainX.current[i] * (W - 2 * pad);
      const py = H - pad - trainY.current[i] * (H - 2 * pad);
      ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "white"; ctx.lineWidth = 1.5; ctx.stroke();
    }

    // Test points (if shown)
    if (showTest) {
      ctx.fillStyle = "#ef4444";
      for (let i = 0; i < testX.current.length; i++) {
        const px = pad + testX.current[i] * (W - 2 * pad);
        const py = H - pad - testY.current[i] * (H - 2 * pad);
        ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI * 2); ctx.fill();
      }
    }

    // Legend
    ctx.font = "11px sans-serif";
    ctx.fillStyle = "#4f46e5"; ctx.fillText("● Training data", pad + 5, pad + 15);
    ctx.fillStyle = "#ef4444"; ctx.fillText("● Test data", pad + 5, pad + 30);
    ctx.fillStyle = "#94a3b8"; ctx.fillText("– – True function", pad + 5, pad + 45);
    ctx.fillStyle = "#4f46e5"; ctx.fillText("— Fitted curve", pad + 5, pad + 60);
  }, [theta, showTest]);

  useEffect(() => { drawPlot(); }, [drawPlot]);

  return (
    <div className="space-y-8">
      {/* Intro */}
      <div className="bg-gradient-to-r from-fuchsia-50 to-purple-50 border border-fuchsia-100 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-fuchsia-600 text-white rounded-xl shadow-md text-2xl">📉</div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Overfitting & Regularization: The Bias-Variance Tradeoff</h3>
            <p className="text-slate-600 mt-1 text-sm leading-relaxed">
              A high-degree polynomial can fit training data perfectly but wiggle wildly on new data — that's <b>overfitting</b>.
              Regularization (L1/L2) constrains the model to generalize better. The sweet spot is the <b>bias-variance tradeoff</b>.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Lab */}
      <div className="border border-slate-200 rounded-2xl bg-white p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-fuchsia-600 uppercase tracking-widest">Polynomial Regression Lab</span>
            <h4 className="text-lg font-bold text-slate-900">Fit a Curve to Data</h4>
          </div>
          <button
            onClick={() => { generateData(); }}
            className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-xl font-bold text-sm"
          >
            🔄 New Random Data
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <canvas ref={plotCanvas} width={600} height={400} className="w-full rounded-xl border border-slate-200" />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Polynomial Degree: <b className="text-fuchsia-600">{degree}</b></label>
              <input type="range" min={0} max={10} value={degree} onChange={(e) => setDegree(+e.target.value)} className="w-full accent-fuchsia-600" />
              <p className="text-[11px] text-slate-500 mt-1">Higher degree = more complex = more prone to overfitting.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Regularization λ: <b className="text-fuchsia-600">{lambda}</b></label>
              <input type="range" min={0} max={10} step={0.1} value={lambda} onChange={(e) => setLambda(+e.target.value)} className="w-full accent-fuchsia-600" />
              <p className="text-[11px] text-slate-500 mt-1">Larger λ = stronger constraint on weights.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Regularization Type</label>
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
                <button onClick={() => setRegType("none")} className={`py-1.5 rounded ${regType === "none" ? "bg-white text-fuchsia-700 font-bold shadow-xs" : "text-slate-600"}`}>None</button>
                <button onClick={() => setRegType("l2")} className={`py-1.5 rounded ${regType === "l2" ? "bg-white text-fuchsia-700 font-bold shadow-xs" : "text-slate-600"}`}>L2 (Ridge)</button>
                <button onClick={() => setRegType("l1")} className={`py-1.5 rounded ${regType === "l1" ? "bg-white text-fuchsia-700 font-bold shadow-xs" : "text-slate-600"}`}>L1 (Lasso)</button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={showTest} onChange={(e) => setShowTest(e.target.checked)} className="accent-fuchsia-600" />
              <span className="text-slate-600 font-medium">Show test points</span>
            </label>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-200">
                <div className="text-xs text-indigo-700 font-bold uppercase">Train RMSE</div>
                <div className="text-xl font-black text-indigo-800">{trainRMSE.toFixed(3)}</div>
              </div>
              <div className="bg-rose-50 p-3 rounded-xl border border-rose-200">
                <div className="text-xs text-rose-700 font-bold uppercase">Test RMSE</div>
                <div className="text-xl font-black text-rose-800">{testRMSE.toFixed(3)}</div>
              </div>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">
              {testRMSE > trainRMSE * 1.5
                ? "📉 Overfitting! Test error is much worse than training error. Try higher λ or lower degree."
                : testRMSE > trainRMSE * 1.1
                ? "⚠️ Mild overfitting detected."
                : "✅ Good generalization! Test error close to training error."}
            </p>
          </div>
        </div>

        {/* Math */}
        <div className="bg-slate-900 text-fuchsia-300 p-4 rounded-xl font-mono text-xs overflow-x-auto">
          <div className="text-slate-400 mb-1">// Regularized Loss Function</div>
          <pre className="whitespace-pre-wrap">L(θ) = (1/n) Σ (yᵢ − f<sub>θ</sub>(xᵢ))² + λ · R(θ)

R(θ) = Σ|θᵢ|   (L1 / Lasso → sparse weights)
R(θ) = Σθᵢ²   (L2 / Ridge → shrink weights)</pre>
          <p className="text-slate-400 mt-2">💡 Try degree 8 with no regularization — the curve will wildly wiggle between training points. Then add L2 with λ=5 — the curve smooths out and test error drops!</p>
        </div>
      </div>
    </div>
  );
}
