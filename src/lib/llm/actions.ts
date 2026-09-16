import { createServerFn } from "@tanstack/react-start";

const MODEL = "unsloth/Qwen3.6-27B-GGUF:Q6_K_XL";

type Payload = {
  endpoint: string;
  model: string;
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  temperature: number;
  maxTokens: number;
};

function assertSafeEndpoint(raw: string): string {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Invalid llama.cpp endpoint");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("llama.cpp endpoint must be http or https");
  }
  const host = url.hostname.toLowerCase();
  if (host === "169.254.169.254" || host === "metadata.google.internal" || host.endsWith(".internal")) {
    throw new Error("Blocked endpoint");
  }
  return raw.replace(/\/$/, "");
}

export const llamaComplete = createServerFn({ method: "POST" })
  .validator((data: Payload) => data)
  .handler(async ({ data }) => {
    const endpoint = assertSafeEndpoint(data.endpoint);
    const res = await fetch(`${endpoint}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: data.model || MODEL,
        messages: data.messages,
        temperature: data.temperature,
        max_tokens: Math.min(1200, Math.max(64, data.maxTokens)),
        stream: false,
      }),
      signal: AbortSignal.timeout(90000),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        ok: false as const,
        content: "",
        tokens: 0,
        error: `llama.cpp ${res.status}${text ? `: ${text.slice(0, 180)}` : ""}`,
      };
    }
    const json = (await res.json()) as {
      choices?: { message?: { content?: string | null } }[];
      usage?: { total_tokens?: number };
    };
    return {
      ok: true as const,
      content: json.choices?.[0]?.message?.content ?? "",
      tokens: json.usage?.total_tokens ?? 0,
    };
  });

export const llamaProbe = createServerFn({ method: "POST" })
  .validator((data: { endpoint: string }) => data)
  .handler(async ({ data }) => {
    const endpoint = assertSafeEndpoint(data.endpoint);
    try {
      const res = await fetch(`${endpoint}/v1/models`, {
        method: "GET",
        signal: AbortSignal.timeout(4000),
      });
      return { ok: res.ok };
    } catch {
      return { ok: false };
    }
  });
