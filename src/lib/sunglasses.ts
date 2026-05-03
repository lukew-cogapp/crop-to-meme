import type { Point } from "./faces";

export type SunglassesStyle = "deal-with-it" | "classic" | "aviator" | "round";

export const SUNGLASSES_STYLES: SunglassesStyle[] = [
	"deal-with-it",
	"classic",
	"aviator",
	"round",
];

export function preloadSunglasses(): Promise<void> {
	return Promise.resolve();
}

const DWI_GRID = [
	"XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
	"..XXXXXXXXXX..XXXXXXXXXX........",
	"..XXXXXXXXXX..XXXXXXXXXX........",
	"...XXXXXXXX....XXXXXXXX.........",
	"....XXXXXX......XXXXXX..........",
];
const DWI_COLS = 32;
const DWI_ROWS = DWI_GRID.length;
const DWI_LEFT_EYE_COL = 7.5;
const DWI_RIGHT_EYE_COL = 18.5;
const DWI_EYE_ROW = 1.5;

export function drawSunglasses(
	ctx: CanvasRenderingContext2D,
	leftEye: Point,
	rightEye: Point,
	style: SunglassesStyle = "classic",
): void {
	const dx = rightEye.x - leftEye.x;
	const dy = rightEye.y - leftEye.y;
	const eyeDist = Math.hypot(dx, dy);
	const angle = Math.atan2(dy, dx);
	const cx = (leftEye.x + rightEye.x) / 2;
	const cy = (leftEye.y + rightEye.y) / 2;

	ctx.save();
	ctx.translate(cx, cy);
	ctx.rotate(angle);

	if (style === "deal-with-it") drawDealWithIt(ctx, eyeDist);
	else if (style === "classic") drawClassic(ctx, eyeDist);
	else if (style === "aviator") drawAviator(ctx, eyeDist);
	else drawRound(ctx, eyeDist);

	ctx.restore();
}

function drawDealWithIt(ctx: CanvasRenderingContext2D, eyeDist: number): void {
	const eyeColSpan = DWI_RIGHT_EYE_COL - DWI_LEFT_EYE_COL;
	const px = eyeDist / eyeColSpan;
	const eyeMidCol = (DWI_LEFT_EYE_COL + DWI_RIGHT_EYE_COL) / 2;
	const ox = -eyeMidCol * px;
	const oy = -DWI_EYE_ROW * px;

	ctx.fillStyle = "#000";
	for (let r = 0; r < DWI_ROWS; r++) {
		for (let c = 0; c < DWI_COLS; c++) {
			if (DWI_GRID[r][c] === "X") {
				ctx.fillRect(ox + c * px, oy + r * px, px + 0.5, px + 0.5);
			}
		}
	}
}

function drawClassic(ctx: CanvasRenderingContext2D, eyeDist: number): void {
	const lensW = eyeDist * 0.95;
	const lensH = eyeDist * 0.75;
	const gap = eyeDist * 0.18;
	const totalW = lensW * 2 + gap;
	const armLen = eyeDist * 1.2;
	const radius = lensH * 0.25;

	ctx.fillStyle = "#000";
	ctx.strokeStyle = "#000";
	ctx.lineWidth = Math.max(2, eyeDist * 0.08);
	ctx.lineCap = "round";

	ctx.beginPath();
	ctx.moveTo(-totalW / 2, 0);
	ctx.lineTo(-totalW / 2 - armLen, 0);
	ctx.moveTo(totalW / 2, 0);
	ctx.lineTo(totalW / 2 + armLen, 0);
	ctx.stroke();

	roundRect(ctx, -totalW / 2, -lensH / 2, lensW, lensH, radius);
	ctx.fill();
	roundRect(ctx, gap / 2, -lensH / 2, lensW, lensH, radius);
	ctx.fill();

	ctx.fillRect(-gap / 2, -eyeDist * 0.04, gap, eyeDist * 0.08);

	ctx.fillStyle = "rgba(255,255,255,0.18)";
	ctx.beginPath();
	ctx.ellipse(
		-totalW / 2 + lensW * 0.3,
		-lensH * 0.18,
		lensW * 0.18,
		lensH * 0.1,
		0,
		0,
		Math.PI * 2,
	);
	ctx.fill();
	ctx.beginPath();
	ctx.ellipse(
		gap / 2 + lensW * 0.3,
		-lensH * 0.18,
		lensW * 0.18,
		lensH * 0.1,
		0,
		0,
		Math.PI * 2,
	);
	ctx.fill();
}

function roundRect(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	w: number,
	h: number,
	r: number,
): void {
	ctx.beginPath();
	ctx.moveTo(x + r, y);
	ctx.arcTo(x + w, y, x + w, y + h, r);
	ctx.arcTo(x + w, y + h, x, y + h, r);
	ctx.arcTo(x, y + h, x, y, r);
	ctx.arcTo(x, y, x + w, y, r);
	ctx.closePath();
}

function drawAviator(ctx: CanvasRenderingContext2D, eyeDist: number): void {
	const lensW = eyeDist * 1.0;
	const lensH = eyeDist * 0.95;
	const gap = eyeDist * 0.15;
	const totalW = lensW * 2 + gap;
	const armLen = eyeDist * 1.2;

	ctx.strokeStyle = "#cfa84a";
	ctx.lineWidth = Math.max(2, eyeDist * 0.06);
	ctx.beginPath();
	ctx.moveTo(-totalW / 2, 0);
	ctx.lineTo(-totalW / 2 - armLen, 0);
	ctx.moveTo(totalW / 2, 0);
	ctx.lineTo(totalW / 2 + armLen, 0);
	ctx.stroke();

	ctx.fillStyle = "rgba(20, 30, 50, 0.85)";
	teardrop(ctx, -totalW / 2, -lensH / 2, lensW, lensH, false);
	ctx.fill();
	ctx.stroke();
	teardrop(ctx, gap / 2, -lensH / 2, lensW, lensH, true);
	ctx.fill();
	ctx.stroke();

	ctx.fillStyle = "rgba(255,255,255,0.18)";
	ctx.beginPath();
	ctx.ellipse(
		-totalW / 2 + lensW * 0.35,
		-lensH * 0.15,
		lensW * 0.18,
		lensH * 0.1,
		0,
		0,
		Math.PI * 2,
	);
	ctx.fill();
	ctx.beginPath();
	ctx.ellipse(
		gap / 2 + lensW * 0.35,
		-lensH * 0.15,
		lensW * 0.18,
		lensH * 0.1,
		0,
		0,
		Math.PI * 2,
	);
	ctx.fill();

	ctx.beginPath();
	ctx.moveTo(-gap / 2, 0);
	ctx.quadraticCurveTo(0, -eyeDist * 0.05, gap / 2, 0);
	ctx.stroke();
}

function teardrop(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	w: number,
	h: number,
	mirror: boolean,
): void {
	ctx.beginPath();
	if (!mirror) {
		ctx.moveTo(x + w * 0.5, y);
		ctx.bezierCurveTo(x + w, y, x + w, y + h * 0.4, x + w * 0.95, y + h * 0.7);
		ctx.bezierCurveTo(
			x + w * 0.7,
			y + h,
			x + w * 0.2,
			y + h,
			x + w * 0.05,
			y + h * 0.6,
		);
		ctx.bezierCurveTo(x, y + h * 0.3, x, y, x + w * 0.5, y);
	} else {
		ctx.moveTo(x + w * 0.5, y);
		ctx.bezierCurveTo(x, y, x, y + h * 0.4, x + w * 0.05, y + h * 0.7);
		ctx.bezierCurveTo(
			x + w * 0.3,
			y + h,
			x + w * 0.8,
			y + h,
			x + w * 0.95,
			y + h * 0.6,
		);
		ctx.bezierCurveTo(x + w, y + h * 0.3, x + w, y, x + w * 0.5, y);
	}
	ctx.closePath();
}

function drawRound(ctx: CanvasRenderingContext2D, eyeDist: number): void {
	const r = eyeDist * 0.5;
	const gap = eyeDist * 0.2;
	const totalW = r * 4 + gap;
	const armLen = eyeDist * 1.2;

	ctx.strokeStyle = "#222";
	ctx.lineWidth = Math.max(2, eyeDist * 0.06);
	ctx.fillStyle = "rgba(120, 80, 30, 0.6)";

	ctx.beginPath();
	ctx.moveTo(-totalW / 2, 0);
	ctx.lineTo(-totalW / 2 - armLen, 0);
	ctx.moveTo(totalW / 2, 0);
	ctx.lineTo(totalW / 2 + armLen, 0);
	ctx.stroke();

	ctx.beginPath();
	ctx.arc(-r - gap / 2, 0, r, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(r + gap / 2, 0, r, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(-gap / 2, 0);
	ctx.lineTo(gap / 2, 0);
	ctx.stroke();
}
