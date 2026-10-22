import { useState } from "react";
import { Layers, Sparkles, Zap, ArrowRight, Eye, ShieldCheck, Activity } from "lucide-react";

type ObjectPreset = {
  id: string;
  name: string;
  icon: string;
  tagline: string;
  l1: { label: string; desc: string; pattern: string; strength: number }[];
  l2: { label: string; desc: string; pattern: string; strength: number }[];
  l3: { label: string; desc: string; pattern: string; strength: number }[];
  output: { class: string; conf: number; isCorrect: boolean }[];
};

const PRESETS: ObjectPreset[] = [
  {
    id: "cat",
    name: "Domestic Cat",
    icon: "🐱",
    tagline: "Whiskers, pointed triangular ears, and fur texture",
    l1: [
      { label: "Diagonal Edges (45°)", desc: "Detects sharp ear slopes", pattern: "╱ ╲ ╱", strength: 0.95 },
      { label: "High Contrast Shifts", desc: "Whiskers against background", pattern: "┃ ┆ ┃", strength: 0.88 },
      { label: "Fine Ridge Textures", desc: "Short coat fur gradients", pattern: "░ ▒ ▓", strength: 0.79 },
      { label: "Horizontal Slits", desc: "Pupil and eye socket outlines", pattern: "━ ═ ━", strength: 0.91 },
    ],
    l2: [
      { label: "Triangular Ear Curves", desc: "Combines 2 diagonal edges into a pointed vertex", pattern: "▲ ∧ ⌂", strength: 0.93 },
      { label: "Elliptical Eye Shapes", desc: "Combines horizontal and curved arc borders", pattern: "◓ ◔ ◕", strength: 0.96 },
      { label: "Soft Muzzle Curves", desc: "Bilateral rounded whiskers pad boundary", pattern: "ω ⌒ ‿", strength: 0.85 },
      { label: "Cylindrical Limb Contours", desc: "Parallel vertical boundaries for paws", pattern: "║ │ ║", strength: 0.62 },
    ],
    l3: [
      { label: "Feline Facial Complex", desc: "Integrates ears, eyes, muzzle at anatomical spacing", pattern: "🐱", strength: 0.97 },
      { label: "Tuck-in Paws Stance", desc: "Folded limbs under torso geometry", pattern: "🐾", strength: 0.82 },
      { label: "Fur Surface Material", desc: "Organic repeating micro-texture signature", pattern: "🧶", strength: 0.91 },
    ],
    output: [
      { class: "Domestic Cat (Felis catus)", conf: 96.4, isCorrect: true },
      { class: "Red Fox (Vulpes)", conf: 2.8, isCorrect: false },
      { class: "Plush Toy Stuffed Animal", conf: 0.8, isCorrect: false },
    ],
  },
  {
    id: "car",
    name: "Autonomous Electric Car",
    icon: "🚗",
    tagline: "Sleek aerodynamic curves, round wheels, and windshield reflections",
    l1: [
      { label: "Long Horizontal Lines", desc: "Roofline, hood contour, and chassis edge", pattern: "━━━━━", strength: 0.96 },
      { label: "Circular Arcs", desc: "Wheel rim curves and headlights perimeter", pattern: "⌒ ◜ ◝", strength: 0.92 },
      { label: "Metallic Reflection Gradients", desc: "Sharp specularity on painted sheet metal", pattern: "✦ ✧ ✦", strength: 0.87 },
      { label: "Vertical Door Seams", desc: "Sub-millimeter panel gap transitions", pattern: "┆ ┆ ┆", strength: 0.74 },
    ],
    l2: [
      { label: "Dual Wheel Assemblies", desc: "Circles with radial spokes inside chassis wells", pattern: "◎ ⎊ ◎", strength: 0.98 },
      { label: "Glass Greenhouse Enclosure", desc: "Trapezoidal windshield and tinted side windows", pattern: "⏢ ▱ ⏢", strength: 0.91 },
      { label: "Headlight Cluster Geometry", desc: "LED projector lenses with daytime running strip", pattern: "◖ ◗ ◖", strength: 0.89 },
      { label: "Aerodynamic Grille / Bumper", desc: "Smooth flush electric front fascia", pattern: "⎍ ⎎ ⎍", strength: 0.84 },
    ],
    l3: [
      { label: "Automobile Side Profile", desc: "Two wheels under a low aerodynamic body cabin", pattern: "🏎️", strength: 0.95 },
      { label: "Street Perspective Geometry", desc: "Perspective convergence on asphalt road lane", pattern: "🛣️", strength: 0.90 },
      { label: "Vehicle Surface Reflectance", desc: "Clearcoat lacquer over curved metal surfaces", pattern: "✨", strength: 0.86 },
    ],
    output: [
      { class: "Electric Sedan (Vehicle)", conf: 98.1, isCorrect: true },
      { class: "Minivan / SUV", conf: 1.5, isCorrect: false },
      { class: "Motorcycle with Sidecar", conf: 0.4, isCorrect: false },
    ],
  },
  {
    id: "human",
    name: "Human Portrait",
    icon: "😊",
    tagline: "Eyes, nose, lips, jawline and hair boundaries",
    l1: [
      { label: "Curved Brow Edges", desc: "Arched luminance drops above eye sockets", pattern: "︵ ︶ ︵", strength: 0.94 },
      { label: "Skin Tone Gradients", desc: "Subsurface light scattering warm hues", pattern: "░ ▒ ▓", strength: 0.89 },
      { label: "Vertical Nasal Bridge", desc: "Center shadow line defining nose ridge", pattern: "│ ┆ │", strength: 0.91 },
      { label: "Lip Boundary Contrast", desc: "Vermilion border color difference", pattern: "━ ═ ━", strength: 0.86 },
    ],
    l2: [
      { label: "Iris & Sclera Pairs", desc: "Dual circular dark irises in almond white sockets", pattern: "👁️ 👁️", strength: 0.96 },
      { label: "Smile / Mouth Curve", desc: "Horizontal arc with subtle dental exposure", pattern: "👄 ‿ ◡", strength: 0.92 },
      { label: "Oval Face Contour", desc: "Smooth jawline framing facial interior", pattern: "⬭ ⬯ ⬭", strength: 0.88 },
      { label: "Hairline Texture Pattern", desc: "Organic strands framing the forehead", pattern: "彡 彡 彡", strength: 0.83 },
    ],
    l3: [
      { label: "Full Human Face Config", desc: "Classic T-shape layout (eyes, nose, mouth proportion)", pattern: "👤", strength: 0.98 },
      { label: "Emotive Expression (Joy)", desc: "Zygomatic cheek lift + eye crinkling", pattern: "😊", strength: 0.93 },
      { label: "Hair & Torso Context", desc: "Neck support with collar and background separation", pattern: "👔", strength: 0.87 },
    ],
    output: [
      { class: "Human Face (Adult)", conf: 99.2, isCorrect: true },
      { class: "Mannequin / Wax Figure", conf: 0.6, isCorrect: false },
      { class: "Oil Portrait Painting", conf: 0.2, isCorrect: false },
    ],
  },
];

export default function DeepNeuralNetwork() {
  const [selectedPreset, setSelectedPreset] = useState<ObjectPreset>(PRESETS[0]);
  const [activeLayer, setActiveLayer] = useState<number>(1);
  const [actFn, setActFn] = useState<"relu" | "sigmoid" | "linear">("relu");
  const [skipConnections, setSkipConnections] = useState<boolean>(true);
  const [networkDepth, setNetworkDepth] = useState<number>(4);

  // Compute signal multiplier based on activation function & depth
  // ReLU preserves signal, Sigmoid saturates/vanishes without skips, Linear lacks non-linear abstraction
  const getSignalHealth = () => {
    if (actFn === "linear") return { score: "Poor", desc: "Linear networks collapse into 1 shallow layer! Cannot learn complex curves.", color: "text-amber-500", bar: 30 };
    if (actFn === "sigmoid" && !skipConnections && networkDepth >= 4) {
      return { score: "Vanishing Gradient ⚠️", desc: "Signals multiply by < 0.25 at each layer and die out completely before reaching early layers!", color: "text-rose-500", bar: 15 };
    }
    if (actFn === "sigmoid" && skipConnections) {
      return { score: "Saved by ResNet", desc: "Skip connection highway allows gradient signals to bypass dying layers.", color: "text-blue-500", bar: 75 };
    }
    return { score: "Optimal (ReLU + Highway)", desc: "Neurons fire crisp positive signals without fading. Modern deep learning standard!", color: "text-emerald-600", bar: 98 };
  };

  const signal = getSignalHealth();

  return (
    <div className="space-y-8">
      {/* Intro overview */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-md">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">From 1 Neuron to Deep Architectures (DNNs)</h3>
            <p className="text-slate-600 mt-1">
              A single neuron can only draw a straight line. But stack <strong>dozens or hundreds of layers</strong> together,
              and something magical happens: the network builds a <strong>hierarchy of concepts</strong>.
              Early layers spot tiny edges; middle layers combine edges into shapes; deep layers recognize whole faces, cats, and vehicles.
            </p>
          </div>
        </div>
      </div>

      {/* Preset Picker */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
          Step 1: Choose an image feeding into the Deep Network
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PRESETS.map((p) => {
            const isSel = selectedPreset.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPreset(p)}
                className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                  isSel
                    ? "border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-200"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span className="text-3xl">{p.icon}</span>
                <div>
                  <div className="font-bold text-slate-800">{p.name}</div>
                  <div className="text-xs text-slate-500 line-clamp-1">{p.tagline}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Layer Visualizer */}
      <div className="border border-slate-200 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Interactive Inspection</span>
            <h4 className="text-lg font-bold text-slate-900">How Layers "See": The Feature Hierarchy</h4>
          </div>
          {/* Layer tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold gap-1">
            {[
              { id: 0, label: "0. Raw Pixels" },
              { id: 1, label: "Layer 1: Edges" },
              { id: 2, label: "Layer 2: Shapes" },
              { id: 3, label: "Layer 3: Objects" },
              { id: 4, label: "Output: Class" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveLayer(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeLayer === tab.id
                    ? "bg-white text-indigo-700 shadow-sm font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Display of the Selected Layer */}
        {activeLayer === 0 && (
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="bg-slate-900 text-emerald-400 p-6 rounded-2xl font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner">
              <div className="text-slate-400 mb-2">// Raw Sensor Input: 224x224 RGB Pixel Values (0-255)</div>
              <div className="grid grid-cols-8 gap-1 text-center font-bold">
                {[142, 145, 150, 162, 180, 182, 178, 175,
                  139, 148, 210, 245, 230, 190, 170, 168,
                  130, 170, 255, 255, 250, 215, 165, 160,
                  125, 195, 255, 180, 195, 240, 160, 155,
                  120, 180, 250, 120, 130, 235, 158, 150,
                  115, 140, 215, 240, 235, 185, 155, 148].map((val, i) => (
                  <span
                    key={i}
                    style={{
                      backgroundColor: `rgb(${val * 0.2}, ${val * 0.4}, ${val * 0.6})`,
                      color: val > 200 ? "#000" : "#fff",
                    }}
                    className="p-1.5 rounded text-[10px]"
                  >
                    {val}
                  </span>
                ))}
              </div>
              <div className="text-slate-400 mt-3 text-center">... 50,176 individual raw numbers per color channel</div>
            </div>
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold">
                <Eye className="w-3.5 h-3.5" /> Raw Input Stage
              </div>
              <h5 className="text-xl font-bold text-slate-800">To a computer, an image is just numbers</h5>
              <p className="text-slate-600 text-sm leading-relaxed">
                When a camera snaps a {selectedPreset.name}, there is no label saying "{selectedPreset.name}".
                It's just an array of millions of brightness values between 0 (pitch black) and 255 (bright light).
              </p>
              <p className="text-slate-600 text-sm leading-relaxed">
                If the lighting dims or the camera tilts 2 degrees, <strong>every single number changes drastically</strong>.
                This is why hard-coded rules failed for 50 years. We need deep learning to distill meaning from chaos!
              </p>
              <button
                onClick={() => setActiveLayer(1)}
                className="mt-2 inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-800 text-sm"
              >
                See how Layer 1 extracts edges <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {activeLayer === 1 && (
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="grid grid-cols-2 gap-3">
              {selectedPreset.l1.map((f, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                  <div className="text-lg font-mono text-indigo-600 font-bold mb-1">{f.pattern}</div>
                  <div className="font-semibold text-xs text-slate-800">{f.label}</div>
                  <p className="text-[11px] text-slate-500 mt-1">{f.desc}</p>
                  <div className="mt-2 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${f.strength * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> Layer 1: Gabor Filters & Edges
              </div>
              <h5 className="text-xl font-bold text-slate-800">Finding the building blocks</h5>
              <p className="text-slate-600 text-sm leading-relaxed">
                Notice what these neurons look for: <strong>slanted lines, borders, and light/dark transitions</strong>.
                Astonishingly, these artificial filters look almost identical to the biological neurons in the human primary visual cortex (V1) discovered by Nobel laureates Hubel & Wiesel!
              </p>
              <button
                onClick={() => setActiveLayer(2)}
                className="mt-2 inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-800 text-sm"
              >
                Go deeper into Layer 2 <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {activeLayer === 2 && (
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="grid grid-cols-2 gap-3">
              {selectedPreset.l2.map((f, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                  <div className="text-2xl font-mono text-violet-600 font-bold mb-1">{f.pattern}</div>
                  <div className="font-semibold text-xs text-slate-800">{f.label}</div>
                  <p className="text-[11px] text-slate-500 mt-1">{f.desc}</p>
                  <div className="mt-2 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-violet-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${f.strength * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-100 text-violet-800 rounded-full text-xs font-semibold">
                <Layers className="w-3.5 h-3.5" /> Layer 2: Geometry & Textures
              </div>
              <h5 className="text-xl font-bold text-slate-800">Combining lines into shapes</h5>
              <p className="text-slate-600 text-sm leading-relaxed">
                Layer 2 doesn't look at raw pixels anymore. It listens to the outputs of Layer 1.
                Two crossing edges become a corner; four edges become a box; curved edges become circles or wheels.
              </p>
              <button
                onClick={() => setActiveLayer(3)}
                className="mt-2 inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-800 text-sm"
              >
                See high-level objects in Layer 3 <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {activeLayer === 3 && (
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="grid grid-cols-1 gap-3">
              {selectedPreset.l3.map((f, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-center gap-4">
                  <div className="text-3xl p-2 bg-white rounded-lg shadow-sm border border-slate-200">{f.pattern}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-slate-800">{f.label}</div>
                    <p className="text-xs text-slate-500 mt-0.5">{f.desc}</p>
                    <div className="mt-2 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${f.strength * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">
                <Zap className="w-3.5 h-3.5" /> Layer 3: High-Level Semantics
              </div>
              <h5 className="text-xl font-bold text-slate-800">Recognizing entire parts</h5>
              <p className="text-slate-600 text-sm leading-relaxed">
                By Layer 3, individual neurons fire when an entire complex part appears, regardless of where on screen it is.
                Whether the {selectedPreset.name} is on the left, right, small or large, these neurons trigger with confidence!
              </p>
              <button
                onClick={() => setActiveLayer(4)}
                className="mt-2 inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-800 text-sm"
              >
                See final classification decision <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {activeLayer === 4 && (
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-mono text-slate-400">Softmax Output Vector</span>
                <span className="text-xs text-emerald-400 font-mono">Normalized % (Sum = 100%)</span>
              </div>
              {selectedPreset.output.map((out, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className={out.isCorrect ? "text-emerald-300 font-bold" : "text-slate-400"}>
                      {out.class}
                    </span>
                    <span className="font-bold text-slate-200">{out.conf}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        out.isCorrect ? "bg-emerald-500" : "bg-slate-600"
                      }`}
                      style={{ width: `${out.conf}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> Output: Probability Distribution
              </div>
              <h5 className="text-xl font-bold text-slate-800">The Final Guess</h5>
              <p className="text-slate-600 text-sm leading-relaxed">
                The final layer uses a mathematical function called <strong>Softmax</strong> to convert all the raw
                neuron firing scores into a neat probability pie chart that sums to 100%.
              </p>
              <p className="text-slate-600 text-sm leading-relaxed">
                The network concludes with <strong>{selectedPreset.output[0].conf}% confidence</strong> that the image is a{" "}
                <strong>{selectedPreset.output[0].class}</strong>!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* The Secret Behind Deep Learning: Activations & Vanishing Gradients */}
      <div className="border border-slate-200 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/30 p-6 space-y-6">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Crucial Deep Learning Breakthroughs</span>
          <h4 className="text-xl font-bold text-slate-900 mt-0.5">
            Why Couldn't We Train Deep Networks Before 2012?
          </h4>
          <p className="text-slate-600 text-sm mt-1">
            In the 1990s, when researchers tried to make neural networks 10 or 20 layers deep, training failed completely.
            Two massive inventions solved this: <strong>ReLU activation</strong> and <strong>ResNet skip-connections</strong>.
          </p>
        </div>

        {/* Interactive Controls */}
        <div className="grid sm:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-slate-200">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Activation Function</label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
              <button
                onClick={() => setActFn("relu")}
                className={`py-1 rounded ${actFn === "relu" ? "bg-indigo-600 text-white font-bold" : "text-slate-700"}`}
              >
                ReLU
              </button>
              <button
                onClick={() => setActFn("sigmoid")}
                className={`py-1 rounded ${actFn === "sigmoid" ? "bg-indigo-600 text-white font-bold" : "text-slate-700"}`}
              >
                Sigmoid
              </button>
              <button
                onClick={() => setActFn("linear")}
                className={`py-1 rounded ${actFn === "linear" ? "bg-indigo-600 text-white font-bold" : "text-slate-700"}`}
              >
                Linear
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">
              Network Depth: <b>{networkDepth} Layers</b>
            </label>
            <input
              type="range"
              min={2}
              max={16}
              value={networkDepth}
              onChange={(e) => setNetworkDepth(+e.target.value)}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Shallow (2)</span>
              <span>Ultra-Deep (16)</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Skip Connections (ResNet)</label>
            <button
              onClick={() => setSkipConnections((s) => !s)}
              className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                skipConnections
                  ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                  : "bg-slate-100 border-slate-300 text-slate-500"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              {skipConnections ? "Highway Active (ResNet ON)" : "No Skips (Plain DNN)"}
            </button>
          </div>
        </div>

        {/* Signal Propagation Health Monitor */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs uppercase font-bold text-slate-400">Gradient Flow Health</div>
            <div className={`text-base font-bold ${signal.color}`}>{signal.score}</div>
            <p className="text-xs text-slate-600">{signal.desc}</p>
          </div>
          <div className="w-full sm:w-48 space-y-1">
            <div className="flex justify-between text-[11px] font-mono text-slate-500">
              <span>Signal strength</span>
              <span>{signal.bar}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border">
              <div
                className={`h-full transition-all duration-500 ${
                  signal.bar > 70 ? "bg-emerald-500" : signal.bar > 35 ? "bg-amber-500" : "bg-rose-500"
                }`}
                style={{ width: `${signal.bar}%` }}
              />
            </div>
          </div>
        </div>

        {/* Educational bullet cards */}
        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-white border border-slate-200 rounded-xl">
            <span className="font-bold text-slate-800 block mb-1">💡 What is ReLU? (max(0, x))</span>
            Old networks used Sigmoids that squashed every number between 0 and 1. When chained 10 times, 0.2 × 0.2 × 0.2 becomes 0.0000001 (vanishing gradient). ReLU simply keeps positive numbers as they are!
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-xl">
            <span className="font-bold text-slate-800 block mb-1">🛣️ The ResNet Shortcut (He et al., 2015)</span>
            Instead of forcing information through every single transform, ResNet added "skip connections" (x + F(x)). This allowed networks to scale from 16 layers to 152 layers and beyond without degrading!
          </div>
        </div>
      </div>
    </div>
  );
}
