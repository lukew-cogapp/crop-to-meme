export type IiifImage = {
	id: string;
	label: string;
	serviceBase: string;
	width: number;
	height: number;
};

type AnyJson = Record<string, unknown>;

function asArray<T = unknown>(v: unknown): T[] {
	if (Array.isArray(v)) return v as T[];
	if (v == null) return [];
	return [v as T];
}

function getLabel(label: unknown, fallback: string): string {
	if (typeof label === "string") return label;
	if (label && typeof label === "object") {
		const obj = label as Record<string, unknown>;
		const first = Object.values(obj)[0];
		if (Array.isArray(first) && typeof first[0] === "string") return first[0];
		if (typeof first === "string") return first;
	}
	return fallback;
}

function serviceFromImageResource(
	resource: AnyJson,
): { base: string; w: number; h: number } | null {
	const services = asArray<AnyJson>(resource.service);
	const svc = services.find((s) => {
		const ctx = s["@context"] ?? s.context;
		const profile = s.profile;
		if (typeof ctx === "string" && ctx.includes("image")) return true;
		if (typeof profile === "string" && profile.includes("image")) return true;
		return s["@id"] || s.id;
	});
	if (!svc) return null;
	const base = (svc["@id"] ?? svc.id) as string;
	const w = Number(resource.width ?? svc.width ?? 0);
	const h = Number(resource.height ?? svc.height ?? 0);
	if (!base || !w || !h) return null;
	return { base: base.replace(/\/+$/, ""), w, h };
}

function parseInfoJson(json: AnyJson): IiifImage[] {
	const id = (json["@id"] ?? json.id) as string | undefined;
	const w = Number(json.width ?? 0);
	const h = Number(json.height ?? 0);
	if (!id || !w || !h) return [];
	const base = id.replace(/\/+$/, "");
	return [
		{
			id: base,
			label: base.split("/").pop() ?? "image",
			serviceBase: base,
			width: w,
			height: h,
		},
	];
}

function parseManifestV2(json: AnyJson): IiifImage[] {
	const out: IiifImage[] = [];
	const sequences = asArray<AnyJson>(json.sequences);
	for (const seq of sequences) {
		const canvases = asArray<AnyJson>(seq.canvases);
		for (const canvas of canvases) {
			const images = asArray<AnyJson>(canvas.images);
			for (const ann of images) {
				const resource = ann.resource as AnyJson | undefined;
				if (!resource) continue;
				const svc = serviceFromImageResource(resource);
				if (!svc) continue;
				out.push({
					id: svc.base,
					label: getLabel(canvas.label, svc.base),
					serviceBase: svc.base,
					width: svc.w,
					height: svc.h,
				});
			}
		}
	}
	return out;
}

function parseManifestV3(json: AnyJson): IiifImage[] {
	const out: IiifImage[] = [];
	const items = asArray<AnyJson>(json.items);
	for (const canvas of items) {
		const annPages = asArray<AnyJson>(canvas.items);
		for (const page of annPages) {
			const annotations = asArray<AnyJson>(page.items);
			for (const ann of annotations) {
				const body = ann.body as AnyJson | undefined;
				if (!body) continue;
				const svc = serviceFromImageResource(body);
				if (!svc) continue;
				out.push({
					id: svc.base,
					label: getLabel(canvas.label, svc.base),
					serviceBase: svc.base,
					width: svc.w,
					height: svc.h,
				});
			}
		}
	}
	return out;
}

export async function loadIiifSource(input: string): Promise<IiifImage[]> {
	const trimmed = input.trim();
	if (!trimmed) throw new Error("empty input");

	let json: AnyJson;
	if (trimmed.startsWith("{")) {
		json = JSON.parse(trimmed) as AnyJson;
	} else {
		const url =
			trimmed.endsWith("/info.json") || trimmed.includes("manifest")
				? trimmed
				: `${trimmed.replace(/\/$/, "")}/info.json`;
		const res = await fetch(url);
		if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
		json = (await res.json()) as AnyJson;
	}

	const ctx = json["@context"];
	const ctxStr = Array.isArray(ctx) ? ctx.join(" ") : String(ctx ?? "");
	const type = (json["@type"] ?? json.type) as string | undefined;

	if (ctxStr.includes("image") || type === "iiif:Image")
		return parseInfoJson(json);
	if (json.sequences || type === "sc:Manifest") return parseManifestV2(json);
	if (json.items || type === "Manifest") return parseManifestV3(json);

	const v2 = parseManifestV2(json);
	if (v2.length) return v2;
	const v3 = parseManifestV3(json);
	if (v3.length) return v3;
	const info = parseInfoJson(json);
	if (info.length) return info;
	throw new Error("could not parse as IIIF info.json or manifest");
}

export function customIiifUrl(
	serviceBase: string,
	region: { x: number; y: number; w: number; h: number } | "full",
	size: { width?: number } | "max" = "max",
): string {
	const r =
		region === "full"
			? "full"
			: `${Math.round(region.x)},${Math.round(region.y)},${Math.round(region.w)},${Math.round(region.h)}`;
	const s = size === "max" ? "max" : size.width ? `${size.width},` : "max";
	return `${serviceBase}/${r}/${s}/0/default.jpg`;
}
