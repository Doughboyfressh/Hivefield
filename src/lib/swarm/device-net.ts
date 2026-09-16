import type { BrowsedPage, SearchHit } from "@/lib/llm/web-actions";

/** Fetch from this computer's network. No llama.cpp. No Qwen. */

export async function deviceSearch(query: string): Promise<SearchHit[]> {
  const q = query.trim().slice(0, 200);
  if (!q) return [];
  const api = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(q)}&limit=6&namespace=0&format=json&origin=*`;
  const res = await fetch(api, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return [];
  const data = (await res.json()) as [string, string[], string[], string[]];
  const titles = data[1] ?? [];
  const descs = data[2] ?? [];
  const urls = data[3] ?? [];
  return titles
    .map((title, i) => ({
      title,
      url: urls[i] ?? "",
      snippet: descs[i] ?? "",
      source: "wikipedia",
    }))
    .filter((h) => h.url.startsWith("http"));
}

export async function deviceSummary(title: string): Promise<BrowsedPage | null> {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, "_"))}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return null;
  const j = (await res.json()) as {
    title?: string;
    extract?: string;
    content_urls?: { desktop?: { page?: string } };
    description?: string;
  };
  const pageUrl = j.content_urls?.desktop?.page || url;
  const text = [j.description && `Summary: ${j.description}`, j.extract].filter(Boolean).join("\n\n");
  if (!text) return null;
  return {
    url: pageUrl,
    title: j.title || title,
    text: text.slice(0, 4000),
    links: [],
    status: 200,
  };
}

export async function deviceBrowse(url: string): Promise<BrowsedPage | null> {
  const wiki = url.match(/wikipedia\.org\/wiki\/([^?#]+)/i);
  if (wiki) return deviceSummary(decodeURIComponent(wiki[1].replace(/_/g, " ")));
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    const html = await res.text();
    const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1]?.replace(/<[^>]+>/g, "").trim() || url;
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 4000);
    if (text.length < 40) return null;
    return { url, title: title.slice(0, 180), text, links: [], status: res.status };
  } catch {
    return null;
  }
}

export async function deviceResearch(query: string): Promise<{ brief: string; hits: SearchHit[]; pages: BrowsedPage[] }> {
  const hits = await deviceSearch(query);
  const pages: BrowsedPage[] = [];
  for (const hit of hits.slice(0, 3)) {
    const page = await deviceBrowse(hit.url);
    if (page) pages.push(page);
  }
  const brief = [
    `Research (this device): ${query}`,
    `Sources: ${hits.length} hits, ${pages.length} pages.`,
    ...pages.map((p) => `## ${p.title}\n${p.url}\n${p.text.slice(0, 900)}`),
  ].join("\n\n");
  return { brief: brief.slice(0, 10000), hits, pages };
}
