import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FacePicker } from "../components/FacePicker";
import type { FaceBox } from "../lib/faces";
import { providerForRef, type ResolvedSource } from "../lib/providers";

export function FacesPage() {
	const { t } = useTranslation();
	const [params] = useSearchParams();
	const navigate = useNavigate();
	const src = params.get("src") ?? "";
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

	const onPick = (face: FaceBox) => {
		const meta = source?.metadata;
		const next = new URLSearchParams({
			src,
			x: String(Math.round(face.x)),
			y: String(Math.round(face.y)),
			w: String(Math.round(face.w)),
			h: String(Math.round(face.h)),
		});
		if (meta?.title) next.set("title", meta.title);
		if (meta?.artist) next.set("artist", meta.artist);
		if (meta?.date) next.set("date", meta.date);
		navigate(`/meme?${next.toString()}`);
	};

	if (error)
		return (
			<p role="alert" className="text-red-300">
				{error}
			</p>
		);
	if (!source)
		return (
			<p role="status" aria-live="polite" className="text-neutral-200">
				{t("app.loadingSource")}
			</p>
		);

	return (
		<div className="flex flex-col gap-4">
			<h1 className="sr-only">{source.label}</h1>
			<p className="text-neutral-200">
				<Link to="/" className="text-neutral-300 hover:text-white underline">
					{t("app.back")}
				</Link>{" "}
				· <span className="font-semibold">{source.label}</span>
			</p>
			<FacePicker
				serviceBase={source.serviceBase}
				fullSize={{ width: source.width, height: source.height }}
				onPick={onPick}
			/>
		</div>
	);
}
