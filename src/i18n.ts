import en from "./locales/en.json";

type Dict = typeof en;

type Leaves<T, P extends string = ""> = {
	[K in keyof T & string]: T[K] extends string
		? `${P}${P extends "" ? "" : "."}${K}`
		: T[K] extends object
			? Leaves<T[K], `${P}${P extends "" ? "" : "."}${K}`>
			: never;
}[keyof T & string];

export type TKey = Leaves<Dict>;

function lookup(key: string): string {
	const parts = key.split(".");
	let cur: unknown = en;
	for (const p of parts) {
		if (cur && typeof cur === "object" && p in cur) {
			cur = (cur as Record<string, unknown>)[p];
		} else {
			return key;
		}
	}
	return typeof cur === "string" ? cur : key;
}

export function t(key: TKey, vars?: Record<string, string | number>): string {
	let s = lookup(key);
	if (vars) {
		for (const [k, v] of Object.entries(vars)) {
			s = s.replaceAll(`{${k}}`, String(v));
		}
	}
	return s;
}
