import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MemeEditor } from "../components/MemeEditor";
import { t } from "../i18n";
import { generateCaption } from "../lib/captions";
import type { FaceBox } from "../lib/faces";
import { providerForRef, type ResolvedSource } from "../lib/providers";

export function MemePage() {
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
	}, [src]);

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

	const setText = (t: string, b: string) => {
		const next = new URLSearchParams(params);
		next.set("top", t);
		next.set("bottom", b);
		setParams(next, { replace: true });
	};

	const shuffle = () => {
		const cap = generateCaption(meta);
		setText(cap.top, cap.bottom);
	};

	const shareUrl = window.location.href;

	if (error) return <p className="text-red-400">{error}</p>;
	if (!source || !region.w)
		return <p className="text-neutral-400">{t("app.loading")}</p>;

	return (
		<div className="flex flex-col gap-4">
			<p className="text-neutral-300 text-sm">
				<Link to="/" className="text-neutral-500 hover:underline">
					{t("app.backNew")}
				</Link>{" "}
				· {source.label}
			</p>
			<MemeEditor
				serviceBase={source.serviceBase}
				region={region}
				top={top}
				bottom={bottom}
				onChangeText={setText}
				onShuffle={shuffle}
				shareUrl={shareUrl}
			/>
		</div>
	);
}
