import type { Metrics, SwarmConfig } from "@/lib/swarm/types";
import { llamaChat, parseJsonObject, SWARM_SYSTEM, type ChatMessage, type LlamaConfig } from "./llama";
import {
  formatSwarmBrief,
  mergeDossiers,
  needsNet,
  parseScoutOrders,
  swarmScout,
  type BrowseTrace,
  type Dossier,
} from "@/lib/swarm/net";

export type { BrowseTrace };

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

function dossierBlock(brief: string): string {
  if (!brief.trim()) {
    return "\n\n[swarm net: Kepler/Vesper did not fetch. You have no live sources. Do not invent URLs.]";
  }
  return `\n\n[swarm net dossier — fetched by Kepler (explorer) and Vesper (scout). You have no internet. Reason only from this evidence.]\n${brief}`;
}

async function reasonLocally(
  cfg: LlamaConfig,
  messages: ChatMessage[],
  dossier: Dossier,
  maxTokens: number,
): Promise<{ ok: true; content: string; tokens: number; dossier: Dossier } | { ok: false; error: string; dossier: Dossier }> {
  const res = await llamaChat(cfg, messages, maxTokens);
  if (!res.ok) return { ok: false, error: res.error || "Qwen silent", dossier };

  const orders = parseScoutOrders(res.content);
  if (!orders.queries.length && !orders.urls.length) {
    return { ok: true, content: res.content, tokens: res.tokens, dossier };
  }

  const extra = await swarmScout(orders.queries.join("\n"), {
    force: true,
    follow: true,
    queries: orders.queries,
    urls: orders.urls,
  });
  const merged = mergeDossiers(dossier, extra);
  const follow: ChatMessage[] = [
    ...messages,
    { role: "assistant", content: res.content },
    {
      role: "user",
      content: `The swarm executed your scout assignment. You still have no internet and no tools. Reason only from this new dossier.${dossierBlock(extra.brief)}`,
    },
  ];
  const res2 = await llamaChat(cfg, follow, maxTokens);
  if (!res2.ok) return { ok: true, content: res.content, tokens: res.tokens, dossier: merged };
  return { ok: true, content: res2.content, tokens: res.tokens + res2.tokens, dossier: merged };
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
      content: `You are the autonomous director of a live agent swarm. Optimize operations. You have no internet — do not request fetches.

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
): Promise<{ ok: true; text: string; tokens: number; traces: BrowseTrace[] } | { ok: false; error: string; traces: BrowseTrace[] }> {
  const wantNet = needsNet(user);
  let dossier = await swarmScout(user, { follow: wantNet, force: wantNet });
  const messages: ChatMessage[] = [
    { role: "system", content: SWARM_SYSTEM },
    ...history.slice(-12),
    {
      role: "user",
      content: `[swarm energy ${metrics.avgEnergy.toFixed(0)} · coherence ${(metrics.coherence * 100).toFixed(0)}% · ${config.behavior} · gen ${metrics.generation} · ${metrics.resourcesFound} resources]\n\n${user}${dossierBlock(dossier.brief)}`,
    },
  ];
  const res = await reasonLocally(cfg, messages, dossier, Math.min(cfg.maxTokens, 800));
  dossier = res.dossier;
  if (!res.ok) {
    if (dossier.brief) {
      return { ok: true, text: formatSwarmBrief(dossier), tokens: 0, traces: dossier.traces };
    }
    return { ok: false, error: res.error, traces: dossier.traces };
  }
  return { ok: true, text: res.content, tokens: res.tokens, traces: dossier.traces };
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
      traces: BrowseTrace[];
    }
  | { ok: false; error: string; traces: BrowseTrace[] }
> {
  const seed = [input.mission, input.prior, ...input.hive.slice(0, 8)].join("\n");
  let dossier = await swarmScout(seed, {
    force: true,
    follow: input.round !== 2,
  });

  const messages: ChatMessage[] = [
    { role: "system", content: SWARM_SYSTEM },
    {
      role: "user",
      content: `Execute swarm mission round ${input.round}/3. Kepler and Vesper already fetched. You (Qwen) have no internet — write from the dossier only.

Mission:
${input.mission}

Hive memory:
${input.hive.slice(0, 12).join("\n") || "(empty)"}

Prior:
${input.prior || "(none)"}
${dossierBlock(dossier.brief)}

Round 1: plan and assign using live sources. Round 2: produce. Round 3: critique claims against the dossier and package.
Cite URLs that appear in the dossier. Never invent sources.
If you need another fetch, include {"scout":{"queries":["..."],"urls":[]}} — the swarm will fetch; you will not.

Return JSON only:
{"brief":"what the swarm did this round","notes":["hive note"],"artifacts":[{"title":"...","body":"markdown deliverable with citations","by":"Anvil"}]}

Keep each artifact under 400 words.`,
    },
  ];
  const res = await reasonLocally(cfg, messages, dossier, 900);
  dossier = res.dossier;
  if (!res.ok) {
    if (dossier.brief) {
      return {
        ok: true,
        brief: "Kepler and Vesper fetched. Qwen is offline — delivering the swarm dossier.",
        notes: dossier.traces.map((t) => `${t.agent} ${t.tool}: ${t.detail}`),
        artifacts: [{ title: `Round ${input.round} swarm dossier`, body: dossier.brief, by: "Kepler" }],
        tokens: 0,
        traces: dossier.traces,
      };
    }
    return { ok: false, error: res.error, traces: dossier.traces };
  }
  const parsed = parseJsonObject<{
    brief: string;
    notes?: string[];
    artifacts?: { title: string; body: string; by: string }[];
  }>(res.content);
  if (!parsed) {
    return {
      ok: true,
      brief: res.content.slice(0, 400),
      notes: dossier.traces.map((t) => `${t.agent} ${t.tool}: ${t.detail}`),
      artifacts: [{ title: `Round ${input.round} briefing`, body: res.content, by: "Kepler" }],
      tokens: res.tokens,
      traces: dossier.traces,
    };
  }
  return {
    ok: true,
    brief: parsed.brief || "",
    notes: parsed.notes ?? [],
    artifacts: parsed.artifacts ?? [],
    tokens: res.tokens,
    traces: dossier.traces,
  };
}
