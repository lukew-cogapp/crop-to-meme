export type MemeText = { top: string; bottom: string };

const MAX_LINES = 3;

function wrapLines(
	ctx: CanvasRenderingContext2D,
	text: string,
	maxWidth: number,
): string[] {
	const words = text.split(/\s+/).filter(Boolean);
	if (words.length === 0) return [];
	const lines: string[] = [];
	let current = words[0];
	for (let i = 1; i < words.length; i++) {
		const next = `${current} ${words[i]}`;
		if (ctx.measureText(next).width <= maxWidth) {
			current = next;
		} else {
			lines.push(current);
			current = words[i];
		}
	}
	lines.push(current);
	return lines;
}

function fitText(
	ctx: CanvasRenderingContext2D,
	text: string,
	maxWidth: number,
	startSize: number,
	minSize: number,
): { lines: string[]; size: number } {
	let size = startSize;
	while (size >= minSize) {
		ctx.font = fontStr(size);
		const lines = wrapLines(ctx, text, maxWidth);
		if (lines.length <= MAX_LINES) return { lines, size };
		size = Math.floor(size * 0.9);
	}
	ctx.font = fontStr(minSize);
	return { lines: wrapLines(ctx, text, maxWidth), size: minSize };
}

function fontStr(size: number): string {
	return `${size}px Impact, "Anton", "Arial Black", sans-serif`;
}

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

	const baseSize = Math.max(32, Math.round(canvas.width / 12));
	const minSize = Math.max(20, Math.round(baseSize * 0.5));
	const sideMargin = baseSize * 0.4;
	const maxWidth = canvas.width - sideMargin * 2;
	const edgeMargin = baseSize * 0.6;

	ctx.textAlign = "center";
	ctx.fillStyle = "#fff";
	ctx.strokeStyle = "#000";
	ctx.lineJoin = "round";

	if (text.top) {
		const { lines, size } = fitText(ctx, text.top, maxWidth, baseSize, minSize);
		drawLines(ctx, lines, size, canvas.width / 2, edgeMargin, "top");
	}
	if (text.bottom) {
		const { lines, size } = fitText(
			ctx,
			text.bottom,
			maxWidth,
			baseSize,
			minSize,
		);
		drawLines(
			ctx,
			lines,
			size,
			canvas.width / 2,
			canvas.height - edgeMargin,
			"bottom",
		);
	}
}

function drawLines(
	ctx: CanvasRenderingContext2D,
	lines: string[],
	size: number,
	x: number,
	yEdge: number,
	anchor: "top" | "bottom",
): void {
	ctx.font = fontStr(size);
	ctx.lineWidth = Math.max(2, size / 16);
	const lineHeight = size * 1.05;

	if (anchor === "top") {
		ctx.textBaseline = "top";
		for (let i = 0; i < lines.length; i++) {
			const text = lines[i].toUpperCase();
			const y = yEdge + i * lineHeight;
			ctx.strokeText(text, x, y);
			ctx.fillText(text, x, y);
		}
	} else {
		ctx.textBaseline = "bottom";
		for (let i = 0; i < lines.length; i++) {
			const text = lines[lines.length - 1 - i].toUpperCase();
			const y = yEdge - i * lineHeight;
			ctx.strokeText(text, x, y);
			ctx.fillText(text, x, y);
		}
	}
}

export function canvasToBlob(
	canvas: HTMLCanvasElement,
	type = "image/jpeg",
	quality = 0.92,
): Promise<Blob> {
	return new Promise((resolve, reject) => {
		canvas.toBlob(
			(b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
			type,
			quality,
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
