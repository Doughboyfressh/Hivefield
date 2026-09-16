import { browsePage, researchTopic, webSearch } from "@/lib/llm/web-actions";

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

export async function swarmScout(
  text: string,
  opts: { force?: boolean; follow?: boolean } = {},
): Promise<Dossier> {
  const traces: BrowseTrace[] = [];
  const urls = extractUrls(text);
  const queries = extractQueries(text);
  if (!opts.force && !needsNet(text) && !urls.length) {
    return { queries, urls, brief: "", traces };
  }

  const parts: string[] = [];

  for (const url of urls) {
    const r = await browsePage({ data: { url } });
    const ok = Boolean(r.ok && r.page);
    traces.push({ agent: "Vesper", tool: "browse_page", detail: url, ok });
    if (ok && r.page) {
      parts.push(`## ${r.page.title}\n${r.page.url}\n${r.page.text.slice(0, 1800)}`);
    }
  }

  const q = queries[0] || text.slice(0, 120);
  if (q) {
    traces.push({ agent: "Kepler", tool: "research_topic", detail: q, ok: false });
    const deep = await researchTopic({ data: { query: q } });
    traces[traces.length - 1].ok = Boolean(deep.ok);
    if (deep.ok) {
      parts.push(deep.brief);
      if (opts.follow) {
        const extra = deep.pages.flatMap((p) => p.links).slice(0, 2);
        for (const link of extra) {
          const r = await browsePage({ data: { url: link.url } });
          const ok = Boolean(r.ok && r.page);
          traces.push({ agent: "Vesper", tool: "follow_link", detail: link.url, ok });
          if (ok && r.page) parts.push(`## ${r.page.title}\n${r.page.url}\n${r.page.text.slice(0, 900)}`);
        }
      }
    } else if (queries[1]) {
      const alt = await webSearch({ data: { query: queries[1] } });
      traces.push({ agent: "Kepler", tool: "web_search", detail: queries[1], ok: alt.ok && alt.hits.length > 0 });
      if (alt.hits.length) {
        parts.push(alt.hits.map((h, i) => `${i + 1}. ${h.title}\n${h.url}\n${h.snippet}`).join("\n\n"));
      }
    }
  }

  return {
    queries,
    urls,
    brief: parts.join("\n\n").slice(0, 10000),
    traces,
  };
}
