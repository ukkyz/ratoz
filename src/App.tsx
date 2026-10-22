import { useState } from "react";
import Network from "./Network";
import DeepNeuralNetwork from "./components/DeepNeuralNetwork";
import TransformerDemo from "./components/TransformerDemo";
import MixtureOfExpertsDemo from "./components/MixtureOfExpertsDemo";
import AgenticAIDemo from "./components/AgenticAIDemo";
import FourierPlayground from "./components/FourierPlayground";
import WaveletDemo from "./components/WaveletDemo";
import ConvolutionDemo from "./components/ConvolutionDemo";
import EntropyDemo from "./components/EntropyDemo";
import BayesianDemo from "./components/BayesianDemo";
import QLearningDemo from "./components/QLearningDemo";
import OverfittingDemo from "./components/OverfittingDemo";
import {
  Brain,
  History,
  Activity,
  GitBranch,
  Layers,
  Sparkles,
  MessageSquare,
  GitFork,
  Bot,
  Compass,
  CheckCircle2,
  ChevronDown,
  BookOpen,
  Waves,
  Microscope,
  Target,
  Scale,
  FlaskConical,
  Gamepad2,
  TrendingDown,
} from "lucide-react";

const timeline = [
  {
    y: "1943",
    t: "The First Artificial Neuron",
    d: "Warren McCulloch & Walter Pitts show that a simplified biological on/off switch can compute basic logic. This becomes the foundation of all neural networks.",
  },
  {
    y: "1950",
    t: "Turing's Question: 'Can Machines Think?'",
    d: "Alan Turing proposes the Imitation Game (the Turing Test) and sets the philosophical horizon for artificial general intelligence.",
  },
  {
    y: "1956",
    t: "The Dartmouth Workshop: AI is Born",
    d: "John McCarthy, Marvin Minsky, and Claude Shannon coin the term 'Artificial Intelligence', predicting human-level intelligence in a single generation.",
  },
  {
    y: "1958",
    t: "The Perceptron",
    d: "Frank Rosenblatt builds custom hardware with motorized potentiometers that learns simple patterns. The New York Times boldly claims it will soon walk, talk, and reproduce.",
  },
  {
    y: "1969",
    t: "First AI Winter: The XOR Proof",
    d: "Minsky & Papert prove mathematically that a single perceptron cannot even solve XOR (exclusive OR). Government and academic funding vanishes overnight for a decade.",
  },
  {
    y: "1986",
    t: "Backpropagation Revival",
    d: "Rumelhart, Hinton & Williams popularize backpropagation, showing how multi-layer networks can learn non-linear problems by propagating error gradients backwards.",
  },
  {
    y: "1997",
    t: "Deep Blue Beats Kasparov",
    d: "IBM's supercomputer defeats chess champion Garry Kasparov using brute-force alpha-beta search and hand-crafted evaluation heuristics, not neural learning.",
  },
  {
    y: "2012",
    t: "The Deep Learning Big Bang: AlexNet",
    d: "Alex Krizhevsky, Ilya Sutskever, and Geoffrey Hinton train an 8-layer deep convolutional network on gaming GPUs (Nvidia GTX 580s), crushing ImageNet records and launching the modern AI boom.",
  },
  {
    y: "2016",
    t: "AlphaGo Defeats Lee Sedol",
    d: "DeepMind's AlphaGo uses deep reinforcement learning and Monte Carlo Tree Search to master Go—a game with more board positions than atoms in the observable universe.",
  },
  {
    y: "2017",
    t: "The Transformer: 'Attention Is All You Need'",
    d: "Vaswani et al. at Google introduce Self-Attention. Replacing sequential RNNs, it enables massive parallel training across internet-scale text and forms the bedrock of ChatGPT.",
  },
  {
    y: "2020+",
    t: "Mixture of Experts & Trillion-Parameter LLMs",
    d: "Dense models hit compute walls. Sparse Mixture of Experts (MoE)—routing each token to specialized sub-networks—powers Mixtral, DeepSeek-V3, and GPT-4 at lightning inference speeds.",
  },
  {
    y: "2024+",
    t: "Agentic AI & Persistent Context",
    d: "Models evolve from passive text repliers into autonomous agents that browse, code, and execute tools. Structured context databases (like OpenViking) give agents durable memory and filesystems.",
  },
  {
    y: "Future",
    t: "Artificial General Intelligence (AGI)",
    d: "AI that can learn, generalize, and excel at any intellectual task a human can do. The frontier challenges are reasoning, self-correction, safety alignment, and real-world autonomy.",
  },
];

const sections = [
  { id: "History", label: "1. History", icon: History },
  { id: "Neuron", label: "2. The Neuron", icon: Brain },
  { id: "Network", label: "3. Live Network", icon: Activity },
  { id: "Training", label: "4. Gradient Descent", icon: GitBranch },
  { id: "DNN", label: "5. Deep Networks", icon: Layers },
  { id: "Transformer", label: "6. Transformer", icon: Sparkles },
  { id: "LLMs", label: "7. LLMs", icon: MessageSquare },
  { id: "MoE", label: "8. Mixture of Experts", icon: GitFork },
  { id: "Agentic", label: "9. Agentic AI", icon: Bot },
  { id: "AGI", label: "10. Road to AGI", icon: Compass },
  { id: "Fourier", label: "11. Fourier", icon: Waves },
  { id: "Wavelet", label: "12. Wavelets", icon: Microscope },
  { id: "Convolution", label: "13. Convolution", icon: Target },
  { id: "Entropy", label: "14. Entropy", icon: Scale },
  { id: "Bayesian", label: "15. Bayesian", icon: FlaskConical },
  { id: "QLearning", label: "16. Q-Learning", icon: Gamepad2 },
  { id: "Overfitting", label: "17. Overfitting", icon: TrendingDown },
  { id: "Quiz", label: "18. Quiz & Master", icon: CheckCircle2 },
];

function Neuron() {
  const [w1, setW1] = useState(0.6),
    [w2, setW2] = useState(0.4),
    [b, setB] = useState(-0.5);
  const [x1, setX1] = useState(1),
    [x2, setX2] = useState(0);
  const sum = x1 * w1 + x2 * w2 + b;
  const out = 1 / (1 + Math.exp(-sum * 4));

  const S = (l: string, v: number, f: (n: number) => void, min = -1, max = 1) => (
    <label className="block text-sm">
      {l}: <b>{v.toFixed(2)}</b>
      <input
        type="range"
        min={min}
        max={max}
        step={0.05}
        value={v}
        onChange={(e) => f(+e.target.value)}
        className="w-full accent-indigo-600"
      />
    </label>
  );

  return (
    <div className="grid md:grid-cols-2 gap-8 items-center">
      <div className="space-y-3">
        <p className="text-slate-600 leading-relaxed">
          Imagine deciding: <b>"Should I go to the beach?"</b>.
          Input 1 is <em>"Is it sunny?"</em> and Input 2 is <em>"Do I have work?"</em>.
          The <b>weights</b> determine how much each factor matters to you, and the <b>bias</b> is your baseline disposition.
        </p>
        <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
          {S("☀️ Input 1: Sunny (0 = Overcast, 1 = Clear Sky)", x1, setX1, 0, 1)}
          {S("💼 Input 2: Work (0 = Free Day, 1 = Urgent Work)", x2, setX2, 0, 1)}
          {S("Weight 1: How much sunshine pulls you to go", w1, setW1)}
          {S("Weight 2: How much work repels you (negative = stay)", w2, setW2)}
          {S("Bias: Baseline mood (-1 = homebody, +1 = adventurer)", b, setB)}
        </div>
      </div>
      <div className="text-center bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner">
        <svg viewBox="0 0 300 200" className="w-full max-w-[340px] mx-auto">
          <line
            x1="40"
            y1="50"
            x2="150"
            y2="100"
            stroke="#6366f1"
            strokeWidth={1 + Math.abs(w1) * 6}
            opacity={w1 < 0 ? 0.35 : 1}
          />
          <line
            x1="40"
            y1="150"
            x2="150"
            y2="100"
            stroke="#6366f1"
            strokeWidth={1 + Math.abs(w2) * 6}
            opacity={w2 < 0 ? 0.35 : 1}
          />
          <line x1="150" y1="100" x2="260" y2="100" stroke="#10b981" strokeWidth="4" />
          <circle cx="40" cy="50" r="22" fill={`rgba(250,204,21,${0.25 + x1 * 0.75})`} />
          <text x="40" y="55" textAnchor="middle" fontSize="16">☀️</text>
          <circle cx="40" cy="150" r="22" fill={`rgba(148,163,184,${0.25 + x2 * 0.75})`} />
          <text x="40" y="155" textAnchor="middle" fontSize="16">💼</text>
          <circle cx="150" cy="100" r="34" fill="#312e81" />
          <text x="150" y="105" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">
            Σ {sum.toFixed(2)}
          </text>
          <circle
            cx="260"
            cy="100"
            r="28"
            fill={`rgba(16,185,129,${Math.max(0.15, out)})`}
            stroke="#10b981"
            strokeWidth="3"
          />
          <text x="260" y="105" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#065f46">
            {(out * 100).toFixed(0)}%
          </text>
        </svg>
        <div className="mt-3">
          <p className="text-2xl font-black text-slate-800">
            {out > 0.5 ? "🏖️ Go to the beach!" : "🏠 Stay home"}
          </p>
          <p className="text-xs font-mono text-slate-500 mt-1">
            activation = sigmoid( (x₁ × w₁) + (x₂ × w₂) + bias )
          </p>
        </div>
      </div>
    </div>
  );
}

function Training() {
  const [guess, setGuess] = useState(8);
  const [hist, setHist] = useState<number[]>([8]);
  const target = 3,
    loss = (guess - target) ** 2,
    grad = 2 * (guess - target);
  const [lr, setLr] = useState(0.2);

  const stepDown = () => {
    const g = guess - lr * grad;
    setGuess(g);
    setHist((h) => [...h, g]);
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 items-center">
      <div className="space-y-4 text-slate-700">
        <p className="leading-relaxed">
          <b>Training</b> a neural network is like being blindfolded on a foggy mountain and trying to reach the lowest valley.
          You can't see the whole valley, but you can feel with your feet which way the ground slopes (the <b>gradient</b>).
          You take a step in that downward direction!
        </p>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
          <div className="font-bold text-slate-800">The 4-Step Cycle of Deep Learning:</div>
          <ol className="list-decimal ml-4 space-y-1 text-slate-600">
            <li><b>Forward Pass:</b> Model takes input and makes a guess.</li>
            <li><b>Compute Loss:</b> Measure the gap between guess and true answer (mountain height).</li>
            <li><b>Backpropagation:</b> Calculate calculus derivatives (slope direction for every weight).</li>
            <li><b>Weight Update:</b> Nudge weights in the opposite direction of the gradient.</li>
          </ol>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">
            Learning Rate (Step Size): <b className="text-indigo-600">{lr}</b>
          </label>
          <input
            type="range"
            min={0.02}
            max={1.1}
            step={0.01}
            value={lr}
            onChange={(e) => setLr(+e.target.value)}
            className="w-full accent-indigo-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
            <span>Too Slow (&lt; 0.1)</span>
            <span>Balanced (0.2)</span>
            <span>Overshoots &amp; Diverges (&gt; 1.0)</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={stepDown}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-sm transition-all"
          >
            👣 Take 1 Gradient Step
          </button>
          <button
            onClick={() => {
              setGuess(8);
              setHist([8]);
            }}
            className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold text-sm transition-all"
          >
            ↺ Reset
          </button>
        </div>
        <div className="flex gap-4 text-xs font-mono bg-indigo-50/70 p-3 rounded-lg border border-indigo-100">
          <span>Current Weight: <b>{guess.toFixed(3)}</b></span>
          <span>Target: <b>{target.toFixed(3)}</b></span>
          <span>Loss (Error): <b>{loss.toFixed(3)}</b></span>
        </div>
      </div>
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Loss Landscape (Height = Error)
        </div>
        <svg viewBox="-2 -2 14 30" className="w-full h-72">
          <polyline
            fill="none"
            stroke="#94a3b8"
            strokeWidth="0.2"
            points={Array.from({ length: 101 }, (_, i) => {
              const x = -1 + i * 0.12;
              return `${x},${26 - Math.min(26, (x - target) ** 2)}`;
            }).join(" ")}
          />
          {hist.map(
            (h, i) =>
              Math.abs(h) < 20 && (
                <circle
                  key={i}
                  cx={h}
                  cy={26 - Math.min(26, (h - target) ** 2)}
                  r="0.3"
                  fill="#c7d2fe"
                />
              )
          )}
          {Math.abs(guess) < 20 && (
            <circle cx={guess} cy={26 - Math.min(26, loss)} r="0.6" fill="#4f46e5" />
          )}
          <text x={target} y="28" fontSize="0.9" textAnchor="middle" fill="#10b981" fontWeight="bold">
            ▼ Optimal Minimum (Loss = 0)
          </text>
        </svg>
      </div>
    </div>
  );
}

function LLM() {
  const vocab: Record<string, [string, number][]> = {
    the: [
      ["cat", 0.4],
      ["dog", 0.3],
      ["sun", 0.3],
    ],
    cat: [
      ["sat", 0.5],
      ["ate", 0.3],
      ["slept", 0.2],
    ],
    dog: [
      ["ran", 0.6],
      ["barked", 0.4],
    ],
    sun: [
      ["rose", 0.7],
      ["set", 0.3],
    ],
    sat: [["on", 1]],
    ate: [["the", 1]],
    slept: [["on", 1]],
    ran: [["to", 1]],
    barked: [["at", 1]],
    rose: [["over", 1]],
    set: [["behind", 1]],
    on: [["the", 1]],
    to: [["the", 1]],
    at: [["the", 1]],
    over: [["the", 1]],
    behind: [["the", 1]],
  };

  const [words, setWords] = useState(["the"]);
  const last = words[words.length - 1];
  const opts = vocab[last] || [];

  return (
    <div className="space-y-6">
      <p className="text-slate-700 leading-relaxed">
        A Large Language Model (LLM) is simply an ultra-scaled neural network trained on trillions of words.
        Its single fundamental objective during pre-training is: <b>given all previous words, predict the probability distribution for the next token</b>.
        Try playing the role of the model's next-token generator below:
      </p>

      <div className="text-2xl font-serif bg-amber-50/80 border border-amber-200 p-5 rounded-2xl min-h-[72px] shadow-inner text-slate-800">
        {words.join(" ")}
        <span className="animate-pulse text-indigo-600 font-bold ml-1">▍</span>
      </div>

      <div className="space-y-2.5">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Softmax Next-Token Probability Distribution:
        </div>
        {opts.map(([w, p]) => (
          <button
            key={w}
            onClick={() => setWords([...words, w])}
            className="flex items-center gap-3 w-full text-left group p-2 hover:bg-slate-50 rounded-xl transition-all"
          >
            <span className="w-24 font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
              "{w}"
            </span>
            <div className="flex-1 bg-slate-100 h-6 rounded-lg overflow-hidden border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded transition-all duration-300"
                style={{ width: `${p * 100}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-slate-600 w-12 text-right">
              {(p * 100).toFixed(0)}%
            </span>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => {
            const r = Math.random();
            let a = 0;
            for (const [w, p] of opts) {
              a += p;
              if (r <= a) {
                setWords([...words, w]);
                break;
              }
            }
          }}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-sm transition-all"
        >
          🎲 Random Sample (Temperature &gt; 0)
        </button>
        <button
          onClick={() => setWords(["the"])}
          className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold text-sm transition-all"
        >
          ↺ Restart Prompt
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4 pt-2">
        {[
          [
            "1. Pre-training (Next Token)",
            "Ingest trillions of tokens from books, code, and websites. Model learns syntax, world knowledge, and reasoning patterns. Costs tens of millions of dollars.",
          ],
          [
            "2. Instruction Tuning & RLHF",
            "Fine-tune on human-guided conversations and Reinforcement Learning from Human Feedback so the raw predictor becomes a safe, helpful assistant.",
          ],
          [
            "3. Context DB & Agentic Layer",
            "Give the model persistent memory, filesystems (like OpenViking), and tools so it can act in the real world rather than just chat.",
          ],
        ].map(([t, d]) => (
          <div key={t} className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <h4 className="font-bold text-sm text-slate-900">{t}</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const quiz = [
  {
    q: "What does an artificial neuron calculate mathematically?",
    a: [
      "Compresses JPEG pictures into ZIP files",
      "Calculates a weighted sum of inputs, adds a bias, and squashes it through an activation function",
      "Searches Wikipedia using Google",
    ],
    c: 1,
    exp: "A neuron multiplies each input by a weight, adds a bias, and runs the result through an activation function like ReLU or Sigmoid.",
  },
  {
    q: "Why was the 1969 proof about XOR such a devastating blow to early AI (AI Winter)?",
    a: [
      "It proved that a single perceptron can only draw a straight line and cannot solve non-linear problems",
      "Computers in 1969 didn't have enough RAM",
      "Scientists lost interest in computers",
    ],
    c: 0,
    exp: "Minsky and Papert proved single perceptrons could only make linear boundaries. XOR required at least one hidden layer, which wasn't easily trainable until backpropagation.",
  },
  {
    q: "In a Deep Neural Network (DNN), what do the early vs deep layers represent?",
    a: [
      "All layers do identical tasks",
      "Early layers detect low-level edges and contrast; deeper layers assemble them into complex concepts like faces or cars",
      "Early layers are for math, deep layers are for text",
    ],
    c: 1,
    exp: "Deep networks build a feature hierarchy: edges -> textures -> parts -> whole objects.",
  },
  {
    q: "What revolutionary mechanism made the 2017 Transformer architecture replace RNNs?",
    a: [
      "Self-Attention, which lets all tokens process in parallel and look directly at other tokens for context",
      "Replacing GPUs with CPUs",
      "Using bigger floppy disks",
    ],
    c: 0,
    exp: "Self-Attention (using Query, Key, Value vectors) eliminated sequential bottlenecks and captured long-range context across all words simultaneously.",
  },
  {
    q: "How does a Mixture of Experts (MoE) model achieve massive capacity without becoming slow?",
    a: [
      "It makes all neurons fire at the same time",
      "A Router network sparsely activates only the top few specialized experts (e.g. 2 out of 8) for each token",
      "It shrinks the model to 1 megabyte",
    ],
    c: 1,
    exp: "MoE models (like Mixtral and DeepSeek) have huge total parameter counts, but only execute a small fraction per token, saving up to 75%+ of compute FLOPs.",
  },
  {
    q: "What turns a standard chatbot into 'Agentic AI'?",
    a: [
      "Making the text font larger",
      "Autonomous loops with tool execution, planning, reflection, and persistent context databases / memory",
      "Running it in offline airplane mode",
    ],
    c: 1,
    exp: "Agents can perceive goals, plan in steps, use tools (code, web, APIs), observe outcomes, and store knowledge in persistent filesystems like OpenViking.",
  },
  {
    q: "What is Artificial General Intelligence (AGI)?",
    a: [
      "A software program that plays chess",
      "AI capable of learning and performing any intellectual task that a human can do across all domains",
      "A supercomputer that never needs electricity",
    ],
    c: 1,
    exp: "AGI refers to general human-level (or beyond) intellectual capability across reasoning, creativity, learning, and real-world task adaptation.",
  },
];

function Quiz() {
  const [ans, setAns] = useState<Record<number, number>>({});
  const score = Object.entries(ans).filter(([i, a]) => quiz[+i].c === a).length;
  const isComplete = Object.keys(ans).length === quiz.length;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {quiz.map((q, i) => {
          const userAnswer = ans[i];
          const hasAnswered = userAnswer !== undefined;

          return (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
              <p className="font-bold text-slate-900 text-sm">
                <span className="text-indigo-600 mr-1.5">{i + 1}.</span> {q.q}
              </p>
              <div className="space-y-2">
                {q.a.map((opt, j) => {
                  let cls = "bg-slate-50 border-slate-200 text-slate-700 hover:bg-indigo-50/50 hover:border-indigo-300";

                  if (hasAnswered) {
                    if (j === q.c) {
                      cls = "bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold";
                    } else if (userAnswer === j) {
                      cls = "bg-rose-50 border-rose-300 text-rose-800 line-through";
                    } else {
                      cls = "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={j}
                      disabled={hasAnswered}
                      onClick={() => setAns({ ...ans, [i]: j })}
                      className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-start gap-2.5 ${cls}`}
                    >
                      <span className="font-mono font-bold mt-0.5">{String.fromCharCode(65 + j)}.</span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {hasAnswered && (
                <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-800">Explanation: </span>
                  {q.exp}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl shadow-md text-center space-y-2">
        <div className="text-3xl font-black">
          Your Score: {score} / {quiz.length}
        </div>
        <p className="text-indigo-100 text-sm">
          {score === quiz.length
            ? "🏆 Perfection! You understand the foundations from single neurons all the way to AGI and Agentic AI!"
            : isComplete
            ? "Great effort! Review the explanations above to master all the breakthroughs."
            : "Answer all questions to complete your certification!"}
        </p>
      </div>
    </div>
  );
}

const Card = ({
  id,
  n,
  title,
  sub,
  badge,
  children,
}: {
  id: string;
  n: number;
  title: string;
  sub: string;
  badge?: string;
  children: React.ReactNode;
}) => (
  <section id={id} className="max-w-5xl mx-auto px-4 py-16 scroll-mt-20">
    <div className="flex items-center gap-2 mb-1">
      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Chapter {n}</span>
      {badge && (
        <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold">
          {badge}
        </span>
      )}
    </div>
    <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">{title}</h2>
    <p className="text-slate-600 mb-8 max-w-3xl leading-relaxed">{sub}</p>
    <div className="bg-white/80 backdrop-blur-xs rounded-3xl shadow-sm border border-slate-200/80 p-6 md:p-8">
      {children}
    </div>
  </section>
);

export default function App() {
  const [openTimeline, setOpenTimeline] = useState<number | null>(0);
  const [showCheatSheet, setShowCheatSheet] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-800 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-black text-indigo-700 text-base whitespace-nowrap">
            <Brain className="w-5 h-5 text-indigo-600" />
            <span>Mind the Machine</span>
          </div>

          <div className="hidden lg:flex items-center gap-2 overflow-x-auto text-xs font-semibold text-slate-600 py-1">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="px-2.5 py-1.5 rounded-lg hover:text-indigo-600 hover:bg-indigo-50 transition-colors whitespace-nowrap"
              >
                {s.label}
              </a>
            ))}
          </div>

          <button
            onClick={() => setShowCheatSheet((c) => !c)}
            className="text-xs px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition-all flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>AI Cheatsheet</span>
          </button>
        </div>
      </nav>

      {/* Cheatsheet Modal */}
      {showCheatSheet && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" /> AI Fundamentals Cheatsheet
              </h3>
              <button
                onClick={() => setShowCheatSheet(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs leading-relaxed text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong className="text-slate-900 block mb-0.5">Neuron:</strong> Weighted sum of inputs + bias, passed through an activation function.
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong className="text-slate-900 block mb-0.5">Deep Neural Network (DNN):</strong> Many layers stacking abstractions from raw pixels (edges) to whole objects (faces, cars).
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong className="text-slate-900 block mb-0.5">Transformer & Self-Attention:</strong> Processes all tokens in parallel using Query, Key, and Value vectors to understand context.
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong className="text-slate-900 block mb-0.5">Mixture of Experts (MoE):</strong> Instead of firing all parameters, a router directs each token to the Top-2 specialized sub-networks.
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong className="text-slate-900 block mb-0.5">Agentic AI & OpenViking:</strong> AI that executes tools, plans in steps, and stores long-term memory in a persistent context filesystem.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <header className="max-w-5xl mx-auto px-4 pt-20 pb-12 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
          <Sparkles className="w-4 h-4" /> 11 Interactive Chapters for Curious Minds
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
          From a Single Neuron <br />
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            to Transformers, MoE &amp; AGI
          </span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Demystifying the complete history and modern architecture of Artificial Intelligence.
          No advanced math required—experiment with live neurons, inspect transformer attention spotlights,
          route tokens through Mixture of Experts, and run autonomous agents with context databases in your browser.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <a
            href="#History"
            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold shadow-lg shadow-indigo-200 transition-all hover:scale-105"
          >
            Start the Journey →
          </a>
          <a
            href="#Transformer"
            className="px-5 py-3.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-full font-bold transition-all shadow-xs"
          >
            Jump to Transformers ✨
          </a>
          <a
            href="#MoE"
            className="px-5 py-3.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-full font-bold transition-all shadow-xs"
          >
            Explore MoE ⚡
          </a>
        </div>
      </header>

      {/* Chapter 1: History */}
      <Card
        id="History"
        n={1}
        title="80 Years of Thinking Machines"
        sub="Click any pivotal milestone in the history of artificial intelligence to explore the breakthrough and its impact."
        badge="Historical Roots"
      >
        <div className="relative border-l-4 border-indigo-200 ml-3 space-y-4">
          {timeline.map((e, i) => {
            const isOpened = openTimeline === i;
            return (
              <div
                key={i}
                className="pl-6 relative cursor-pointer group"
                onClick={() => setOpenTimeline(isOpened ? null : i)}
              >
                <span
                  className={`absolute -left-[11px] top-1.5 w-4 h-4 rounded-full transition-all duration-300 ${
                    isOpened ? "bg-indigo-600 ring-4 ring-indigo-100" : "bg-indigo-300 group-hover:bg-indigo-400"
                  }`}
                />
                <div className="flex items-center justify-between">
                  <p className="text-slate-800">
                    <b className="text-indigo-700 mr-2 font-mono text-sm">{e.y}</b>
                    <span className="font-bold text-sm">{e.t}</span>
                  </p>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${isOpened ? "rotate-180" : ""}`}
                  />
                </div>
                {isOpened && (
                  <p className="text-slate-600 text-xs mt-1.5 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {e.d}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Chapter 2: The Neuron */}
      <Card
        id="Neuron"
        n={2}
        title="Meet the Artificial Neuron"
        sub="The fundamental atomic decision-maker behind every artificial brain. Tweak the weights and bias to see the decision shift live."
        badge="Atomic Unit"
      >
        <Neuron />
      </Card>

      {/* Chapter 3: Live Network */}
      <Card
        id="Network"
        n={3}
        title="Build & Train a Network in Your Browser"
        sub="A real neural network running live in JavaScript! Choose a geometric dataset, adjust the brain size (hidden neurons), and click Train to watch it learn non-linear boundaries."
        badge="Live Interactive Training"
      >
        <Network />
      </Card>

      {/* Chapter 4: Gradient Descent */}
      <Card
        id="Training"
        n={4}
        title="How Training Actually Works: Gradient Descent"
        sub="Gradient descent is the 'walk downhill blindfolded' algorithm powering all modern deep learning. Step down the slope and adjust your learning rate."
        badge="Optimization"
      >
        <Training />
      </Card>

      {/* Chapter 5: Deep Neural Networks (DNN) */}
      <Card
        id="DNN"
        n={5}
        title="Deep Neural Networks (DNNs) & Feature Hierarchies"
        sub="How stacking dozens of layers lets models build high-level concepts from raw pixels: from edges, to shapes, to faces and cars."
        badge="Deep Representation"
      >
        <DeepNeuralNetwork />
      </Card>

      {/* Chapter 6: Transformers & Attention */}
      <Card
        id="Transformer"
        n={6}
        title="The Transformer Architecture & Self-Attention"
        sub="The 2017 breakthrough that powers ChatGPT, Claude, and Gemini. Click ambiguous words to see how attention beams link words together."
        badge="Attention Is All You Need"
      >
        <TransformerDemo />
      </Card>

      {/* Chapter 7: Large Language Models */}
      <Card
        id="LLMs"
        n={7}
        title="From Networks to Large Language Models (LLMs)"
        sub="What happens when you scale a transformer to billions of parameters and train it to predict the next token on the entire internet."
        badge="Generative AI"
      >
        <LLM />
      </Card>

      {/* Chapter 8: Mixture of Experts (MoE) */}
      <Card
        id="MoE"
        n={8}
        title="Mixture of Experts (MoE): Sparse Frontier Scaling"
        sub="Why modern mega-models like Mixtral, DeepSeek-V3, and GPT-4 only activate 2 out of 8 experts per token to cut inference compute by 75%."
        badge="Sparse Inference"
      >
        <MixtureOfExpertsDemo />
      </Card>

      {/* Chapter 9: Agentic AI */}
      <Card
        id="Agentic"
        n={9}
        title="Agentic AI: Autonomous Action & Context Databases"
        sub="How AI moves from conversational chatbots to autonomous agents that plan, use tools, self-correct, and store skills in filesystems like OpenViking."
        badge="Autonomy & Memory"
      >
        <AgenticAIDemo />
      </Card>

      {/* Chapter 10: The Road to AGI */}
      <Card
        id="AGI"
        n={10}
        title="The Road to Artificial General Intelligence (AGI)"
        sub="Where we currently stand on the spectrum of machine intelligence, and the monumental open frontiers that remain unsolved."
        badge="The Horizon"
      >
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              title: "Narrow AI (Artificial Narrow Intelligence)",
              icon: "🎯",
              status: "Solved & Everywhere",
              desc: "Superhuman at specific closed-world tasks: chess, facial recognition, language translation, folding proteins (AlphaFold). Lacks common sense outside its training distribution.",
            },
            {
              title: "General-ish AI (Frontier LLMs & Agents)",
              icon: "⚡",
              status: "Current Frontier (2024–2026)",
              desc: "Can write code, compose poetry, pass medical exams, and call tools. Still hallucinates, suffers from context loss, and lacks true physical-world grounding.",
            },
            {
              title: "AGI (Artificial General Intelligence)",
              icon: "🌌",
              status: "Open Question",
              desc: "Autonomous systems that equal or surpass human cognitive abilities across all economically and scientifically valuable work, capable of self-directed research and meta-learning.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">{item.icon}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                    {item.status}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm leading-snug">{item.title}</h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
          <h5 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Compass className="w-4 h-4 text-indigo-600" />
            The 5 Major Unsolved Frontiers to Safe AGI:
          </h5>
          <div className="grid sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-600">
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <strong className="text-slate-900 block mb-0.5">1. Reliable Multi-Step Reasoning:</strong>
              Preventing errors from cascading during long chains of 100+ logical steps without human supervision.
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <strong className="text-slate-900 block mb-0.5">2. Durable Context & Continual Learning:</strong>
              Learning new skills on the fly without catastrophic forgetting or memory bloat (the core motivation for context filesystems).
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <strong className="text-slate-900 block mb-0.5">3. Physical Grounding & World Models:</strong>
              Understanding intuitive physics, 3D space, and causality beyond text statistical correlations.
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <strong className="text-slate-900 block mb-0.5">4. Alignment & Value Governance:</strong>
              Ensuring systems remain honest, helpful, harmless, and aligned with human flourishing as capabilities surpass human oversight.
            </div>
          </div>
        </div>
      </Card>

      {/* Chapter 11: Fourier Transform */}
      <Card
        id="Fourier"
        n={11}
        title="The Fourier Transform: Time ↔ Frequency"
        sub="Build waves from sine harmonics, draw your own wave and see its spectrum, and watch Gibbs phenomenon live."
        badge="Calculus & Waves"
      >
        <FourierPlayground />
      </Card>

      {/* Chapter 12: Wavelet Transform */}
      <Card
        id="Wavelet"
        n={12}
        title="Wavelet Transform: Local Time-Frequency"
        sub="Decompose signals into multi-scale wavelets, threshold noise, and reconstruct — the math behind JPEG 2000 and audio processing."
        badge="Signal Processing"
      >
        <WaveletDemo />
      </Card>

      {/* Chapter 13: Convolution */}
      <Card
        id="Convolution"
        n={13}
        title="Convolution: The Math Behind Image AI"
        sub="Slide kernels over images to blur, sharpen, and detect edges — exactly how CNNs see the world."
        badge="Computer Vision"
      >
        <ConvolutionDemo />
      </Card>

      {/* Chapter 14: Entropy & Information Theory */}
      <Card
        id="Entropy"
        n={14}
        title="Information Theory: Entropy & KL Divergence"
        sub="Measure uncertainty, compare distributions, and understand why cross-entropy is the loss function behind every classification network."
        badge="Probability & Stats"
      >
        <EntropyDemo />
      </Card>

      {/* Chapter 15: Bayesian Inference */}
      <Card
        id="Bayesian"
        n={15}
        title="Bayesian Inference: Prior × Likelihood = Posterior"
        sub="Update beliefs with new evidence. See the base rate fallacy, confusion matrices, and the math behind spam filters and medical tests."
        badge="Bayesian Statistics"
      >
        <BayesianDemo />
      </Card>

      {/* Chapter 16: Q-Learning */}
      <Card
        id="QLearning"
        n={16}
        title="Reinforcement Learning: Q-Learning Agent"
        sub="Train an agent to navigate a maze using the Bellman equation. Adjust learning rate, discount factor, and exploration."
        badge="RL & Autonomy"
      >
        <QLearningDemo />
      </Card>

      {/* Chapter 17: Overfitting & Regularization */}
      <Card
        id="Overfitting"
        n={17}
        title="Overfitting & Regularization: Bias-Variance Tradeoff"
        sub="Watch a polynomial wiggle out of control, then use L1/L2 regularization to generalize. See train vs test error live."
        badge="Model Generalization"
      >
        <OverfittingDemo />
      </Card>

      {/* Chapter 18: Quiz */}
      <Card
        id="Quiz"
        n={18}
        title="Test Your Machine Learning Intuition"
        sub="Eleven interactive questions to consolidate everything you've learned from single neurons to Transformers, MoE, Agentic AI, Fourier transforms, and Bayesian inference."
        badge="Mastery Certification"
      >
        <Quiz />
      </Card>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 text-center text-xs text-slate-500 space-y-2">
        <p className="font-semibold text-slate-700">Mind the Machine · An Interactive Guide to AI &amp; AGI</p>
        <p>Built with React, Vite &amp; Tailwind CSS · All neural simulations, attention heads, MoE routing, and agent loops execute directly in your browser.</p>
      </footer>
    </div>
  );
}
