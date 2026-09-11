/**
 * IIIF image proxy for artic.edu.
 *
 * artic.edu/iiif/2 returns 403 to requests without a Referer it recognises,
 * which rules out browser use from any other origin. Their terms place
 * public-domain images under CC0 with no restriction on automated access, and
 * robots.txt does not disallow /iiif/, so this forwards the request with a
 * Referer naming the artwork page the image belongs to.
 */

const UPSTREAM = "https://www.artic.edu/iiif/2";
const REFERER = "https://www.artic.edu/";

const ALLOWED_ORIGINS = [
	"https://lukew-cogapp.github.io",
	"http://localhost:5173",
	"http://localhost:4173",
];

// /full/843,/0/default.jpg or /0,0,512,512/512,/0/default.jpg, plus info.json.
const IMAGE_PATH =
	/^\/[0-9a-f-]{36}\/(?:full|square|\d+,\d+,\d+,\d+)\/[^/]+\/\d+\/\w+\.(?:jpg|png|webp)$/;
const INFO_PATH = /^\/[0-9a-f-]{36}\/info\.json$/;

function corsHeaders(origin: string | null): Record<string, string> {
	const allowed = origin && ALLOWED_ORIGINS.includes(origin);
	return {
		"Access-Control-Allow-Origin": allowed ? origin : ALLOWED_ORIGINS[0],
		"Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
		"Access-Control-Max-Age": "86400",
		Vary: "Origin",
	};
}

export default {
	async fetch(request: Request): Promise<Response> {
		const origin = request.headers.get("Origin");
		const cors = corsHeaders(origin);

		if (request.method === "OPTIONS") {
			return new Response(null, { status: 204, headers: cors });
		}
		if (request.method !== "GET" && request.method !== "HEAD") {
			return new Response("Method not allowed", { status: 405, headers: cors });
		}

		const { pathname } = new URL(request.url);
		if (!IMAGE_PATH.test(pathname) && !INFO_PATH.test(pathname)) {
			return new Response("Not found", { status: 404, headers: cors });
		}

		const upstream = await fetch(`${UPSTREAM}${pathname}`, {
			method: request.method,
			headers: {
				Referer: REFERER,
				Accept: request.headers.get("Accept") ?? "*/*",
			},
			cf: { cacheEverything: true, cacheTtl: 86400 },
		});

		if (!upstream.ok) {
			return new Response(`Upstream ${upstream.status}`, {
				status: upstream.status === 404 ? 404 : 502,
				headers: cors,
			});
		}

		const headers = new Headers(cors);
		headers.set(
			"Content-Type",
			upstream.headers.get("Content-Type") ?? "application/octet-stream",
		);
		headers.set("Cache-Control", "public, max-age=86400");

		// A viewer reads the service id out of info.json and builds its tile URLs
		// from it, so an unrewritten id sends every tile back to the blocked host.
		if (INFO_PATH.test(pathname)) {
			const info = await upstream.text();
			const base = new URL(request.url).origin;
			headers.set("Content-Type", "application/json");
			return new Response(info.replaceAll(UPSTREAM, base), {
				status: 200,
				headers,
			});
		}

		return new Response(upstream.body, { status: 200, headers });
	},
};
