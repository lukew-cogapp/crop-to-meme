import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { detectFaces, type FaceBox } from "../lib/faces";
import { iiifUrlFromBase } from "../lib/iiif";
import { loadImage } from "../lib/image";
import {
	canvasToBlob,
	downloadBlob,
	drawMeme,
	type EyePair,
} from "../lib/meme";
import { memeFilename } from "../lib/slug";
import { SUNGLASSES_STYLES, type SunglassesStyle } from "../lib/sunglasses";
import { Skeleton } from "./Skeleton";

type Props = {
	serviceBase: string;
	region: FaceBox;
	top: string;
	bottom: string;
	onChangeText: (top: string, bottom: string) => void;
	onShuffle?: () => void;
	shareUrl: string;
	filenameHint?: string;
	sunglassesStyle: SunglassesStyle | "off";
	onChangeSunglasses: (s: SunglassesStyle | "off") => void;
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
	filenameHint,
	sunglassesStyle,
	onChangeSunglasses,
}: Props) {
	const { t } = useTranslation();
	const topId = useId();
	const bottomId = useId();
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const imgRef = useRef<HTMLImageElement | null>(null);
	const [ready, setReady] = useState(false);
	const [copied, setCopied] = useState(false);
	const sunglasses = sunglassesStyle !== "off";
	const [eyePairs, setEyePairs] = useState<EyePair[]>([]);

	useEffect(() => {
		let cancelled = false;
		setReady(false);
		setEyePairs([]);
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
		if (!ready || !imgRef.current || eyePairs.length > 0 || !sunglasses) return;
		let cancelled = false;
		(async () => {
			const detections = imgRef.current
				? await detectFaces(imgRef.current)
				: [];
			if (cancelled) return;
			const pairs: EyePair[] = detections
				.map((d) => {
					const a = d.keypoints?.leftEye;
					const b = d.keypoints?.rightEye;
					if (!a || !b) return null;
					const left = a.x <= b.x ? a : b;
					const right = a.x <= b.x ? b : a;
					return { left, right };
				})
				.filter((p): p is EyePair => p !== null);
			setEyePairs(pairs);
		})();
		return () => {
			cancelled = true;
		};
	}, [ready, sunglasses, eyePairs.length]);

	useEffect(() => {
		if (!ready || !canvasRef.current || !imgRef.current) return;
		drawMeme(
			canvasRef.current,
			imgRef.current,
			{ top, bottom },
			{
				sunglasses: sunglasses ? eyePairs : undefined,
				sunglassesStyle: sunglasses ? sunglassesStyle : undefined,
			},
		);
	}, [ready, top, bottom, sunglasses, sunglassesStyle, eyePairs]);

	const onDownload = async () => {
		if (!canvasRef.current) return;
		const blob = await canvasToBlob(canvasRef.current, "image/jpeg", 0.92);
		const filename = memeFilename(
			[filenameHint ?? "", top, bottom].filter(Boolean),
			"jpg",
		);
		downloadBlob(blob, filename);
	};

	const onCopyLink = async () => {
		await navigator.clipboard.writeText(shareUrl);
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	};

	const canvasLabel = t("meme.canvasLabel", {
		top: top || "-",
		bottom: bottom || "-",
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
			<div className="flex flex-wrap gap-2 items-center">
				{onShuffle && (
					<button
						type="button"
						onClick={onShuffle}
						className="rounded-lg border border-neutral-700 px-4 py-2 hover:border-neutral-400 min-h-[44px]"
					>
						{t("meme.shuffle")}
					</button>
				)}
				<label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-700 min-h-[44px] select-none">
					<span className="text-sm">{t("meme.sunglasses")}</span>
					<select
						value={sunglassesStyle}
						onChange={(e) =>
							onChangeSunglasses(e.target.value as SunglassesStyle | "off")
						}
						className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm focus-visible:border-neutral-100"
					>
						<option value="off">{t("meme.sunglassesOff")}</option>
						{SUNGLASSES_STYLES.map((s) => (
							<option key={s} value={s}>
								{t(`meme.sunglassesStyle.${s}`)}
							</option>
						))}
					</select>
				</label>
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
