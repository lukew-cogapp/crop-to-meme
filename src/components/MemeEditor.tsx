import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { FaceBox } from "../lib/faces";
import { iiifUrlFromBase } from "../lib/iiif";
import { loadImage } from "../lib/image";
import { canvasToBlob, downloadBlob, drawMeme } from "../lib/meme";
import { Skeleton } from "./Skeleton";

type Props = {
	serviceBase: string;
	region: FaceBox;
	top: string;
	bottom: string;
	onChangeText: (top: string, bottom: string) => void;
	onShuffle?: () => void;
	shareUrl: string;
};

const RENDER_WIDTH = 800;

export function MemeEditor({
	serviceBase,
	region,
	top,
	bottom,
	onChangeText,
	onShuffle,
	shareUrl,
}: Props) {
	const { t } = useTranslation();
	const topId = useId();
	const bottomId = useId();
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const imgRef = useRef<HTMLImageElement | null>(null);
	const [ready, setReady] = useState(false);
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		let cancelled = false;
		setReady(false);
		const url = iiifUrlFromBase(serviceBase, region, { width: RENDER_WIDTH });
		loadImage(url).then((img) => {
			if (cancelled) return;
			imgRef.current = img;
			setReady(true);
		});
		return () => {
			cancelled = true;
		};
	}, [serviceBase, region]);

	useEffect(() => {
		if (!ready || !canvasRef.current || !imgRef.current) return;
		drawMeme(canvasRef.current, imgRef.current, { top, bottom });
	}, [ready, top, bottom]);

	const onDownload = async () => {
		if (!canvasRef.current) return;
		const blob = await canvasToBlob(canvasRef.current, "image/jpeg", 0.92);
		downloadBlob(blob, t("meme.downloadFile"));
	};

	const onCopyLink = async () => {
		await navigator.clipboard.writeText(shareUrl);
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	};

	const canvasLabel = t("meme.canvasLabel", {
		top: top || "—",
		bottom: bottom || "—",
	});

	return (
		<div className="flex flex-col gap-3 flex-1 min-h-0">
			<div className="bg-neutral-900 rounded-lg overflow-hidden border border-neutral-800 relative flex justify-center items-center flex-1 min-h-0">
				<canvas
					ref={canvasRef}
					role="img"
					aria-label={canvasLabel}
					className={`max-h-full max-w-full w-auto h-auto block object-contain ${ready ? "" : "invisible"}`}
				/>
				{!ready && (
					<>
						<Skeleton className="w-full aspect-square rounded-none absolute inset-0" />
						<span className="sr-only" role="status">
							{t("meme.renderingStatus")}
						</span>
					</>
				)}
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
				<div className="flex flex-col gap-1">
					<label htmlFor={topId} className="text-xs text-neutral-300">
						{t("meme.topLabel")}
					</label>
					<input
						id={topId}
						value={top}
						onChange={(e) => onChangeText(e.target.value, bottom)}
						placeholder={t("meme.topPlaceholder")}
						className="rounded-lg bg-neutral-900 border border-neutral-700 px-4 py-2 focus-visible:border-neutral-100"
					/>
				</div>
				<div className="flex flex-col gap-1">
					<label htmlFor={bottomId} className="text-xs text-neutral-300">
						{t("meme.bottomLabel")}
					</label>
					<input
						id={bottomId}
						value={bottom}
						onChange={(e) => onChangeText(top, e.target.value)}
						placeholder={t("meme.bottomPlaceholder")}
						className="rounded-lg bg-neutral-900 border border-neutral-700 px-4 py-2 focus-visible:border-neutral-100"
					/>
				</div>
			</div>
			<div className="flex flex-wrap gap-2">
				{onShuffle && (
					<button
						type="button"
						onClick={onShuffle}
						className="rounded-lg border border-neutral-700 px-4 py-2 hover:border-neutral-400 min-h-[44px]"
					>
						{t("meme.shuffle")}
					</button>
				)}
				<button
					type="button"
					onClick={onCopyLink}
					className="rounded-lg border border-neutral-700 px-4 py-2 hover:border-neutral-400 min-h-[44px]"
				>
					{copied ? t("meme.copied") : t("meme.copyLink")}
				</button>
				<button
					type="button"
					onClick={onDownload}
					disabled={!ready}
					className="rounded-lg bg-white text-black px-5 py-2 font-medium disabled:opacity-50 min-h-[44px]"
				>
					{t("meme.download")}
				</button>
			</div>
		</div>
	);
}
