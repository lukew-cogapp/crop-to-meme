export function loadImage(
	src: string,
	crossOrigin = "anonymous",
): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = crossOrigin;
		img.onload = () => resolve(img);
		img.onerror = () => reject(new Error(`image load failed: ${src}`));
		img.src = src;
	});
}
