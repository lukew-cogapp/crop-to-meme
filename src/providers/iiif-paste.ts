import { loadIiifSource } from "../lib/iiif-source";
import { type Provider, registerProvider } from "../lib/providers";

export const iiifPasteProvider: Provider = {
	id: "iiif",
	name: "Paste IIIF URL",
	kind: "paste",
	resolve: async (ref) => {
		const url = ref.startsWith("iiif:")
			? decodeURIComponent(ref.slice(5))
			: ref;
		const images = await loadIiifSource(url);
		if (!images.length) throw new Error("no images in IIIF source");
		const first = images[0];
		return {
			serviceBase: first.serviceBase,
			width: first.width,
			height: first.height,
			label: first.label,
			metadata: { title: first.label },
		};
	},
};

registerProvider(iiifPasteProvider);

export function pasteRef(url: string): string {
	return `iiif:${encodeURIComponent(url)}`;
}
