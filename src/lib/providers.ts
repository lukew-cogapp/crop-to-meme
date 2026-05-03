import type { ReactNode } from "react";

export type SearchHit = {
	id: string;
	title: string;
	subtitle?: string;
	thumbnailUrl: string;
	sourceRef: string;
};

export type ResolvedSource = {
	serviceBase: string;
	width: number;
	height: number;
	label: string;
	metadata?: { title: string; artist?: string; date?: string };
};

export type Provider = {
	id: string;
	name: string;
	kind: "search" | "paste";
	search?: (query: string) => Promise<SearchHit[]>;
	resolve: (sourceRef: string) => Promise<ResolvedSource>;
	renderInput?: () => ReactNode;
};

const registry = new Map<string, Provider>();

export function registerProvider(p: Provider): void {
	registry.set(p.id, p);
}

export function getProvider(id: string): Provider | undefined {
	return registry.get(id);
}

export function listProviders(): Provider[] {
	return [...registry.values()];
}

export function providerForRef(sourceRef: string): Provider | undefined {
	for (const p of registry.values()) {
		if (sourceRef.startsWith(`${p.id}:`)) return p;
	}
	return registry.get("iiif");
}
