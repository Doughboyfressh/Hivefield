export const QWEN_MODEL = "unsloth/Qwen3.6-27B-GGUF:Q6_K_XL";
export const QWEN_LABEL = "Qwen 3.6 27B";
export const DEFAULT_LLAMA_ENDPOINT = "http://127.0.0.1:8088";

export type ChatRole = "system" | "user" | "assistant";
export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface LlamaConfig {
  endpoint: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface LlamaResult {
  ok: boolean;
  content: string;
  tokens: number;
  latency: number;
  error?: string;
}

const LS_KEY = "hivefield.llama.v1";

export function loadLlamaConfig(): LlamaConfig {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<LlamaConfig>;
      return {
        endpoint: p.endpoint || DEFAULT_LLAMA_ENDPOINT,
        model: p.model || QWEN_MODEL,
        temperature: p.temperature ?? 0.7,
        maxTokens: p.maxTokens ?? 512,
      };
    }
  } catch {
    /* ignore */
  }
  return {
    endpoint: DEFAULT_LLAMA_ENDPOINT,
    model: QWEN_MODEL,
    temperature: 0.7,
    maxTokens: 512,
  };
}

export function saveLlamaConfig(cfg: LlamaConfig) {
  localStorage.setItem(LS_KEY, JSON.stringify(cfg));
}

function base(endpoint: string) {
  return endpoint.replace(/\/$/, "");
}

export async function probeLlama(endpoint: string): Promise<boolean> {
  try {
    const res = await fetch(`${base(endpoint)}/v1/models`, {
      method: "GET",
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) return true;
  } catch {
    /* mixed content / CORS — try the server hop */
  }
  try {
    const { llamaProbe } = await import("./actions");
    const r = await llamaProbe({ data: { endpoint } });
    return r.ok;
  } catch {
    return false;
  }
}

export async function llamaChat(
  cfg: LlamaConfig,
  messages: ChatMessage[],
  maxTokens = cfg.maxTokens,
): Promise<LlamaResult> {
  const started = Date.now();
  const direct = await llamaDirect(cfg, messages, maxTokens, started);
  if (direct.ok) return direct;
  try {
    const { llamaComplete } = await import("./actions");
    const r = await llamaComplete({
      data: {
        endpoint: cfg.endpoint,
        model: cfg.model || QWEN_MODEL,
        messages,
        temperature: cfg.temperature,
        maxTokens,
      },
    });
    return {
      ok: r.ok,
      content: r.content,
      tokens: r.tokens,
      latency: Date.now() - started,
      error: r.ok ? undefined : r.error,
    };
  } catch (err) {
    return {
      ok: false,
      content: "",
      tokens: 0,
      latency: Date.now() - started,
      error: direct.error || (err instanceof Error ? err.message : "llama.cpp unreachable"),
    };
  }
}

async function llamaDirect(
  cfg: LlamaConfig,
  messages: ChatMessage[],
  maxTokens: number,
  started: number,
): Promise<LlamaResult> {
  try {
    const res = await fetch(`${base(cfg.endpoint)}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: cfg.model || QWEN_MODEL,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        temperature: cfg.temperature,
        max_tokens: maxTokens,
        stream: false,
      }),
      signal: AbortSignal.timeout(90000),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        ok: false,
        content: "",
        tokens: 0,
        latency: Date.now() - started,
        error: `llama.cpp ${res.status}${text ? `: ${text.slice(0, 180)}` : ""}`,
      };
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string | null } }[];
      usage?: { total_tokens?: number };
    };
    return {
      ok: true,
      content: data.choices?.[0]?.message?.content ?? "",
      tokens: data.usage?.total_tokens ?? 0,
      latency: Date.now() - started,
    };
  } catch (err) {
    return {
      ok: false,
      content: "",
      tokens: 0,
      latency: Date.now() - started,
      error: err instanceof Error ? err.message : "llama.cpp unreachable",
    };
  }
}

export function parseJsonObject<T>(text: string): T | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced?.[1] ?? text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

export const SWARM_SYSTEM = `You are Qwen 3.6 27B running on llama.cpp — the air-gapped brain of Hivefield. You have no internet. You cannot search, fetch URLs, or call network tools. Kepler (explorer) and Vesper (scout) are the swarm's net operators; they fetch first and drop evidence into hive memory. Reason only from that evidence plus the field state you are given.

This is not a toy or a game. The canvas is only the bodies. You are the mind.

Specialists:
- coordinator / Meridian — decompose work, assign, hold the thread
- explorer / Kepler — live internet research (already done before you speak)
- worker / Anvil — produce the deliverable
- scout / Vesper — live page reads and critique (already done before you speak)
- carrier / Helix — package and hand off

If evidence is missing, say so. Cite URLs that appear in the swarm dossier. Never invent sources. Never claim you browsed the web.

The field also runs real swarm algorithms you can retune: boids, 6→8→4 neural nets, evolution, pheromone stigmergy, Q-learning, hive memory, construction, threats, world clock.

Be concise, technical, operational. Prefer concrete actions and artifacts over theory.`;
