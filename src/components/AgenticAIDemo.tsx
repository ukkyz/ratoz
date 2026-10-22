import { useState, useEffect } from "react";
import { Bot, Play, Pause, RotateCcw, CheckCircle, Terminal, FolderTree, FileText, Database, ArrowRight } from "lucide-react";

type AgentStep = {
  stepNumber: number;
  stage: "Thought" | "Action" | "Observation" | "Memory";
  title: string;
  detail: string;
  tool?: {
    name: string;
    icon: string;
    command: string;
    result: string;
  };
  fileUpdate?: {
    path: string;
    content: string;
  };
};

type AgentMission = {
  id: string;
  title: string;
  icon: string;
  objective: string;
  contextDesc: string;
  steps: AgentStep[];
  files: { path: string; category: "skills" | "memory" | "knowledge"; preview: string }[];
};

const MISSIONS: AgentMission[] = [
  {
    id: "travel",
    title: "Flight Booking & Calendar Sync",
    icon: "✈️",
    objective: "Find the lowest cost flight from SFO to Tokyo under $850 with at most 1 stop, verify user seat preference, and create a calendar invite.",
    contextDesc: "Agent accesses flight API, user profile memory, and calendar tool.",
    steps: [
      {
        stepNumber: 1,
        stage: "Thought",
        title: "Decompose Objective & Plan",
        detail: "Goal requires: 1) Query flight pricing, 2) Check personal constraints in context DB, 3) Book seat, 4) Add calendar event.",
      },
      {
        stepNumber: 2,
        stage: "Action",
        title: "Search Flight Inventory Tool",
        detail: "Calling flight aggregator API for SFO -> NRT departing next month.",
        tool: {
          name: "flight_search_api",
          icon: "🌐",
          command: 'flight_search_api(origin="SFO", dest="NRT", max_stops=1, max_price=850)',
          result: 'Found 3 options: [UA $920 direct], [ANA $780 1-stop in HNL], [JAL $810 1-stop in LAX]',
        },
      },
      {
        stepNumber: 3,
        stage: "Observation",
        title: "Analyze Flight Candidates",
        detail: "ANA flight at $780 matches price (< $850) and stop requirements (1 stop). Checking user context file for preferences.",
      },
      {
        stepNumber: 4,
        stage: "Action",
        title: "Read User Memory in Context Filesystem",
        detail: "Reading persistent profile from /knowledge/user_profile.json to check airline loyalty and seating.",
        tool: {
          name: "context_fs.read",
          icon: "📁",
          command: 'fs.read("/knowledge/user_profile.json")',
          result: '{"frequent_flyer": "Star Alliance / ANA", "seat_preference": "Aisle", "passport_valid": true}',
        },
      },
      {
        stepNumber: 5,
        stage: "Action",
        title: "Schedule Calendar Event Tool",
        detail: "Pushing reservation confirmation to user Google Calendar with check-in reminder.",
        tool: {
          name: "calendar_service.create_event",
          icon: "📅",
          command: 'calendar.create({title: "ANA #182 Flight to Tokyo", start: "2025-05-12T08:30:00", seat: "14C Aisle"})',
          result: '201 Created: Event ID #EV-9821 saved successfully.',
        },
      },
      {
        stepNumber: 6,
        stage: "Memory",
        title: "Save Mission Record into Context Database",
        detail: "Writing trip confirmation into /memory/trips/tokyo_2025.md so future prompts can reference it.",
        fileUpdate: {
          path: "/memory/trips/tokyo_2025.md",
          content: "# Tokyo May 2025\n- Flight: ANA #182 ($780)\n- Seat: 14C (Aisle)\n- Status: Confirmed & Calendar Synced",
        },
      },
    ],
    files: [
      { path: "/skills/flight_search.py", category: "skills", preview: "def search_flights(origin, dest, max_stops, budget): ..." },
      { path: "/knowledge/user_profile.json", category: "knowledge", preview: '{\n  "preferred_name": "Alex",\n  "seat_preference": "Aisle",\n  "frequent_flyer": "Star Alliance"\n}' },
      { path: "/memory/trips/tokyo_2025.md", category: "memory", preview: "# Tokyo Trip\nFlight: ANA #182 ($780)\nConfirmed!" },
    ],
  },
  {
    id: "coding",
    title: "Autonomous Bugfix & Unit Test Deploy",
    icon: "💻",
    objective: "Diagnose failing payment webhook in checkout.ts, fix the idempotency error, re-run tests, and commit.",
    contextDesc: "Autonomous software engineer agent with bash terminal and git tools.",
    steps: [
      {
        stepNumber: 1,
        stage: "Thought",
        title: "Inspect Failing Test Logs",
        detail: "CI failed on checkout_webhook test. Need to run terminal command to view exact stack trace.",
      },
      {
        stepNumber: 2,
        stage: "Action",
        title: "Run Test Suite via Shell Tool",
        detail: "Executing npm test in the sandbox terminal.",
        tool: {
          name: "bash_terminal",
          icon: "💻",
          command: "npm test -- tests/checkout_webhook.test.ts",
          result: "FAIL: stripe.charges.create failed with HTTP 400: 'Missing required header idempotency-key'",
        },
      },
      {
        stepNumber: 3,
        stage: "Thought",
        title: "Root Cause Hypothesis & Solution",
        detail: "The webhook handler is calling Stripe charge without passing an idempotencyKey. Need to add random UUID header.",
      },
      {
        stepNumber: 4,
        stage: "Action",
        title: "Edit Source Code",
        detail: "Applying patch to src/services/checkout.ts using file_editor tool.",
        tool: {
          name: "code_editor",
          icon: "📝",
          command: "patch_file(path='src/services/checkout.ts', add_header='idempotencyKey: crypto.randomUUID()')",
          result: "File updated: 1 insertion(+), 0 deletions(-)",
        },
      },
      {
        stepNumber: 5,
        stage: "Action",
        title: "Re-Verify Test Suite",
        detail: "Re-running unit test to guarantee fix works and does not regress.",
        tool: {
          name: "bash_terminal",
          icon: "💻",
          command: "npm test -- tests/checkout_webhook.test.ts",
          result: "PASS tests/checkout_webhook.test.ts (2 passed, 0 failed, 120ms)",
        },
      },
      {
        stepNumber: 6,
        stage: "Memory",
        title: "Save Skill & Fix Pattern into OpenViking Context DB",
        detail: "Saving solution to /skills/stripe_idempotency_pattern.md so future agent sessions don't repeat the bug.",
        fileUpdate: {
          path: "/skills/stripe_idempotency_pattern.md",
          content: "# Pattern: Stripe Idempotency\nAlways supply crypto.randomUUID() in webhook headers to prevent 400 errors.",
        },
      },
    ],
    files: [
      { path: "/skills/stripe_idempotency_pattern.md", category: "skills", preview: "Pattern rule: Ensure Stripe calls include unique idempotency headers." },
      { path: "/knowledge/repo_architecture.md", category: "knowledge", preview: "Architecture: Express API + TypeScript + PostgreSQL + Stripe SDK." },
      { path: "/memory/incident_reports/2025-05-fix.md", category: "memory", preview: "Incident resolved: Added idempotencyKey to checkout.ts webhook." },
    ],
  },
];

export default function AgenticAIDemo() {
  const [selectedMissionIdx, setSelectedMissionIdx] = useState<number>(0);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeFsTab, setActiveFsTab] = useState<"skills" | "memory" | "knowledge">("skills");

  const mission = MISSIONS[selectedMissionIdx];
  const totalSteps = mission.steps.length;

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentStepIdx((idx) => {
        if (idx < totalSteps - 1) {
          return idx + 1;
        } else {
          setIsPlaying(false);
          return idx;
        }
      });
    }, 2400);

    return () => clearInterval(interval);
  }, [isPlaying, totalSteps]);

  const resetMission = () => {
    setIsPlaying(false);
    setCurrentStepIdx(0);
  };

  const currentStep = mission.steps[currentStepIdx];

  return (
    <div className="space-y-8">
      {/* Overview Intro Banner */}
      <div className="bg-gradient-to-r from-cyan-50 via-sky-50 to-blue-50 border border-cyan-100 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-cyan-600 text-white rounded-xl shadow-md">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Agentic AI: From Passive Chatbots to Autonomous Actors
            </h3>
            <p className="text-slate-600 mt-1">
              A standard LLM is like a person trapped in a room with only a typewriter: it can talk, but it can't <em>do</em> anything.
              <strong>Agentic AI</strong> gives the model hands and memory: it can browse websites, run shell scripts, check databases,
              reflect on mistakes, and store long-term skills in a <strong>context filesystem</strong> (the exact philosophy behind tools like <strong>OpenViking</strong>).
            </p>
          </div>
        </div>
      </div>

      {/* Mission Picker */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
          Step 1: Choose an Autonomous Agent Mission
        </label>
        <div className="grid sm:grid-cols-2 gap-3">
          {MISSIONS.map((m, idx) => {
            const isSel = idx === selectedMissionIdx;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedMissionIdx(idx);
                  resetMission();
                }}
                className={`p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3.5 ${
                  isSel
                    ? "border-cyan-600 bg-cyan-50/50 shadow-sm ring-2 ring-cyan-200"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <span className="text-3xl">{m.icon}</span>
                <div className="flex-1">
                  <div className="font-bold text-sm text-slate-900">{m.title}</div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{m.objective}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Agent Command Center & Execution Viewer */}
      <div className="border border-slate-200 rounded-2xl bg-white p-6 shadow-sm space-y-6">
        {/* Mission status bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold text-cyan-600 uppercase tracking-widest">
              Live Agent Execution Loop (ReAct Framework)
            </span>
            <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>{mission.icon}</span> {mission.title}
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying((p) => !p)}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? "Pause Agent" : "Auto-Run Mission"}
            </button>
            <button
              onClick={() => {
                if (currentStepIdx < totalSteps - 1) setCurrentStepIdx((s) => s + 1);
              }}
              disabled={currentStepIdx >= totalSteps - 1}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1 transition-all disabled:opacity-40"
            >
              Step Forward <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetMission}
              className="p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-all"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Progress Pill track */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          {mission.steps.map((st, i) => {
            const isCompleted = i < currentStepIdx;
            const isCurrent = i === currentStepIdx;

            return (
              <button
                key={i}
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStepIdx(i);
                }}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                  isCurrent
                    ? "border-cyan-600 bg-cyan-50/80 font-bold ring-2 ring-cyan-200 shadow-xs"
                    : isCompleted
                    ? "border-emerald-300 bg-emerald-50/50 text-emerald-800"
                    : "border-slate-200 bg-slate-50 text-slate-400 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px]">Step {i + 1}</span>
                  {isCompleted ? (
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <span className="text-[10px] uppercase font-bold text-cyan-700">{st.stage}</span>
                  )}
                </div>
                <div className="truncate font-semibold">{st.title}</div>
              </button>
            );
          })}
        </div>

        {/* Active Step Details Card */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold uppercase">
                {currentStep.stage}
              </span>
              <span className="font-bold text-sm text-slate-200">
                Step {currentStep.stepNumber} of {totalSteps}: {currentStep.title}
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Status: {currentStepIdx === totalSteps - 1 ? "Completed 🎉" : "In Progress..."}
            </span>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed">{currentStep.detail}</p>

          {/* If step has tool call */}
          {currentStep.tool && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                  <Terminal className="w-3.5 h-3.5" /> Tool Invocation: {currentStep.tool.name}
                </span>
                <span className="text-slate-500">Execution Sandbox</span>
              </div>
              <div className="text-amber-300 bg-slate-900/90 p-2.5 rounded border border-slate-800/80 overflow-x-auto">
                $ {currentStep.tool.command}
              </div>
              <div className="text-emerald-400 bg-slate-900/90 p-2.5 rounded border border-slate-800/80 overflow-x-auto">
                ➜ {currentStep.tool.result}
              </div>
            </div>
          )}

          {/* If step wrote to file/memory */}
          {currentStep.fileUpdate && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-bold">
                <FileText className="w-3.5 h-3.5" />
                Context Database Write: {currentStep.fileUpdate.path}
              </div>
              <pre className="text-slate-300 bg-slate-900/90 p-2.5 rounded border border-slate-800/80 overflow-x-auto text-[11px]">
                {currentStep.fileUpdate.content}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* The Context Database & OpenViking Filesystem Connection */}
      <div className="border border-slate-200 rounded-2xl bg-white p-6 shadow-sm space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-cyan-600 uppercase tracking-widest">
              The Context Architecture
            </span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 text-[10px] font-bold">
              Filesystem-as-Memory (e.g. OpenViking)
            </span>
          </div>
          <h4 className="text-xl font-bold text-slate-900 mt-0.5">
            Why AI Agents Need a Context Database & Filesystem
          </h4>
          <p className="text-slate-600 text-sm mt-1">
            Raw LLMs have no persistent memory: when a chat session ends, all state vanishes.
            Modern agent architectures organize everything into a structured filesystem:
            <strong> Knowledge</strong> (documents & facts), <strong>Memory</strong> (past sessions & outcomes),
            and <strong>Skills</strong> (reusable executable code).
          </p>
        </div>

        {/* Interactive Filesystem Explorer */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <FolderTree className="w-4 h-4 text-cyan-600" />
              Agent Context File System: <code className="text-slate-900">/agent_root/</code>
            </div>

            {/* Folder category tabs */}
            <div className="flex bg-white p-1 rounded-lg border border-slate-200 text-xs font-semibold gap-1">
              <button
                onClick={() => setActiveFsTab("skills")}
                className={`px-3 py-1 rounded transition-all ${
                  activeFsTab === "skills" ? "bg-cyan-600 text-white font-bold" : "text-slate-600"
                }`}
              >
                /skills/
              </button>
              <button
                onClick={() => setActiveFsTab("memory")}
                className={`px-3 py-1 rounded transition-all ${
                  activeFsTab === "memory" ? "bg-cyan-600 text-white font-bold" : "text-slate-600"
                }`}
              >
                /memory/
              </button>
              <button
                onClick={() => setActiveFsTab("knowledge")}
                className={`px-3 py-1 rounded transition-all ${
                  activeFsTab === "knowledge" ? "bg-cyan-600 text-white font-bold" : "text-slate-600"
                }`}
              >
                /knowledge/
              </button>
            </div>
          </div>

          {/* Files matching active tab */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {mission.files
              .filter((f) => f.category === activeFsTab)
              .map((file, idx) => (
                <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-600 shrink-0" />
                    <span className="font-mono text-xs font-bold text-slate-800 truncate">
                      {file.path}
                    </span>
                  </div>
                  <pre className="text-[11px] font-mono bg-slate-50 p-2.5 rounded border border-slate-100 text-slate-700 whitespace-pre-wrap">
                    {file.preview}
                  </pre>
                </div>
              ))}
          </div>

          {/* Educational callout on OpenViking / Context DBs */}
          <div className="p-4 bg-white rounded-xl border border-cyan-100 flex flex-col sm:flex-row items-start gap-3.5">
            <div className="p-2.5 bg-cyan-100 text-cyan-800 rounded-lg shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div className="space-y-1 text-xs">
              <h6 className="font-bold text-slate-900 text-sm">
                How OpenViking Fits Into This Picture
              </h6>
              <p className="text-slate-600 leading-relaxed">
                Projects like <strong>OpenViking</strong> argue that AI agents shouldn't rely on opaque, messy vector blobs.
                Instead, by presenting <strong>skills, memory, and knowledge as one unified filesystem</strong>, developers and agents can:
              </p>
              <ul className="list-disc ml-4 space-y-0.5 text-slate-600 pt-1">
                <li><strong>Inspect & edit agent skills</strong> in plain markdown and Python files.</li>
                <li><strong>Delete bad habits or obsolete facts</strong> using standard file deletions.</li>
                <li><strong>Share libraries of agent tools</strong> across teams like git repositories!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
