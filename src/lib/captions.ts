import type { MemeText } from "./meme";

export type CaptionMeta = {
	title?: string;
	artist?: string;
	date?: string;
};

type Slot = "title" | "artist" | "date";

type Template = {
	top: string;
	bottom: string;
	needs?: Slot[];
};

const ARTIST_RE = /^([^,(]+)/;

function shortArtist(display: string): string {
	const m = display.match(ARTIST_RE);
	return (m ? m[1] : display).trim();
}

function shortYear(date: string): string {
	const m = date.match(/\d{3,4}/);
	return m ? m[0] : date;
}

const TEMPLATES: Template[] = [
	// title
	{ top: "me explaining", bottom: "{title}", needs: ["title"] },
	{ top: "nobody:", bottom: "{title}", needs: ["title"] },
	{ top: "{title}", bottom: "fr fr", needs: ["title"] },
	{ top: "every morning", bottom: "looking like {titleLower}", needs: ["title"] },
	{ top: "they call me", bottom: "{title}", needs: ["title"] },
	{ top: "i am once again", bottom: "{title}", needs: ["title"] },
	{ top: "tag yourself", bottom: "i'm {title}", needs: ["title"] },

	// artist
	{ top: "{artistShort} be like", bottom: "trust me bro", needs: ["artist"] },
	{ top: "{artistShort}", bottom: "after one ale", needs: ["artist"] },
	{ top: "what {artistShort} sees", bottom: "what i see", needs: ["artist"] },
	{ top: "{artistShort} explaining", bottom: "the rent is due", needs: ["artist"] },

	// date
	{ top: "pov: it's {year}", bottom: "and you forgot the bread", needs: ["date"] },
	{ top: "tell me you're from", bottom: "{year}", needs: ["date"] },
	{ top: "{year} called", bottom: "wants its drip back", needs: ["date"] },
	{ top: "guess who just discovered", bottom: "{year}", needs: ["date"] },
	{ top: "meanwhile in", bottom: "{year}", needs: ["date"] },

	// generic
	{ top: "this is fine", bottom: "" },
	{ top: "", bottom: "this is fine" },
	{ top: "this you?", bottom: "yeah this me" },
	{ top: "wait til they see", bottom: "the bill" },
	{ top: "mom said", bottom: "smile for the painter" },
	{ top: "when bro says", bottom: '"one more tavern"' },
	{ top: "me at 3am", bottom: "thinking about regrets" },
	{ top: "when the wifi", bottom: "stops working" },
	{ top: "average commute", bottom: "experience" },
	{ top: "monday morning", bottom: "energy" },
	{ top: "my face when", bottom: "they say it's free" },
	{ top: "nobody:", bottom: "absolutely nobody:" },
	{ top: "the way she looks at me", bottom: "vs the way i look at her" },
	{ top: "i don't always pose", bottom: "but when i do…" },
	{ top: "one does not simply", bottom: "leave the studio" },
	{ top: "y'all ever just", bottom: "exist" },
	{ top: "POV", bottom: "you owe me money" },
	{ top: "instant regret", bottom: "" },
	{ top: "", bottom: "and i took that personally" },
	{ top: "they said", bottom: "to act natural" },
	{ top: "main character energy", bottom: "" },
	{ top: "side eye", bottom: "of the century" },
];

function fillSlots(s: string, vars: Record<string, string>): string {
	return s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
}

function metaHas(meta: CaptionMeta, slot: Slot): boolean {
	const v = meta[slot];
	return typeof v === "string" && v.trim().length > 0;
}

function eligible(t: Template, meta: CaptionMeta): boolean {
	return (t.needs ?? []).every((s) => metaHas(meta, s));
}

export function generateCaption(
	meta: CaptionMeta,
	seed = Math.random(),
): MemeText {
	const pool = TEMPLATES.filter((t) => eligible(t, meta));
	const choice = pool[Math.floor(seed * pool.length) % pool.length];
	const vars: Record<string, string> = {};
	if (meta.title) {
		vars.title = meta.title;
		vars.titleLower = meta.title.toLowerCase();
	}
	if (meta.artist) vars.artistShort = shortArtist(meta.artist);
	if (meta.date) vars.year = shortYear(meta.date);
	return {
		top: fillSlots(choice.top, vars),
		bottom: fillSlots(choice.bottom, vars),
	};
}
