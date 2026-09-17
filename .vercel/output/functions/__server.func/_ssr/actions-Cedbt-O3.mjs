import { t as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-A6pJPYTF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/actions-Cedbt-O3.js
var MODEL = "unsloth/Qwen3.6-27B-GGUF:Q6_K_XL";
function assertSafeEndpoint(raw) {
	let url;
	try {
		url = new URL(raw);
	} catch {
		throw new Error("Invalid llama.cpp endpoint");
	}
	if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("llama.cpp endpoint must be http or https");
	const host = url.hostname.toLowerCase();
	if (host === "169.254.169.254" || host === "metadata.google.internal" || host.endsWith(".internal")) throw new Error("Blocked endpoint");
	return raw.replace(/\/$/, "");
}
var llamaComplete_createServerFn_handler = createServerRpc({
	id: "138c1921c097836b4417c5961eed61cb78b4257800b96e3ec26c3ef084e3d97f",
	name: "llamaComplete",
	filename: "src/lib/llm/actions.ts"
}, (opts) => llamaComplete.__executeServer(opts));
var llamaComplete = createServerFn({ method: "POST" }).validator((data) => data).handler(llamaComplete_createServerFn_handler, async ({ data }) => {
	const endpoint = assertSafeEndpoint(data.endpoint);
	const res = await fetch(`${endpoint}/v1/chat/completions`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			model: data.model || MODEL,
			messages: data.messages,
			temperature: data.temperature,
			max_tokens: Math.min(1200, Math.max(64, data.maxTokens)),
			stream: false
		}),
		signal: AbortSignal.timeout(9e4)
	});
	if (!res.ok) {
		const text = await res.text().catch(() => "");
		return {
			ok: false,
			content: "",
			tokens: 0,
			error: `llama.cpp ${res.status}${text ? `: ${text.slice(0, 180)}` : ""}`
		};
	}
	const json = await res.json();
	return {
		ok: true,
		content: json.choices?.[0]?.message?.content ?? "",
		tokens: json.usage?.total_tokens ?? 0
	};
});
var llamaProbe_createServerFn_handler = createServerRpc({
	id: "e106a9e4b5be14260882fc86f880c167ae67009868fce831e3dab565363a5486",
	name: "llamaProbe",
	filename: "src/lib/llm/actions.ts"
}, (opts) => llamaProbe.__executeServer(opts));
var llamaProbe = createServerFn({ method: "POST" }).validator((data) => data).handler(llamaProbe_createServerFn_handler, async ({ data }) => {
	const endpoint = assertSafeEndpoint(data.endpoint);
	try {
		return { ok: (await fetch(`${endpoint}/v1/models`, {
			method: "GET",
			signal: AbortSignal.timeout(4e3)
		})).ok };
	} catch {
		return { ok: false };
	}
});
//#endregion
export { llamaComplete_createServerFn_handler, llamaProbe_createServerFn_handler };
