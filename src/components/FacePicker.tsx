import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { detectFaces, expandBox, type FaceBox, scaleBox } from "../lib/faces";
import { iiifUrlFromBase } from "../lib/iiif";
import { loadImage } from "../lib/image";
import { SkeletonGrid } from "./Skeleton";

type Props = {
	serviceBase: string;
	fullSize: { width: number; height: number };
	onPick: (box: FaceBox) => void;
};

const DETECT_WIDTH = 843;

export function FacePicker({ serviceBase, fullSize, onPick }: Props) {
	const { t } = useTranslation();
	const [faces, setFaces] = useState<FaceBox[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const fullW = fullSize.width;
	const fullH = fullSize.height;

	useEffect(() => {
		let cancelled = false;
		setLoading(true);
		setError(null);
		setFaces([]);

		(async () => {
			try {
				const detectUrl = iiifUrlFromBase(serviceBase, "full", {
					width: DETECT_WIDTH,
				});
				const img = await loadImage(detectUrl);
				const detected = await detectFaces(img);
				const detectSize = {
					width: img.naturalWidth,
					height: img.naturalHeight,
				};
				const target = { width: fullW, height: fullH };
				const scaled = detected.map((f) =>
					expandBox(scaleBox(f, detectSize, target), 1.6, target),
				);
				if (!cancelled) setFaces(scaled);
			} catch (e) {
				if (!cancelled) setError((e as Error).message);
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [serviceBase, fullW, fullH]);

	if (loading)
		return (
			<div role="status" aria-live="polite" className="flex flex-col gap-3">
				<p className="text-neutral-200 text-sm">{t("faces.detecting")}</p>
				<SkeletonGrid count={4} />
			</div>
		);
	if (error)
		return (
			<p role="alert" className="text-red-300">
				{error}
			</p>
		);
	if (faces.length === 0)
		return <p className="text-neutral-200">{t("faces.none")}</p>;

	return (
		<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
			{faces.map((face, i) => (
				<button
					key={`${face.x}-${face.y}-${face.w}`}
					type="button"
					onClick={() => onPick(face)}
					className="rounded-lg overflow-hidden border border-neutral-700 hover:border-neutral-300 transition"
				>
					<img
						src={iiifUrlFromBase(serviceBase, face, { width: 400 })}
						alt={t("faces.alt", { n: i + 1 })}
						className="w-full aspect-square object-cover"
						loading="lazy"
					/>
				</button>
			))}
		</div>
	);
}
