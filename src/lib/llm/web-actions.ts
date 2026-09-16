import { createServerFn } from "@tanstack/react-start";

export type SearchHit = { title: string; url: string; snippet: string; source: string };
export type BrowsedPage = {
  url: string;
  title: string;
  text: string;
  links: { title: string; url: string }[];
  status: number;
};

const UA =
  "Mozilla/5.0 (compatible; HivefieldScout/1.0; +https://hivefield.local) AppleWebKit/537.36 Chrome/124.0.0.0";

function isPrivateHost(host: string): boolean {
  const h = host.toLowerCase().replace(/^\[|\]$/g, "");
  if (
    h === "localhost" ||
    h === "127.0.0.1" ||
    h === "::1" ||
    h === "0.0.0.0" ||
    h === "169.254.169.254" ||
    h === "metadata.google.internal" ||
    h.endsWith(".internal") ||
    h.endsWith(".local")
  ) {
    return true;
  }
  if (/^10\./.test(h) || /^192\.168\./.test(h) || /^172\.(1[6-9]|2\d|3[0-1])\./.test(h)) return true;
  return false;
}

function assertPublicUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Invalid URL");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("Only http/https");
  if (isPrivateHost(url.hostname)) throw new Error("Blocked host");
  return url;
}

async function fetchText(url: string, timeoutMs = 12000, maxBytes = 900_000): Promise<{ status: number; body: string; finalUrl: string }> {
  const u = assertPublicUrl(url);
  const res = await fetch(u.toString(), {
    method: "GET",
    redirect: "follow",
    headers: {
      "User-Agent": UA,
      Accept: "text/html,application/xhtml+xml,application/json,text/plain;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.8",
    },
    signal: AbortSignal.timeout(timeoutMs),
  });
  const buf = new Uint8Array(await res.arrayBuffer());
  const sliced = buf.byteLength > maxBytes ? buf.slice(0, maxBytes) : buf;
  const body = new TextDecoder("utf-8", { fatal: false }).decode(sliced);
  return { status: res.status, body, finalUrl: res.url || u.toString() };
}

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h1|h2|h3|li|tr|section|article)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function pickMeta(html: string, key: string): string {
  const re = new RegExp(
    `<meta[^>]+(?:name|property)=["']${key}["'][^>]+content=["']([^"']+)["']`,
    "i",
  );
  const alt = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${key}["']`,
    "i",
  );
  return decode(re.exec(html)?.[1] ?? alt.exec(html)?.[1] ?? "");
}

function decode(s: string): string {
  return s
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, '"')
    .replace(/&#39;/g, "'");
}

function extractPage(html: string, url: string): BrowsedPage {
  const title =
    decode(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? "").replace(/\s+/g, " ").trim() ||
    pickMeta(html, "og:title") ||
    url;
  const desc = pickMeta(html, "description") || pickMeta(html, "og:description");
  const headings = [...html.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi)]
    .map((m) => stripTags(m[1]))
    .filter((t) => t.length > 2 && t.length < 180)
    .slice(0, 12);
  const text = stripTags(html).slice(0, 8000);
  const links: { title: string; url: string }[] = [];
  const seen = new Set<string>();
  for (const m of html.matchAll(/<a[^>]+href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    let href = decode(m[1]);
    try {
      href = new URL(href, url).toString();
    } catch {
      continue;
    }
    if (!href.startsWith("http") || seen.has(href)) continue;
    if (isPrivateHost(new URL(href).hostname)) continue;
    const t = stripTags(m[2]).slice(0, 80);
    if (!t) continue;
    seen.add(href);
    links.push({ title: t, url: href });
    if (links.length >= 12) break;
  }
  const body = [desc && `Summary: ${desc}`, headings.length ? `Headings:\n- ${headings.join("\n- ")}` : "", text]
    .filter(Boolean)
    .join("\n\n");
  return { url, title: stripTags(title).slice(0, 180), text: body.slice(0, 6500), links, status: 200 };
}

function parseDdg(html: string): SearchHit[] {
  const hits: SearchHit[] = [];
  const re = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  const snips = [...html.matchAll(/class="result__snippet"[^>]*>([\s\S]*?)<\/(?:a|td|div)>/gi)].map((m) =>
    stripTags(m[1]),
  );
  let i = 0;
  for (const m of html.matchAll(re)) {
    let href = decode(m[1]).replace(/&/g, "&");
    try {
      const u = new URL(href, "https://duckduckgo.com");
      const uddg = u.searchParams.get("uddg");
      if (uddg) href = decodeURIComponent(uddg);
    } catch {
      /* keep */
    }
    if (!href.startsWith("http")) continue;
    try {
      if (isPrivateHost(new URL(href).hostname)) continue;
    } catch {
      continue;
    }
    hits.push({
      title: stripTags(m[2]).slice(0, 140) || href,
      url: href,
      snippet: snips[i] ?? "",
      source: "duckduckgo",
    });
    i++;
    if (hits.length >= 8) break;
  }
  return hits;
}

async function searchDdg(query: string): Promise<SearchHit[]> {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const { body, status } = await fetchText(url, 10000);
  if (status >= 400) return [];
  return parseDdg(body);
}

async function searchWiki(query: string): Promise<SearchHit[]> {
  const api = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=5&namespace=0&format=json`;
  const { body, status } = await fetchText(api, 8000);
  if (status >= 400) return [];
  try {
    const data = JSON.parse(body) as [string, string[], string[], string[]];
    const titles = data[1] ?? [];
    const descs = data[2] ?? [];
    const urls = data[3] ?? [];
    return titles.map((title, i) => ({
      title,
      url: urls[i] ?? "",
      snippet: descs[i] ?? "",
      source: "wikipedia",
    })).filter((h) => h.url.startsWith("http"));
  } catch {
    return [];
  }
}

function mergeHits(groups: SearchHit[][], limit: number): SearchHit[] {
  const seen = new Set<string>();
  const out: SearchHit[] = [];
  for (const group of groups) {
    for (const h of group) {
      const key = h.url.replace(/\/$/, "").toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(h);
      if (out.length >= limit) return out;
    }
  }
  return out;
}

export const webSearch = createServerFn({ method: "POST" })
  .validator((data: { query: string; limit?: number }) => data)
  .handler(async ({ data }) => {
    const query = data.query.trim().slice(0, 200);
    if (!query) return { ok: false as const, hits: [] as SearchHit[], error: "Empty query" };
    const limit = Math.min(8, Math.max(3, data.limit ?? 6));
    try {
      const [ddg, wiki] = await Promise.all([searchDdg(query), searchWiki(query)]);
      const hits = mergeHits([ddg, wiki], limit);
      return { ok: true as const, hits, error: hits.length ? undefined : "No results" };
    } catch (err) {
      return { ok: false as const, hits: [] as SearchHit[], error: err instanceof Error ? err.message : "Search failed" };
    }
  });

export const browsePage = createServerFn({ method: "POST" })
  .validator((data: { url: string }) => data)
  .handler(async ({ data }) => {
    try {
      const { body, status, finalUrl } = await fetchText(data.url, 14000);
      if (status >= 400) {
        return { ok: false as const, error: `HTTP ${status}`, page: null as BrowsedPage | null };
      }
      const page = extractPage(body, finalUrl);
      page.status = status;
      return { ok: true as const, page, error: undefined };
    } catch (err) {
      return {
        ok: false as const,
        page: null as BrowsedPage | null,
        error: err instanceof Error ? err.message : "Browse failed",
      };
    }
  });

export const researchTopic = createServerFn({ method: "POST" })
  .validator((data: { query: string }) => data)
  .handler(async ({ data }) => {
    const query = data.query.trim().slice(0, 200);
    if (!query) return { ok: false as const, brief: "", hits: [] as SearchHit[], pages: [] as BrowsedPage[], error: "Empty query" };
    try {
      const [ddg, wiki] = await Promise.all([searchDdg(query), searchWiki(query)]);
      const hits = mergeHits([ddg, wiki], 5);
      const toRead = hits.slice(0, 3);
      const pages: BrowsedPage[] = [];
      for (const hit of toRead) {
        try {
          const { body, status, finalUrl } = await fetchText(hit.url, 12000);
          if (status < 400) {
            const page = extractPage(body, finalUrl);
            page.status = status;
            pages.push(page);
          }
        } catch {
          /* skip dead link */
        }
      }
      const brief = [
        `Research: ${query}`,
        `Sources: ${hits.length} hits, ${pages.length} pages read.`,
        ...pages.map((p) => `## ${p.title}\n${p.url}\n${p.text.slice(0, 900)}`),
      ].join("\n\n");
      return { ok: true as const, brief: brief.slice(0, 12000), hits, pages, error: undefined };
    } catch (err) {
      return {
        ok: false as const,
        brief: "",
        hits: [] as SearchHit[],
        pages: [] as BrowsedPage[],
        error: err instanceof Error ? err.message : "Research failed",
      };
    }
  });
