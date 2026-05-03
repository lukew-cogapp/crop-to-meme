import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import { MemeEditor } from "../components/MemeEditor";
import { generateCaption } from "../lib/captions";
import type { FaceBox } from "../lib/faces";
import { providerForRef, type ResolvedSource } from "../lib/providers";
import { SUNGLASSES_STYLES, type SunglassesStyle } from "../lib/sunglasses";

const VALID_SG: ReadonlySet<string> = new Set([...SUNGLASSES_STYLES, "off"]);

export function MemePage() {
	const { t } = useTranslation();
	const [params, setParams] = useSearchParams();
	const src = params.get("src") ?? "";
	const region: FaceBox = {
		x: Number(params.get("x") ?? 0),
		y: Number(params.get("y") ?? 0),
		w: Number(params.get("w") ?? 0),
		h: Number(params.get("h") ?? 0),
		score: 1,
	};

	const meta = useMemo(
		() => ({
			title: params.get("title") ?? undefined,
			artist: params.get("artist") ?? undefined,
			date: params.get("date") ?? undefined,
		}),
		[params],
	);

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

	useEffect(() => {
		if (params.get("top") !== null || params.get("bottom") !== null) return;
		const cap = generateCaption(meta);
		const next = new URLSearchParams(params);
		next.set("top", cap.top);
		next.set("bottom", cap.bottom);
		setParams(next, { replace: true });
	}, [meta, params, setParams]);

	const top = params.get("top") ?? "";
	const bottom = params.get("bottom") ?? "";
	const sgRaw = params.get("sg") ?? "off";
	const sunglassesStyle: SunglassesStyle | "off" = VALID_SG.has(sgRaw)
		? (sgRaw as SunglassesStyle | "off")
		: "off";

	const setText = (topText: string, bottomText: string) => {
		const next = new URLSearchParams(params);
		next.set("top", topText);
		next.set("bottom", bottomText);
		setParams(next, { replace: true });
	};

	const shuffle = () => {
		const cap = generateCaption(meta);
		setText(cap.top, cap.bottom);
	};

	const setSunglasses = (s: SunglassesStyle | "off") => {
		const next = new URLSearchParams(params);
		if (s === "off") next.delete("sg");
		else next.set("sg", s);
		setParams(next, { replace: true });
	};

	const shareUrl = window.location.href;

	if (error)
		return (
			<p role="alert" className="text-red-300">
				{error}
			</p>
		);
	if (!source || !region.w)
		return (
			<p role="status" aria-live="polite" className="text-neutral-200">
				{t("app.loading")}
			</p>
		);

	const title = meta.title ?? source.label;
	const subParts = [meta.artist, meta.date].filter(Boolean) as string[];

	return (
		<div className="flex flex-col gap-3 h-[calc(100vh-8rem)] min-h-0">
			<header className="flex flex-col gap-0.5 shrink-0">
				<p className="text-sm flex gap-3">
					<Link to="/" className="text-neutral-300 hover:text-white underline">
						{t("app.backNew")}
					</Link>
					<Link
						to={`/view?src=${encodeURIComponent(src)}&from=${encodeURIComponent(`/meme?${params.toString()}`)}`}
						className="text-neutral-300 hover:text-white underline"
					>
						{t("app.viewOriginal")}
					</Link>
				</p>
				<h1 className="text-lg font-semibold text-neutral-100 leading-tight">
					{title}
				</h1>
				{subParts.length > 0 && (
					<p className="text-xs text-neutral-300">{subParts.join(" · ")}</p>
				)}
			</header>
			<MemeEditor
				serviceBase={source.serviceBase}
				region={region}
				top={top}
				bottom={bottom}
				onChangeText={setText}
				onShuffle={shuffle}
				shareUrl={shareUrl}
				filenameHint={title}
				sunglassesStyle={sunglassesStyle}
				onChangeSunglasses={setSunglasses}
			/>
		</div>
	);
}
