import { useEffect, useState } from "react";
import { t } from "../i18n";
import type { Provider, SearchHit } from "../lib/providers";
import { SkeletonGrid } from "./Skeleton";

type Props = {
	provider: Provider;
	onPick: (hit: SearchHit) => void;
};

export function ProviderSearch({ provider, onPick }: Props) {
	const [query, setQuery] = useState("");
	const [hits, setHits] = useState<SearchHit[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!provider.search) return;
		let cancelled = false;
		setLoading(true);
		setError(null);
		const t = setTimeout(() => {
			provider
				.search?.(query)
				.then((r) => !cancelled && setHits(r))
				.catch((e) => !cancelled && setError(e.message))
				.finally(() => !cancelled && setLoading(false));
		}, 300);
		return () => {
			cancelled = true;
			clearTimeout(t);
		};
	}, [provider, query]);

	return (
		<div className="flex flex-col gap-4">
			<input
				type="search"
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				placeholder={t("search.placeholder", { provider: provider.name })}
				className="w-full rounded-lg bg-neutral-900 border border-neutral-700 px-4 py-3 text-lg outline-none focus:border-neutral-400"
			/>
			{error && <p className="text-red-400">{error}</p>}
			{loading && hits.length === 0 && <SkeletonGrid count={8} />}
			{!loading && !error && hits.length === 0 && (
				<p className="text-neutral-500 text-sm">{t("search.noResults")}</p>
			)}
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
				{hits.map((h) => (
					<button
						key={h.id}
						type="button"
						onClick={() => onPick(h)}
						className="rounded-lg overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-neutral-400 transition"
					>
						<img
							src={h.thumbnailUrl}
							alt={h.title}
							className="w-full aspect-square object-cover"
							loading="lazy"
						/>
						<div className="p-2 text-left">
							<p className="text-sm font-medium truncate">{h.title}</p>
							{h.subtitle && (
								<p className="text-xs text-neutral-400 truncate">
									{h.subtitle}
								</p>
							)}
						</div>
					</button>
				))}
			</div>
		</div>
	);
}
