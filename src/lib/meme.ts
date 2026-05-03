export type MemeText = { top: string; bottom: string };

export function drawMeme(
	canvas: HTMLCanvasElement,
	img: HTMLImageElement,
	text: MemeText,
): void {
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("no 2d context");

	canvas.width = img.naturalWidth;
	canvas.height = img.naturalHeight;
	ctx.drawImage(img, 0, 0);

	const fontSize = Math.max(32, Math.round(canvas.width / 12));
	ctx.font = `${fontSize}px Impact, "Anton", "Arial Black", sans-serif`;
	ctx.textAlign = "center";
	ctx.fillStyle = "#fff";
	ctx.strokeStyle = "#000";
	ctx.lineWidth = Math.max(2, fontSize / 16);
	ctx.lineJoin = "round";

	const margin = fontSize * 0.6;
	if (text.top) {
		ctx.textBaseline = "top";
		drawStrokedLine(ctx, text.top.toUpperCase(), canvas.width / 2, margin);
	}
	if (text.bottom) {
		ctx.textBaseline = "bottom";
		drawStrokedLine(
			ctx,
			text.bottom.toUpperCase(),
			canvas.width / 2,
			canvas.height - margin,
		);
	}
}

function drawStrokedLine(
	ctx: CanvasRenderingContext2D,
	text: string,
	x: number,
	y: number,
): void {
	ctx.strokeText(text, x, y);
	ctx.fillText(text, x, y);
}

export function canvasToBlob(
	canvas: HTMLCanvasElement,
	type = "image/png",
): Promise<Blob> {
	return new Promise((resolve, reject) => {
		canvas.toBlob(
			(b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
			type,
		);
	});
}

export function downloadBlob(blob: Blob, filename: string): void {
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}
