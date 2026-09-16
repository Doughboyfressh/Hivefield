import type { Metrics, SwarmConfig } from "@/lib/swarm/types";
import { llamaChat, parseJsonObject, SWARM_SYSTEM, type ChatMessage, type LlamaConfig } from "./llama";

export interface DirectorAction {
  type: "set_behavior" | "adjust_param" | "toggle_feature" | "spawn_resource";
  param?: string;
  value?: number;
  behavior?: string;
  feature?: string;
  enabled?: boolean;
}

export interface DirectorPlan {
  thought: string;
  actions: DirectorAction[];
  nextCheckIn: number;
  confidence: number;
}

export async function runDirectorCycle(
  cfg: LlamaConfig,
  input: {
    goal: string;
    metrics: Metrics;
    config: SwarmConfig;
    recent: string[];
  },
): Promise<{ ok: true; plan: DirectorPlan; raw: string; tokens: number } | { ok: false; error: string }> {
  const messages: ChatMessage[] = [
    { role: "system", content: SWARM_SYSTEM },
    {
      role: "user",
      content: `You are the autonomous director. Optimize the live swarm.

Goal: ${input.goal || "Keep the swarm healthy and productive."}

State:
- agents: ${input.config.agentCount}
- behavior: ${input.config.behavior}
- energy: ${input.metrics.avgEnergy.toFixed(1)}
- coherence: ${(input.metrics.coherence * 100).toFixed(1)}%
- resources: ${input.metrics.resourcesFound}/${input.metrics.resourcesTotal}
- links: ${input.metrics.connections}
- generation: ${input.metrics.generation}
- clusters: ${input.metrics.clusters}
- weather: (see world)
- pheromone: ${input.metrics.pheromone.toFixed(1)}

Parameters:
- separation ${input.config.separationWeight}
- alignment ${input.config.alignmentWeight}
- cohesion ${input.config.cohesionWeight}
- explore ${input.config.explorationWeight}
- perception ${input.config.perceptionRadius}
- speed ${input.config.maxSpeed}

Features: pheromone=${input.config.pheromoneEnabled} neural=${input.config.neuralNetEnabled} evolution=${input.config.evolutionEnabled} memory=${input.config.memoryEnabled} env=${input.config.environmentEnabled} qlearn=${input.config.qLearningEnabled} construct=${input.config.constructionEnabled} lifecycle=${input.config.lifecycleEnabled}

Recent: ${input.recent.slice(0, 6).join(" | ") || "none"}

Respond ONLY with JSON:
{"thought":"...","actions":[{"type":"set_behavior","behavior":"flocking"} | {"type":"adjust_param","param":"cohesionWeight","value":1.8} | {"type":"toggle_feature","feature":"pheromoneEnabled","enabled":true} | {"type":"spawn_resource"}],"nextCheckIn":10,"confidence":0.7}

Behaviors: flocking, search_rescue, resource_gathering, formation, patrol, consensus, predator_prey, neural_evolution, stigmergy
Params: separationWeight, alignmentWeight, cohesionWeight, explorationWeight, perceptionRadius, maxSpeed, speed, evolutionRate, windStrength
Features: pheromoneEnabled, neuralNetEnabled, evolutionEnabled, memoryEnabled, environmentEnabled, qLearningEnabled, constructionEnabled, lifecycleEnabled, showTrails, showConnections, showHeatmap`,
    },
  ];

  const res = await llamaChat(cfg, messages, 500);
  if (!res.ok) return { ok: false, error: res.error || "Qwen did not answer" };
  const plan = parseJsonObject<DirectorPlan>(res.content);
  if (!plan || !Array.isArray(plan.actions)) {
    return { ok: false, error: "Qwen returned an unreadable plan" };
  }
  return {
    ok: true,
    plan: {
      thought: plan.thought || "",
      actions: plan.actions,
      nextCheckIn: Math.max(6, Math.min(30, plan.nextCheckIn || 12)),
      confidence: Math.max(0, Math.min(1, plan.confidence || 0.5)),
    },
    raw: res.content,
    tokens: res.tokens,
  };
}

export async function chatSwarm(
  cfg: LlamaConfig,
  history: ChatMessage[],
  user: string,
  metrics: Metrics,
  config: SwarmConfig,
): Promise<{ ok: true; text: string; tokens: number } | { ok: false; error: string }> {
  const messages: ChatMessage[] = [
    { role: "system", content: SWARM_SYSTEM },
    ...history.slice(-12),
    {
      role: "user",
      content: `[swarm energy ${metrics.avgEnergy.toFixed(0)} · coherence ${(metrics.coherence * 100).toFixed(0)}% · ${config.behavior} · gen ${metrics.generation} · ${metrics.resourcesFound} resources]\n\n${user}`,
    },
  ];
  const res = await llamaChat(cfg, messages, Math.min(cfg.maxTokens, 700));
  if (!res.ok) return { ok: false, error: res.error || "Qwen silent" };
  return { ok: true, text: res.content, tokens: res.tokens };
}

export async function runMissionRound(
  cfg: LlamaConfig,
  input: {
    mission: string;
    round: number;
    hive: string[];
    prior: string;
  },
): Promise<
  | {
      ok: true;
      brief: string;
      notes: string[];
      artifacts: { title: string; body: string; by: string }[];
      tokens: number;
    }
  | { ok: false; error: string }
> {
  const messages: ChatMessage[] = [
    { role: "system", content: SWARM_SYSTEM },
    {
      role: "user",
      content: `Execute swarm mission round ${input.round}/3. The five specialists (Meridian/coordinator, Kepler/explorer, Anvil/worker, Vesper/scout, Helix/carrier) actually do the work.

Mission:
${input.mission}

Hive memory:
${input.hive.slice(0, 12).join("\n") || "(empty)"}

Prior:
${input.prior || "(none)"}

Return JSON only:
{"brief":"what the swarm did this round","notes":["hive note"],"artifacts":[{"title":"...","body":"markdown deliverable","by":"Anvil"}]}

Round 1: plan and assign. Round 2: produce. Round 3: critique and package. Keep each artifact under 400 words.`,
    },
  ];
  const res = await llamaChat(cfg, messages, 900);
  if (!res.ok) return { ok: false, error: res.error || "Qwen silent" };
  const parsed = parseJsonObject<{
    brief: string;
    notes?: string[];
    artifacts?: { title: string; body: string; by: string }[];
  }>(res.content);
  if (!parsed) return { ok: false, error: "Qwen returned an unreadable round" };
  return {
    ok: true,
    brief: parsed.brief || "",
    notes: parsed.notes ?? [],
    artifacts: parsed.artifacts ?? [],
    tokens: res.tokens,
  };
}
