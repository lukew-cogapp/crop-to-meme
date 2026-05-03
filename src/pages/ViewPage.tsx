import Image from "@samvera/clover-iiif/image";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import { providerForRef, type ResolvedSource } from "../lib/providers";

export function ViewPage() {
	const { t } = useTranslation();
	const [params] = useSearchParams();
	const src = params.get("src") ?? "";
	const from = params.get("from") ?? "/";
	const [source, setSource] = useState<ResolvedSource | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setSource(null);
		setError(null);
		const provider = providerForRef(src);
		if (!provider) {
			setError(t("errors.unknownSource"));
			return;
		}
		provider
			.resolve(src)
			.then(setSource)
			.catch((e) => setError((e as Error).message));
	}, [src, t]);

	const title = source?.label ?? t("view.title");

	return (
		<div className="flex flex-col gap-4 h-[calc(100vh-8rem)] min-h-0">
			<header className="flex flex-col gap-1 shrink-0">
				<p className="text-sm">
					<Link
						to={from}
						className="text-neutral-300 hover:text-white underline"
					>
						{t("app.back")}
					</Link>
				</p>
				<h1 className="text-lg font-semibold text-neutral-100">{title}</h1>
			</header>

			{error && (
				<p role="alert" className="text-red-300">
					{error}
				</p>
			)}

			{!source && !error && (
				<p role="status" aria-live="polite" className="text-neutral-200">
					{t("app.loadingSource")}
				</p>
			)}

			{source && (
				<section
					aria-label={t("view.viewerLabel", { title: source.label })}
					className="flex-1 min-h-0 bg-neutral-900 rounded-lg overflow-hidden border border-neutral-800"
				>
					<Image
						src={source.serviceBase.replace(/\/+$/, "")}
						isTiledImage={true}
					/>
				</section>
			)}
		</div>
	);
}
