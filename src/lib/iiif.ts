const AIC_IIIF = "https://www.artic.edu/iiif/2";

export type Region = { x: number; y: number; w: number; h: number } | "full";
export type Size = { width?: number; height?: number } | "full" | "max";

function regionParam(r: Region): string {
	if (r === "full") return "full";
	return `${Math.round(r.x)},${Math.round(r.y)},${Math.round(r.w)},${Math.round(r.h)}`;
}

function sizeParam(s: Size): string {
	if (s === "full" || s === "max") return s;
	if (s.width && s.height) return `!${s.width},${s.height}`;
	if (s.width) return `${s.width},`;
	if (s.height) return `,${s.height}`;
	return "max";
}

export function iiifUrlFromBase(
	serviceBase: string,
	region: Region = "full",
	size: Size = { width: 843 },
	rotation = 0,
	quality = "default",
	format = "jpg",
): string {
	const base = serviceBase.replace(/\/+$/, "");
	return `${base}/${regionParam(region)}/${sizeParam(size)}/${rotation}/${quality}.${format}`;
}

export function iiifUrl(
	imageId: string,
	region: Region = "full",
	size: Size = { width: 843 },
	rotation = 0,
	quality = "default",
	format = "jpg",
): string {
	return iiifUrlFromBase(
		`${AIC_IIIF}/${imageId}`,
		region,
		size,
		rotation,
		quality,
		format,
	);
}

export function infoUrl(imageId: string): string {
	return `${AIC_IIIF}/${imageId}/info.json`;
}

export type ImageInfo = { width: number; height: number };

export async function fetchImageInfo(imageId: string): Promise<ImageInfo> {
	const res = await fetch(infoUrl(imageId));
	if (!res.ok) throw new Error(`IIIF info failed: ${res.status}`);
	const json = await res.json();
	return { width: json.width, height: json.height };
}
