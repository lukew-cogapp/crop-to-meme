import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ManifestPaste } from "../components/ManifestPaste";
import { ProviderSearch } from "../components/ProviderSearch";
import { listProviders } from "../lib/providers";
import { pasteRef } from "../providers/iiif-paste";

export function HomePage() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const providers = listProviders();
	const [activeId, setActiveId] = useState(providers[0]?.id ?? "");
	const active = providers.find((p) => p.id === activeId);
	const tabsId = useId();

	const goToFaces = (sourceRef: string) => {
		navigate(`/faces?src=${encodeURIComponent(sourceRef)}`);
	};

	const providerName = (id: string, fallback: string) =>
		(t as (k: string, opts?: object) => string)(id, { defaultValue: fallback });

	return (
		<div className="flex flex-col gap-6">
			<h1 className="sr-only">{t("app.title")}</h1>
			<section
				aria-labelledby="howto-heading"
				className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-200"
			>
				<h2
					id="howto-heading"
					className="text-base font-semibold mb-2 text-neutral-100"
				>
					{t("home.howToTitle")}
				</h2>
				<ol className="space-y-1 list-none">
					<li>{t("home.step1")}</li>
					<li>{t("home.step2")}</li>
					<li>{t("home.step3")}</li>
				</ol>
			</section>
			<div
				role="tablist"
				aria-label={t("home.sourceTabsLabel")}
				className="flex flex-wrap gap-2"
			>
				{providers.map((p) => {
					const selected = activeId === p.id;
					const name = p.nameKey ? providerName(p.nameKey, p.name) : p.name;
					return (
						<button
							key={p.id}
							role="tab"
							type="button"
							aria-selected={selected}
							aria-controls={`${tabsId}-${p.id}`}
							id={`${tabsId}-tab-${p.id}`}
							onClick={() => setActiveId(p.id)}
							className={`rounded-md border px-3 py-1.5 text-sm min-h-[36px] ${
								selected
									? "bg-white text-black border-white"
									: "border-neutral-700 text-neutral-200 hover:border-neutral-400"
							}`}
						>
							{name}
						</button>
					);
				})}
			</div>

			{active && (
				<div
					id={`${tabsId}-${active.id}`}
					role="tabpanel"
					aria-labelledby={`${tabsId}-tab-${active.id}`}
				>
					{active.kind === "search" && (
						<ProviderSearch
							provider={{
								...active,
								name: active.nameKey
									? providerName(active.nameKey, active.name)
									: active.name,
							}}
							onPick={(hit) => goToFaces(hit.sourceRef)}
						/>
					)}
					{active.kind === "paste" && (
						<ManifestPaste onSubmit={(url) => goToFaces(pasteRef(url))} />
					)}
				</div>
			)}
		</div>
	);
}
