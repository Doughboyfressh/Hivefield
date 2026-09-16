import { browsePage, researchTopic, webSearch } from "@/lib/llm/web-actions";
import { deviceBrowse, deviceResearch } from "./device-net";

export interface BrowseTrace {
  agent: "Kepler" | "Vesper";
  tool: string;
  detail: string;
  ok: boolean;
}

export interface Dossier {
  queries: string[];
  urls: string[];
  brief: string;
  traces: BrowseTrace[];
}

export interface ScoutOrders {
  queries: string[];
  urls: string[];
}

export type NetPath = "device" | "relay";

const NET_KEY = "hivefield.netpath.v1";

export function loadNetPath(): NetPath {
  try {
    const v = localStorage.getItem(NET_KEY);
    if (v === "relay" || v === "device") return v;
  } catch {
    /* ssr */
  }
  return "device";
}

export function saveNetPath(path: NetPath) {
  localStorage.setItem(NET_KEY, path);
}

const STOP = new Set(
  "a an the and or but if then than to of for in on at by with from as is are was were be been being this that those these it its you your we they them their what which who whom how why when where not no nor can could should would will just about into over after before also more most other some such only own same so than too very that".split(
    " ",
  ),
);

const NET_HINT =
  /\b(search|research|look up|lookup|latest|news|current|today|cite|source|sources|url|https?:\/\/|wikipedia|github|docs?|according|find out|who is|what is|when did|browse|web)\b/i;

export function extractUrls(text: string): string[] {
  const found = text.match(/https?:\/\/[^\s)\]>'"]+/gi) ?? [];
  return [...new Set(found.map((u) => u.replace(/[.,;]+$/, "")))].slice(0, 4);
}

export function extractQueries(text: string): string[] {
  const queries: string[] = [];
  for (const m of text.matchAll(/"([^"]{4,80})"/g)) queries.push(m[1]);
  const cleaned = text
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length >= 8) queries.push(cleaned.slice(0, 140));
  const terms = cleaned
    .split(" ")
    .filter((w) => w.length >= 4 && !STOP.has(w.toLowerCase()))
    .slice(0, 8);
  if (terms.length >= 2) queries.push(terms.join(" "));
  const uniq: string[] = [];
  for (const q of queries) {
    const k = q.toLowerCase();
    if (!uniq.some((u) => u.toLowerCase() === k)) uniq.push(q);
  }
  return uniq.slice(0, 3);
}

export function needsNet(text: string): boolean {
  if (extractUrls(text).length) return true;
  if (NET_HINT.test(text)) return true;
  if (text.trim().length > 80 && /[?]|brief|mission|plan|spec/i.test(text)) return true;
  return false;
}

export function parseScoutOrders(text: string): ScoutOrders {
  const queries: string[] = [];
  const urls = extractUrls(text);
  const fenced = text.match(/\{[\s\S]*"scout"[\s\S]*\}/);
  const raw = fenced?.[0];
  if (raw) {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (end > start) {
      try {
        const obj = JSON.parse(raw.slice(start, end + 1)) as {
          scout?: { queries?: unknown; urls?: unknown; query?: unknown };
        };
        const s = obj.scout;
        if (s) {
          if (typeof s.query === "string") queries.push(s.query);
          if (Array.isArray(s.queries)) {
            for (const q of s.queries) if (typeof q === "string") queries.push(q);
          }
          if (Array.isArray(s.urls)) {
            for (const u of s.urls) if (typeof u === "string") urls.push(u);
          }
        }
      } catch {
        /* ignore */
      }
    }
  }
  return {
    queries: [...new Set(queries.map((q) => q.trim()).filter((q) => q.length >= 3))].slice(0, 3),
    urls: [...new Set(urls)].slice(0, 4),
  };
}

export function formatSwarmBrief(d: Dossier): string {
  if (!d.brief.trim()) {
    return "Kepler/Vesper: no live sources. Qwen is air-gapped and has nothing to cite.";
  }
  return `Kepler/Vesper dossier (swarm net — Qwen did not fetch):\n\n${d.brief}`;
}

export function mergeDossiers(a: Dossier, b: Dossier): Dossier {
  return {
    queries: [...new Set([...a.queries, ...b.queries])].slice(0, 6),
    urls: [...new Set([...a.urls, ...b.urls])].slice(0, 8),
    brief: [a.brief, b.brief].filter(Boolean).join("\n\n").slice(0, 12000),
    traces: [...a.traces, ...b.traces],
  };
}

function viaDevice(): boolean {
  return typeof window !== "undefined" && loadNetPath() === "device";
}

async function scoutOnDevice(
  queries: string[],
  urls: string[],
  follow: boolean,
): Promise<Dossier> {
  const traces: BrowseTrace[] = [];
  const parts: string[] = [];

  for (const url of urls) {
    try {
      const page = await deviceBrowse(url);
      traces.push({ agent: "Vesper", tool: "browse_page", detail: `${url} · device`, ok: Boolean(page) });
      if (page) parts.push(`## ${page.title}\n${page.url}\n${page.text.slice(0, 1800)}`);
    } catch {
      traces.push({ agent: "Vesper", tool: "browse_page", detail: `${url} · device`, ok: false });
    }
  }

  const q = queries[0];
  if (q) {
    try {
      const deep = await deviceResearch(q);
      traces.push({ agent: "Kepler", tool: "research_topic", detail: `${q} · device`, ok: deep.pages.length > 0 || deep.hits.length > 0 });
      if (deep.brief) parts.push(deep.brief);
      if (follow) {
        for (const hit of deep.hits.slice(0, 2)) {
          if (urls.includes(hit.url)) continue;
          const page = await deviceBrowse(hit.url);
          traces.push({ agent: "Vesper", tool: "follow_link", detail: `${hit.url} · device`, ok: Boolean(page) });
          if (page) parts.push(`## ${page.title}\n${page.url}\n${page.text.slice(0, 900)}`);
        }
      }
    } catch {
      traces.push({ agent: "Kepler", tool: "research_topic", detail: `${q} · device`, ok: false });
    }
  }

  return { queries, urls, brief: parts.join("\n\n").slice(0, 10000), traces };
}

async function scoutOnRelay(
  queries: string[],
  urls: string[],
  follow: boolean,
  fallbackText: string,
): Promise<Dossier> {
  const traces: BrowseTrace[] = [];
  const parts: string[] = [];

  for (const url of urls) {
    const r = await browsePage({ data: { url } });
    const ok = Boolean(r.ok && r.page);
    traces.push({ agent: "Vesper", tool: "browse_page", detail: `${url} · relay`, ok });
    if (ok && r.page) parts.push(`## ${r.page.title}\n${r.page.url}\n${r.page.text.slice(0, 1800)}`);
  }

  const q = queries[0] || (urls.length ? "" : fallbackText.slice(0, 120));
  if (q) {
    traces.push({ agent: "Kepler", tool: "research_topic", detail: `${q} · relay`, ok: false });
    const deep = await researchTopic({ data: { query: q } });
    traces[traces.length - 1].ok = Boolean(deep.ok);
    if (deep.ok) {
      parts.push(deep.brief);
      if (follow) {
        const extra = deep.pages.flatMap((p) => p.links).slice(0, 2);
        for (const link of extra) {
          const r = await browsePage({ data: { url: link.url } });
          const ok = Boolean(r.ok && r.page);
          traces.push({ agent: "Vesper", tool: "follow_link", detail: `${link.url} · relay`, ok });
          if (ok && r.page) parts.push(`## ${r.page.title}\n${r.page.url}\n${r.page.text.slice(0, 900)}`);
        }
      }
    } else if (queries[1]) {
      const alt = await webSearch({ data: { query: queries[1] } });
      traces.push({
        agent: "Kepler",
        tool: "web_search",
        detail: `${queries[1]} · relay`,
        ok: alt.ok && alt.hits.length > 0,
      });
      if (alt.hits.length) {
        parts.push(alt.hits.map((h, i) => `${i + 1}. ${h.title}\n${h.url}\n${h.snippet}`).join("\n\n"));
      }
    }
  }

  return { queries, urls, brief: parts.join("\n\n").slice(0, 10000), traces };
}

export async function swarmScout(
  text: string,
  opts: { force?: boolean; follow?: boolean; queries?: string[]; urls?: string[] } = {},
): Promise<Dossier> {
  const urls = [...new Set([...(opts.urls ?? []), ...extractUrls(text)])].slice(0, 4);
  const queries = [...new Set([...(opts.queries ?? []), ...extractQueries(text)])].slice(0, 3);
  if (!opts.force && !needsNet(text) && !urls.length && !(opts.queries?.length || opts.urls?.length)) {
    return { queries, urls, brief: "", traces: [] };
  }

  if (viaDevice()) {
    const local = await scoutOnDevice(queries, urls, Boolean(opts.follow));
    if (local.brief.trim()) return local;
    const relay = await scoutOnRelay(queries, urls, Boolean(opts.follow), text);
    return mergeDossiers(local, relay);
  }

  return scoutOnRelay(queries, urls, Boolean(opts.follow), text);
}
