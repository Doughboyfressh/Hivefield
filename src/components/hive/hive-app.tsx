"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Activity,
  Brain,
  Globe,
  Download,
  Hexagon,
  Pause,
  Play,
  Radio,
  RotateCcw,
  Send,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Toaster, toast } from "sonner";
import { SwarmEngine } from "@/lib/swarm/engine";
import { renderSwarm } from "@/lib/swarm/render";
import { SCENARIOS } from "@/lib/swarm/scenarios";
import {
  BEHAVIORS,
  DEFAULT_CONFIG,
  ROLE_COLOR,
  ROLE_DUTY,
  ROLE_TITLE,
  ROLES,
  SAMPLE_MISSIONS,
  type Agent,
  type HiveEvent,
  type Metrics,
  type Role,
  type SwarmConfig,
  type WorkItem,
} from "@/lib/swarm/types";
import {
  DEFAULT_LLAMA_ENDPOINT,
  QWEN_LABEL,
  QWEN_MODEL,
  loadLlamaConfig,
  probeLlama,
  saveLlamaConfig,
  type ChatMessage,
  type LlamaConfig,
} from "@/lib/llm/llama";
import { chatSwarm, runDirectorCycle, runMissionRound } from "@/lib/llm/director";
import { swarmScout, loadNetPath, saveNetPath, type BrowseTrace, type NetPath } from "@/lib/swarm/net";

type RightTab = "qwen" | "analytics" | "hive" | "log";
type PlaceMode = "resource" | "threat" | "build";

const SAVE_KEY = "hivefield.states.v1";

export function HiveApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<SwarmEngine>(null as unknown as SwarmEngine);
  if (!engineRef.current) {
    const created = new SwarmEngine();
    created.reset();
    engineRef.current = created;
  }
  const cfgRef = useRef<SwarmConfig>({ ...DEFAULT_CONFIG });
  const pausedRef = useRef(false);
  const selectedRef = useRef<string | null>(null);

  const [config, setConfig] = useState<SwarmConfig>({ ...DEFAULT_CONFIG });
  const [paused, setPaused] = useState(false);
  const [metrics, setMetrics] = useState<Metrics>(() => engineRef.current.metrics());
  const [events, setEvents] = useState<HiveEvent[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [place, setPlace] = useState<PlaceMode>("resource");
  const [tab, setTab] = useState<RightTab>("qwen");
  const [history, setHistory] = useState({ speed: [] as number[], coh: [] as number[], energy: [] as number[] });

  const [llama, setLlama] = useState<LlamaConfig>(() => ({
    endpoint: DEFAULT_LLAMA_ENDPOINT,
    model: QWEN_MODEL,
    temperature: 0.7,
    maxTokens: 512,
  }));
  const [qwenOn, setQwenOn] = useState(false);
  const [chat, setChat] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const [goal, setGoal] = useState("");
  const [directing, setDirecting] = useState(false);
  const [planThought, setPlanThought] = useState("");
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [tokens, setTokens] = useState(0);
  const [mission, setMission] = useState("");
  const [missionBusy, setMissionBusy] = useState(false);
  const [round, setRound] = useState(0);
  const [artifacts, setArtifacts] = useState<{ id: string; title: string; body: string; by: string }[]>([]);
  const [netLog, setNetLog] = useState<BrowseTrace[]>([]);
  const [work, setWork] = useState<WorkItem[]>([]);
  const [leads, setLeads] = useState<Agent[]>([]);
  const [netPath, setNetPath] = useState<NetPath>("device");
  const [scoutQ, setScoutQ] = useState("");
  const [scoutBusy, setScoutBusy] = useState(false);
  const chatHist = useRef<ChatMessage[]>([]);
  const directingRef = useRef(false);

  useEffect(() => {
    cfgRef.current = config;
    engineRef.current.config = config;
  }, [config]);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);
  useEffect(() => {
    directingRef.current = directing;
  }, [directing]);

  useEffect(() => {
    setLlama(loadLlamaConfig());
    setNetPath(loadNetPath());
  }, []);

  const patch = useCallback((p: Partial<SwarmConfig>) => {
    setConfig((c) => {
      const next = { ...c, ...p };
      engineRef.current.config = next;
      cfgRef.current = next;
      if (p.agentCount != null) engineRef.current.setCount(p.agentCount);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    engineRef.current.reset(cfgRef.current);
    setEvents([...engineRef.current.events]);
    setHistory({ speed: [], coh: [], energy: [] });
    setRound(0);
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const eng = engineRef.current;
    let lastW = 0;
    let lastH = 0;
    let lastDpr = 0;
    let ctx: CanvasRenderingContext2D | null = null;
    const size = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(320, Math.floor(rect.width));
      const h = Math.max(280, Math.floor(rect.height));
      if (w === lastW && h === lastH && dpr === lastDpr) return;
      lastW = w;
      lastH = h;
      lastDpr = dpr;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      eng.resize(w, h);
    };
    const ro = new ResizeObserver(() => size());
    ro.observe(wrap);
    size();

    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const STEP = 1 / 60;
    let snap = 0;
    let lastEvt = "";
    let alive = true;

    const loop = (now: number) => {
      if (!alive) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!pausedRef.current) {
        acc += dt;
        let guard = 0;
        while (acc >= STEP && guard++ < 3) {
          eng.step(STEP);
          acc -= STEP;
        }
        if (acc > STEP * 3) acc = 0;
      }
      if (ctx) renderSwarm(ctx, eng, selectedRef.current);
      snap += dt;
      if (snap > 0.5) {
        snap = 0;
        const m = eng.metrics();
        setMetrics(m);
        const head = eng.events[0]?.id ?? "";
        if (head !== lastEvt) {
          lastEvt = head;
          setEvents([...eng.events]);
        }
        setHistory((h) => ({
          speed: [...h.speed, m.avgSpeed].slice(-48),
          coh: [...h.coh, m.coherence * 100].slice(-48),
          energy: [...h.energy, m.avgEnergy].slice(-48),
        }));
        setWork([...eng.work]);
        setLeads(eng.leads());
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        setPaused((p) => !p);
      }
      if (e.key === "r" || e.key === "R") reset();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reset]);

  const onFieldClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const eng = engineRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * eng.w;
    const y = ((e.clientY - rect.top) / rect.height) * eng.h;
    const hit = eng.agents.find((a) => Math.hypot(a.position.x - x, a.position.y - y) < 16);
    if (hit) {
      setSelected(hit.id);
      return;
    }
    if (config.obstacleMode || place === "threat") eng.addThreat(x, y);
    else if (config.constructionEnabled && place === "build") eng.addStructure(x, y);
    else eng.addResource(x, y);
    setEvents([...eng.events]);
  };

  const applyScenario = (id: string) => {
    const s = SCENARIOS.find((x) => x.id === id);
    if (!s) return;
    const next = { ...cfgRef.current, ...s.config };
    setConfig(next);
    cfgRef.current = next;
    engineRef.current.reset(next);
    setEvents([...engineRef.current.events]);
  };

  const recordNet = (traces: BrowseTrace[]) => {
    if (!traces.length) return;
    setNetLog((n) => [...traces, ...n].slice(0, 24));
    traces.forEach((t) => engineRef.current.log("browse", `${t.agent} · ${t.tool} · ${t.detail}`, t.ok ? "ok" : "warn"));
    setEvents([...engineRef.current.events]);
  };

  const selectedAgent = engineRef.current.agents.find((a) => a.id === selected) ?? null;

  const sendChat = async () => {
    const text = chatInput.trim();
    if (!text || chatBusy) return;
    setChatInput("");
    setChat((c) => [...c, { role: "user", content: text }]);
    setChatBusy(true);
    engineRef.current.agents.forEach((a) => {
      if (a.role === "explorer" || a.role === "scout") a.state = "thinking";
    });
    const res = await chatSwarm(llama, chatHist.current, text, engineRef.current.metrics(), cfgRef.current);
    engineRef.current.agents.forEach((a) => {
      if (a.state === "thinking" && (a.role === "explorer" || a.role === "scout")) a.state = "moving";
    });
    setChatBusy(false);
    if (res.traces?.length) recordNet(res.traces);
    if (!res.ok) {
      setChat((c) => [...c, { role: "assistant", content: `Offline. ${res.error}` }]);
      setQwenOn(false);
      return;
    }
    chatHist.current = [
      ...chatHist.current,
      { role: "user" as const, content: text },
      { role: "assistant" as const, content: res.text },
    ].slice(-16);
    setChat((c) => [...c, { role: "assistant", content: res.text }]);
    setTokens((t) => t + res.tokens);
    setQwenOn(res.tokens > 0);
  };

  const directorOnce = useCallback(async () => {
    const live = await probeLlama(llama.endpoint);
    if (!live) {
      setPlanThought("Qwen is offline. Start llama.cpp (Qwen 3.6 27B) and probe the endpoint.");
      setQwenOn(false);
      setDirecting(false);
      return;
    }
    const res = await runDirectorCycle(llama, {
      goal,
      metrics: engineRef.current.metrics(),
      config: cfgRef.current,
      recent: engineRef.current.events.slice(0, 6).map((e) => e.text),
    });
    if (!res.ok) {
      setPlanThought(res.error);
      setQwenOn(false);
      setDirecting(false);
      return;
    }
    setQwenOn(true);
    setPlanThought(res.plan.thought);
    setTokens((t) => t + res.tokens);
    const notes: string[] = [];
    for (const a of res.plan.actions) {
      notes.push(engineRef.current.applyAction(a));
    }
    setConfig({ ...engineRef.current.config });
    setActionLog((l) => [...notes, ...l].slice(0, 24));
    engineRef.current.log("ai", res.plan.thought, "info");
    return res.plan.nextCheckIn;
  }, [goal, llama]);

  useEffect(() => {
    if (!directing) return;
    let stop = false;
    const run = async () => {
      while (!stop && directingRef.current) {
        const wait = (await directorOnce()) ?? 12;
        await new Promise((r) => setTimeout(r, wait * 1000));
      }
    };
    void run();
    return () => {
      stop = true;
    };
  }, [directing, directorOnce]);

  const deployMission = async () => {
    if (!mission.trim() || missionBusy) return;
    setMissionBusy(true);
    setRound(0);
    setArtifacts([]);
    engineRef.current.log("ai", "Mission accepted by the hive.", "ok");
    let prior = "";
    for (let r = 1; r <= 3; r++) {
      setRound(r);
      engineRef.current.agents.forEach((a) => {
        if (["coordinator", "explorer", "worker", "scout", "carrier"].includes(a.role)) a.state = "thinking";
      });
      const res = await runMissionRound(llama, {
        mission: mission.trim(),
        round: r,
        hive: engineRef.current.hive.map((h) => h.text),
        prior,
      });
      if (!res.ok) {
        engineRef.current.log("ai", res.error, "critical");
        if (res.traces?.length) recordNet(res.traces);
        setQwenOn(false);
        break;
      }
      setQwenOn(res.tokens > 0);
      setTokens((t) => t + res.tokens);
      if (res.traces.length) recordNet(res.traces);
      prior += `\nR${r}: ${res.brief}`;
      res.notes.forEach((n) => engineRef.current.remember(n));
      for (const job of res.assignments) {
        const role = job.role as Role;
        if ((ROLES as string[]).includes(role) && job.task) engineRef.current.assignWork(role, job.task);
      }
      setWork([...engineRef.current.work]);
      setArtifacts((a) => [
        ...a,
        ...res.artifacts.map((art, i) => ({
          id: `${r}-${i}-${art.title}`,
          title: art.title,
          body: art.body,
          by: art.by,
        })),
      ]);
      engineRef.current.log("ai", res.brief, "ok");
      toast.message(`Round ${r}/3`, { description: res.brief.slice(0, 140) });
    }
    engineRef.current.agents.forEach((a) => {
      if (a.state === "thinking") a.state = "moving";
    });
    setMissionBusy(false);
  };

  const dispatchScout = async () => {
    const q = scoutQ.trim();
    if (!q || scoutBusy) return;
    setScoutBusy(true);
    engineRef.current.agents.forEach((a) => {
      if (a.role === "explorer" || a.role === "scout") a.state = "thinking";
    });
    const dossier = await swarmScout(q, { force: true, follow: true });
    engineRef.current.agents.forEach((a) => {
      if (a.state === "thinking" && (a.role === "explorer" || a.role === "scout")) a.state = "moving";
    });
    recordNet(dossier.traces);
    engineRef.current.assignWork("explorer", `Scout: ${q.slice(0, 80)}`);
    if (dossier.brief) {
      engineRef.current.remember(`Scout dossier: ${q}`);
      setArtifacts((a) => [
        { id: `scout-${Date.now()}`, title: `Dossier · ${q.slice(0, 48)}`, body: dossier.brief, by: "Kepler" },
        ...a,
      ]);
    }
    engineRef.current.log("browse", dossier.brief ? "Kepler/Vesper returned a dossier." : "Kepler/Vesper found nothing.", dossier.brief ? "ok" : "warn");
    setEvents([...engineRef.current.events]);
    toast.message(dossier.brief ? "Dossier in hive" : "Scout empty", { description: q.slice(0, 80) });
    setScoutBusy(false);
  };

  const saveState = () => {
    const name = `hive-${new Date().toISOString().slice(11, 19)}`;
    const bag = JSON.parse(localStorage.getItem(SAVE_KEY) || "[]") as { name: string; config: SwarmConfig }[];
    bag.unshift({ name, config });
    localStorage.setItem(SAVE_KEY, JSON.stringify(bag.slice(0, 12)));
    engineRef.current.log("system", `State saved as ${name}.`, "ok");
    setEvents([...engineRef.current.events]);
  };

  const saved = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(SAVE_KEY) || "[]") as { name: string; config: SwarmConfig }[];
    } catch {
      return [];
    }
  }, [events.length]);

  return (
    <div className="flex h-dvh min-h-0 flex-col bg-bg text-fg">
      <Toaster theme="dark" position="bottom-right" richColors={false} />
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
        <Hexagon className="size-5 text-signal" strokeWidth={1.75} />
        <div className="min-w-0">
          <div className="text-sm font-medium tracking-tight">Hivefield</div>
          <div className="text-xs text-muted">Operations · {QWEN_LABEL} air-gapped · swarm holds the net</div>
        </div>
        <div className="ml-auto flex min-w-0 items-center gap-2">
          <div className="mr-2 hidden min-w-0 items-center gap-1 lg:flex">
            {leads.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelected(a.id)}
                className={cn(
                  "flex h-8 items-center gap-1.5 rounded-md px-2 text-xs",
                  selected === a.id ? "bg-raised text-fg" : "text-muted hover:text-fg",
                )}
                title={`${a.name} · ${a.state}`}
              >
                <span className="size-1.5 rounded-full" style={{ background: ROLE_COLOR[a.role] }} />
                {a.name}
              </button>
            ))}
          </div>
          <StatusDot on={qwenOn} label={qwenOn ? QWEN_LABEL : "Qwen offline"} />
          <Button variant="ghost" size="icon" aria-label={paused ? "Resume" : "Pause"} onClick={() => setPaused((p) => !p)}>
            {paused ? <Play className="ml-0.5" /> : <Pause />}
          </Button>
          <Button variant="ghost" size="icon" aria-label="Reset swarm" onClick={reset}>
            <RotateCcw />
          </Button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 min-[1100px]:grid-cols-[240px_minmax(0,1fr)_300px]">
        <aside className="min-h-0 overflow-y-auto border-r border-border p-3">
          <Section title="Behavior">
            <div className="grid grid-cols-1 gap-1">
              {BEHAVIORS.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    engineRef.current.setBehavior(b.id);
                    patch({ behavior: b.id });
                  }}
                  className={cn(
                    "rounded-sm px-3 py-2 text-left text-sm transition-colors duration-150",
                    config.behavior === b.id ? "bg-raised text-fg" : "text-muted hover:text-fg",
                  )}
                >
                  <div className="font-medium">{b.label}</div>
                  <div className="text-xs text-subtle">{b.blurb}</div>
                </button>
              ))}
            </div>
          </Section>

          <Section title="Scenarios">
            <div className="flex flex-col gap-1">
              {SCENARIOS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => applyScenario(s.id)}
                  className="rounded-sm px-3 py-2 text-left text-sm text-muted hover:bg-raised hover:text-fg"
                >
                  {s.name}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Parameters">
            <SliderRow label="Agents" value={config.agentCount} min={5} max={80} step={1} onChange={(v) => patch({ agentCount: v })} />
            <SliderRow label="Separation" value={config.separationWeight} min={0} max={4} step={0.1} onChange={(v) => patch({ separationWeight: v })} />
            <SliderRow label="Alignment" value={config.alignmentWeight} min={0} max={4} step={0.1} onChange={(v) => patch({ alignmentWeight: v })} />
            <SliderRow label="Cohesion" value={config.cohesionWeight} min={0} max={4} step={0.1} onChange={(v) => patch({ cohesionWeight: v })} />
            <SliderRow label="Explore" value={config.explorationWeight} min={0} max={3} step={0.1} onChange={(v) => patch({ explorationWeight: v })} />
            <SliderRow label="Perception" value={config.perceptionRadius} min={30} max={160} step={2} onChange={(v) => patch({ perceptionRadius: v })} />
            <SliderRow label="Max speed" value={config.maxSpeed} min={1} max={6} step={0.1} onChange={(v) => patch({ maxSpeed: v })} />
            <SliderRow label="Clock" value={config.speed} min={0.2} max={2.4} step={0.1} onChange={(v) => patch({ speed: v })} />
          </Section>

          <Section title="Systems">
            <Toggle label="Trails" value={config.showTrails} onChange={(v) => patch({ showTrails: v })} />
            <Toggle label="Links" value={config.showConnections} onChange={(v) => patch({ showConnections: v })} />
            <Toggle label="Perception" value={config.showPerception} onChange={(v) => patch({ showPerception: v })} />
            <Toggle label="Pheromone" value={config.pheromoneEnabled} onChange={(v) => patch({ pheromoneEnabled: v, showHeatmap: v || config.showHeatmap })} />
            <Toggle label="Heatmap" value={config.showHeatmap} onChange={(v) => patch({ showHeatmap: v })} />
            <Toggle label="Neural nets" value={config.neuralNetEnabled} onChange={(v) => patch({ neuralNetEnabled: v })} />
            <Toggle label="Evolution" value={config.evolutionEnabled} onChange={(v) => patch({ evolutionEnabled: v, neuralNetEnabled: v || config.neuralNetEnabled })} />
            <Toggle label="Q-learning" value={config.qLearningEnabled} onChange={(v) => patch({ qLearningEnabled: v })} />
            <Toggle label="Hive memory" value={config.memoryEnabled} onChange={(v) => patch({ memoryEnabled: v })} />
            <Toggle label="World / wind" value={config.environmentEnabled} onChange={(v) => patch({ environmentEnabled: v })} />
            <Toggle label="Construction" value={config.constructionEnabled} onChange={(v) => patch({ constructionEnabled: v })} />
            <Toggle label="Lifecycle" value={config.lifecycleEnabled} onChange={(v) => patch({ lifecycleEnabled: v })} />
            <Toggle label="Hazard click" value={config.obstacleMode} onChange={(v) => patch({ obstacleMode: v })} />
            {config.environmentEnabled && (
              <>
                <SliderRow label="Wind" value={config.windStrength} min={0} max={2.5} step={0.1} onChange={(v) => patch({ windStrength: v })} />
                <SliderRow label="Wind dir" value={config.windDirection} min={0} max={6.28} step={0.05} onChange={(v) => patch({ windDirection: v })} />
              </>
            )}
          </Section>

          <Section title="Place on field">
            <div className="flex gap-1">
              {(["resource", "threat", "build"] as PlaceMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setPlace(m)}
                  className={cn("h-10 flex-1 rounded-sm text-xs capitalize", place === m ? "bg-raised text-fg" : "text-muted")}
                >
                  {m}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-subtle">Click the field to drop. Click an agent to inspect. Space pauses, R resets.</p>
          </Section>
        </aside>

        <main className="relative min-h-[420px] min-w-0">
          <div ref={wrapRef} className="absolute inset-0">
            <canvas
              ref={canvasRef}
              className="block size-full"
              onClick={onFieldClick}
              role="img"
              aria-label="Live swarm field"
            />
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap gap-2 p-3">
            <Chip label="Speed" value={metrics.avgSpeed.toFixed(1)} />
            <Chip label="Coherence" value={`${Math.round(metrics.coherence * 100)}%`} />
            <Chip label="Energy" value={`${Math.round(metrics.avgEnergy)}`} />
            <Chip label="Links" value={`${metrics.connections}`} />
            <Chip label="Gen" value={`${metrics.generation}`} />
            <Chip label="Jobs" value={`${metrics.workActive}/${metrics.workDone}`} />
            <Chip label="Res" value={`${metrics.resourcesFound}/${metrics.resourcesTotal}`} />
            {config.environmentEnabled && (
              <Chip
                label="World"
                value={`${clock(engineRef.current.world.time)} ${engineRef.current.world.weather}`}
              />
            )}
          </div>
        </main>

        <aside className="min-h-0 overflow-y-auto border-l border-border p-3">
          <div className="mb-3 flex gap-1 rounded-lg bg-surface p-1">
            {(
              [
                ["qwen", "Qwen"],
                ["analytics", "Stats"],
                ["hive", "Hive"],
                ["log", "Log"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={cn(
                  "h-9 flex-1 rounded-md text-xs font-medium",
                  tab === id ? "bg-raised text-fg" : "text-muted",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "qwen" && (
            <div className="space-y-4">
              <Section title={`${QWEN_LABEL} · llama.cpp`}>
                <div className="space-y-2">
                  <p className="text-xs leading-relaxed text-muted">
                    Qwen is air-gapped — no search, no fetch. Kepler (explorer) and Vesper (scout) hold the only internet. They gather a dossier; Qwen reasons on that.
                  </p>
                  <label className="text-xs text-muted">Brain endpoint</label>
                  <input
                    className="h-10 w-full rounded-md bg-raised px-3 font-mono text-xs text-fg outline-none ring-1 ring-border focus:ring-ring"
                    value={llama.endpoint}
                    onChange={(e) => setLlama((c) => ({ ...c, endpoint: e.target.value }))}
                    onBlur={() => saveLlamaConfig(llama)}
                    spellCheck={false}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={async () => {
                        saveLlamaConfig(llama);
                        setQwenOn(await probeLlama(llama.endpoint));
                      }}
                    >
                      <Radio /> Probe
                    </Button>
                    <Button variant="secondary" size="sm" onClick={saveState}>
                      Save
                    </Button>
                  </div>
                  <p className="text-xs text-subtle">
                    Same contract as your project: POST /v1/chat/completions. Point this at your llama.cpp OpenAI server. Model stays locked to {QWEN_MODEL}. Scout still works if the brain is offline.
                  </p>
                </div>
              </Section>

              <Section title="Live net · Kepler & Vesper">
                <p className="mb-2 text-xs leading-relaxed text-muted">
                  Only the swarm's explorer and scout fetch. Qwen is air-gapped. Dispatch Kepler/Vesper even when the brain is offline.
                </p>
                <div className="mb-2 flex gap-1 rounded-lg bg-surface p-1">
                  {(
                    [
                      ["device", "This computer"],
                      ["relay", "Relay"],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      className={cn(
                        "h-9 flex-1 rounded-md text-sm",
                        netPath === id ? "bg-raised text-fg" : "text-muted",
                      )}
                      onClick={() => {
                        setNetPath(id);
                        saveNetPath(id);
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="mb-2 text-xs text-subtle">
                  {netPath === "device"
                    ? "Kepler/Vesper fetch from this computer. Falls back to relay if a site blocks the browser."
                    : "Kepler/Vesper fetch through Hivefield's relay."}
                </p>
                <div className="mb-2 flex gap-2">
                  <input
                    className="h-10 min-w-0 flex-1 rounded-md bg-raised px-3 text-sm outline-none ring-1 ring-border focus:ring-ring"
                    value={scoutQ}
                    onChange={(e) => setScoutQ(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && void dispatchScout()}
                    placeholder="Query or URL"
                    disabled={scoutBusy}
                  />
                  <Button size="sm" onClick={() => void dispatchScout()} disabled={scoutBusy || !scoutQ.trim()}>
                    <Globe />
                    {scoutBusy ? "Fetching" : "Scout"}
                  </Button>
                </div>
                {netLog.length === 0 ? (
                  <p className="text-xs text-subtle">No fetches yet — scout, deploy a research mission, or ask in chat.</p>
                ) : (
                  <ul className="space-y-1">
                    {netLog.slice(0, 8).map((t, i) => (
                      <li key={`${t.agent}-${t.tool}-${i}`} className="flex gap-2 font-mono text-xs">
                        <Globe className={cn("mt-0.5 size-3.5 shrink-0", t.ok ? "text-signal" : "text-danger")} />
                        <span className="min-w-0 break-all text-muted">
                          {t.agent} · {t.tool} · {t.detail}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              <Section title="Director">
                <input
                  className="mb-2 h-10 w-full rounded-md bg-raised px-3 text-sm text-fg outline-none ring-1 ring-border focus:ring-ring"
                  placeholder="Goal — maximize gather, hold formation…"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                />
                <Button
                  variant={directing ? "danger" : "primary"}
                  size="sm"
                  className="w-full"
                  onClick={() => setDirecting((d) => !d)}
                >
                  {directing ? <Square /> : <Brain />}
                  {directing ? "Stop director" : "Start Qwen director"}
                </Button>
                {planThought && <p className="mt-2 text-xs leading-relaxed text-muted">{planThought}</p>}
                <ul className="mt-2 space-y-1">
                  {actionLog.slice(0, 6).map((a, i) => (
                    <li key={i} className="font-mono text-xs text-subtle">
                      {a}
                    </li>
                  ))}
                </ul>
              </Section>

              <Section title="Mission">
                <textarea
                  className="mb-2 min-h-24 w-full resize-y rounded-md bg-raised p-3 text-sm text-fg outline-none ring-1 ring-border focus:ring-ring"
                  placeholder="Give the five specialists a real job."
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                />
                <div className="mb-2 flex flex-col gap-1">
                  {SAMPLE_MISSIONS.map((m) => (
                    <button
                      key={m}
                      className="rounded-sm px-2 py-2 text-left text-xs text-muted hover:bg-raised hover:text-fg"
                      onClick={() => setMission(m)}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <Button className="w-full" size="sm" disabled={missionBusy || !mission.trim()} onClick={() => void deployMission()}>
                  {missionBusy ? `Round ${round}/3` : "Deploy specialists"}
                </Button>
                {artifacts.map((a) => (
                  <article key={a.id} className="mt-2 rounded-md bg-raised p-3">
                    <div className="text-xs text-muted">{a.by}</div>
                    <h3 className="text-sm font-medium">{a.title}</h3>
                    <pre className="mt-1 whitespace-pre-wrap font-sans text-xs leading-relaxed text-muted">{a.body}</pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        const blob = new Blob([`# ${a.title}\n\n_by ${a.by}_\n\n${a.body}\n`], { type: "text/markdown" });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.href = url;
                        link.download = `${a.title.replace(/[^\w.-]+/g, "-").slice(0, 48)}.md`;
                        link.click();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      <Download />
                      Export
                    </Button>
                  </article>
                ))}
              </Section>

              <Section title="Chat">
                <div className="mb-2 max-h-56 space-y-2 overflow-y-auto">
                  {chat.length === 0 && <p className="text-xs text-subtle">Ask Qwen about the live swarm.</p>}
                  {chat.map((m, i) => (
                    <div
                      key={i}
                      className={cn(
                        "rounded-md px-3 py-2 text-xs leading-relaxed",
                        m.role === "user" ? "ml-6 bg-raised" : "mr-4 bg-surface ring-1 ring-border",
                      )}
                    >
                      {m.content}
                    </div>
                  ))}
                  {chatBusy && <div className="text-xs text-muted">Kepler/Vesper fetching · Qwen reasons locally…</div>}
                </div>
                <div className="flex gap-2">
                  <input
                    className="h-10 min-w-0 flex-1 rounded-md bg-raised px-3 text-sm outline-none ring-1 ring-border focus:ring-ring"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && void sendChat()}
                    placeholder="Ask the swarm — Kepler/Vesper fetch, Qwen stays local…"
                  />
                  <Button size="icon" aria-label="Send" onClick={() => void sendChat()} disabled={chatBusy}>
                    <Send />
                  </Button>
                </div>
                <div className="mt-2 font-mono text-xs text-subtle">tokens {tokens}</div>
              </Section>
            </div>
          )}

          {tab === "analytics" && (
            <div className="space-y-3">
              <Spark label="Speed" data={history.speed} />
              <Spark label="Coherence" data={history.coh} />
              <Spark label="Energy" data={history.energy} />
              <div className="grid grid-cols-2 gap-2">
                <Stat k="Messages" v={metrics.messages} />
                <Stat k="Clusters" v={metrics.clusters} />
                <Stat k="Structures" v={metrics.structures} />
                <Stat k="Threats" v={metrics.threats} />
                <Stat k="Hive notes" v={metrics.hiveSize} />
                <Stat k="Jobs" v={`${metrics.workActive} live`} />
                <Stat k="Closed" v={metrics.workDone} />
                <Stat k="Q explore" v={metrics.qExplore.toFixed(2)} />
              </div>
              {selectedAgent && (
                <Section title={`${selectedAgent.name} · ${ROLE_TITLE[selectedAgent.role]}`}>
                  <p className="text-xs text-muted">{ROLE_DUTY[selectedAgent.role]}</p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <Stat k="Energy" v={Math.round(selectedAgent.energy)} />
                    <Stat k="Fitness" v={Math.round(selectedAgent.fitness)} />
                    <Stat k="State" v={selectedAgent.state} />
                    <Stat k="Gen" v={selectedAgent.generation} />
                  </div>
                  <div className="mt-2 space-y-1">
                    {Object.entries(selectedAgent.traits).map(([k, v]) => (
                      <div key={k} className="flex items-center gap-2 text-xs">
                        <span className="w-24 capitalize text-muted">{k}</span>
                        <div className="h-1 flex-1 rounded-full bg-raised">
                          <div className="h-full rounded-full bg-accent" style={{ width: `${v * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </div>
          )}

          {tab === "hive" && (
            <div className="space-y-4">
              <Section title="Roster">
                <ul className="space-y-1">
                  {leads.map((a) => (
                    <li key={a.id}>
                      <button
                        className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs hover:bg-raised"
                        onClick={() => setSelected(a.id)}
                      >
                        <span className="size-2 rounded-full" style={{ background: ROLE_COLOR[a.role] }} />
                        <span className="font-medium">{a.name}</span>
                        <span className="text-subtle">{ROLE_TITLE[a.role]}</span>
                        <span className="ml-auto capitalize text-muted">{a.state}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </Section>
              <Section title="Work queue">
                {work.length === 0 && <p className="text-xs text-subtle">No jobs — deploy a mission or start the director.</p>}
                <ul className="space-y-2">
                  {work.slice(0, 12).map((w) => (
                    <li key={w.id} className="rounded-md bg-raised p-3">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-medium">{w.agentName}</span>
                        <span className="capitalize text-muted">{w.status}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted">{w.title}</p>
                      <div className="mt-2 h-1 rounded-full bg-surface">
                        <div className="h-full rounded-full bg-signal" style={{ width: `${Math.round(w.progress * 100)}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              </Section>
              <Section title="Hive memory">
                {engineRef.current.hive.length === 0 && <p className="text-xs text-subtle">Empty — discoveries land here.</p>}
                {engineRef.current.hive.map((n) => (
                  <div key={n.id} className="rounded-md bg-raised px-3 py-2 text-xs text-fg">
                    {n.text}
                  </div>
                ))}
              </Section>
              {saved.length > 0 && (
                <Section title="Saved configs">
                  {saved.map((s) => (
                    <button
                      key={s.name}
                      className="block w-full rounded-sm px-2 py-2 text-left text-xs text-muted hover:bg-raised hover:text-fg"
                      onClick={() => {
                        setConfig(s.config);
                        engineRef.current.reset(s.config);
                      }}
                    >
                      {s.name}
                    </button>
                  ))}
                </Section>
              )}
            </div>
          )}

          {tab === "log" && (
            <ol className="space-y-1">
              {events.map((e) => (
                <li key={e.id} className="flex gap-2 rounded-md px-2 py-2 text-xs">
                  <Activity
                    className={cn(
                      "mt-0.5 size-3.5 shrink-0",
                      e.severity === "ok"
                        ? "text-signal"
                        : e.severity === "warn"
                          ? "text-warn"
                          : e.severity === "critical"
                            ? "text-danger"
                            : "text-muted",
                    )}
                  />
                  <span className="text-muted">{e.text}</span>
                </li>
              ))}
            </ol>
          )}
        </aside>
      </div>
    </div>
  );
}

function Section({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("mb-1", className)}>
      <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-subtle">{title}</h2>
      {children}
    </section>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="mb-2 block">
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-muted">{label}</span>
        <span className="font-mono tabular-nums text-subtle">{Number.isInteger(step) ? value : value.toFixed(1)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-8 w-full accent-accent"
      />
    </label>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex h-10 w-full items-center justify-between rounded-sm px-1 text-sm"
    >
      <span className="text-muted">{label}</span>
      <span className={cn("h-5 w-9 rounded-full p-0.5 transition-colors duration-150", value ? "bg-signal" : "bg-raised")}>
        <span className={cn("block size-4 rounded-full bg-bg transition-transform duration-150", value ? "translate-x-4" : "translate-x-0")} />
      </span>
    </button>
  );
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div className="pointer-events-auto rounded-md bg-surface/90 px-2.5 py-1.5 shadow-[var(--shadow-border)] backdrop-blur-sm">
      <div className="text-[10px] uppercase tracking-wider text-subtle">{label}</div>
      <div className="font-mono text-sm tabular-nums">{value}</div>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: number | string }) {
  return (
    <div className="rounded-md bg-raised p-3">
      <div className="text-[10px] uppercase tracking-wider text-subtle">{k}</div>
      <div className="font-mono text-lg tabular-nums">{v}</div>
    </div>
  );
}

function Spark({ label, data }: { label: string; data: number[] }) {
  const max = Math.max(1, ...data);
  const pts = data
    .map((d, i) => {
      const x = data.length < 2 ? 0 : (i / (data.length - 1)) * 120;
      const y = 28 - (d / max) * 26;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <div className="rounded-md bg-raised p-3">
      <div className="mb-1 text-[10px] uppercase tracking-wider text-subtle">{label}</div>
      <svg viewBox="0 0 120 28" className="h-8 w-full" aria-hidden>
        <polyline fill="none" stroke="currentColor" strokeWidth="1.4" className="text-accent" points={pts} />
      </svg>
    </div>
  );
}

function StatusDot({ on, label }: { on: boolean; label: string }) {
  return (
    <div className="hidden items-center gap-2 pr-2 sm:flex">
      <span className={cn("size-1.5 rounded-full", on ? "bg-signal" : "bg-danger")} />
      <span className="text-xs text-muted">{label}</span>
    </div>
  );
}

function clock(t: number) {
  const h = Math.floor(t) % 24;
  const m = Math.floor((t % 1) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
