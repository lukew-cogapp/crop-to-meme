import { searchArtworks } from "../lib/aic";
import { fetchImageInfo, iiifUrl } from "../lib/iiif";
import { type Provider, registerProvider } from "../lib/providers";

const BASE = "https://www.artic.edu/iiif/2";

export const aicProvider: Provider = {
	id: "aic",
	name: "Art Institute of Chicago",
	nameKey: "providers.aic",
	kind: "search",
	defaultQuery: "",
	search: async (query) => {
		const r = await searchArtworks(query, { portraitsOnly: true });
		return r.data
			.filter((a) => a.image_id)
			.map((a) => ({
				id: String(a.id),
				title: a.title,
				subtitle: a.artist_display,
				thumbnailUrl: iiifUrl(a.image_id ?? "", "full", { width: 300 }),
				sourceRef: `aic:${a.image_id}|${encodeURIComponent(a.title)}|${encodeURIComponent(a.artist_display)}|${encodeURIComponent(a.date_display)}`,
			}));
	},
	resolve: async (ref) => {
		const body = ref.startsWith("aic:") ? ref.slice(4) : ref;
		const [imageId, title, artist, date] = body.split("|");
		const info = await fetchImageInfo(imageId);
		return {
			serviceBase: `${BASE}/${imageId}`,
			width: info.width,
			height: info.height,
			label: title ? decodeURIComponent(title) : imageId,
			metadata: {
				title: decodeURIComponent(title ?? ""),
				artist: artist ? decodeURIComponent(artist) : undefined,
				date: date ? decodeURIComponent(date) : undefined,
			},
		};
	},
};

registerProvider(aicProvider);
