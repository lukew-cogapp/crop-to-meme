const AIC_API = "https://api.artic.edu/api/v1";
const FIELDS = [
	"id",
	"title",
	"artist_display",
	"image_id",
	"date_display",
].join(",");

export type Artwork = {
	id: number;
	title: string;
	artist_display: string;
	image_id: string | null;
	date_display: string;
};

type SearchResponse = {
	data: Artwork[];
	pagination: { total: number; total_pages: number };
};

export type SearchOpts = {
	page?: number;
	limit?: number;
	portraitsOnly?: boolean;
};

export async function searchArtworks(
	query: string,
	opts: SearchOpts = {},
): Promise<SearchResponse> {
	const { page = 1, limit = 30, portraitsOnly = true } = opts;
	const url = new URL(`${AIC_API}/artworks/search`);
	if (query.trim()) url.searchParams.set("q", query);
	url.searchParams.set("fields", FIELDS);
	url.searchParams.set("page", String(page));
	url.searchParams.set("limit", String(limit));

	const must: string[][] = [
		["query[bool][must][0][term][is_public_domain]", "true"],
		["query[bool][must][1][exists][field]", "image_id"],
	];
	if (portraitsOnly) {
		must.push([
			"query[bool][must][2][term][classification_titles]",
			"portrait",
		]);
	}
	for (const [k, v] of must) url.searchParams.set(k, v);

	const res = await fetch(url);
	if (!res.ok) throw new Error(`AIC search failed: ${res.status}`);
	const json = await res.json();
	return {
		data: (json.data ?? []).filter((a: Artwork) => a.image_id),
		pagination: json.pagination,
	};
}

export async function getArtwork(id: number): Promise<Artwork> {
	const url = new URL(`${AIC_API}/artworks/${id}`);
	url.searchParams.set("fields", FIELDS);
	const res = await fetch(url);
	if (!res.ok) throw new Error(`AIC fetch failed: ${res.status}`);
	const json = await res.json();
	return json.data;
}
