export function slugify(input: string, max = 60): string {
	const cleaned = input
		.normalize("NFKD")
		.replace(/[̀-ͯ]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
	return cleaned.slice(0, max).replace(/-+$/g, "");
}

export function memeFilename(parts: string[], ext = "jpg"): string {
	const joined = parts
		.map((p) => slugify(p))
		.filter(Boolean)
		.join("--");
	const base = joined || "meme";
	return `${base}.${ext}`;
}
