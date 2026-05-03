import type { Point } from "./faces";

export type SunglassesStyle =
	| "deal-with-it"
	| "classic"
	| "aviator"
	| "round"
	| "monocle"
	| "star";

export const SUNGLASSES_STYLES: SunglassesStyle[] = [
	"deal-with-it",
	"classic",
	"aviator",
	"round",
	"monocle",
	"star",
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
	else if (style === "monocle") drawMonocle(ctx, eyeDist);
	else if (style === "star") drawStar(ctx, eyeDist);
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
	const lensW = eyeDist * 1.05;
	const lensH = eyeDist * 0.9;
	const gap = eyeDist * 0.1;
	const totalW = lensW * 2 + gap;
	const armLen = eyeDist * 1.0;
	const lineW = Math.max(2, eyeDist * 0.05);

	ctx.strokeStyle = "#cfa84a";
	ctx.lineWidth = lineW;
	ctx.lineCap = "round";
	ctx.lineJoin = "round";

	ctx.fillStyle = "rgba(15, 25, 45, 0.88)";
	aviatorTeardrop(ctx, -totalW / 2, -lensH / 2, lensW, lensH, false);
	ctx.fill();
	ctx.stroke();
	aviatorTeardrop(ctx, gap / 2, -lensH / 2, lensW, lensH, true);
	ctx.fill();
	ctx.stroke();

	const browY = -lensH / 2;
	ctx.beginPath();
	ctx.moveTo(-totalW / 2 - lensW * 0.02, browY);
	ctx.lineTo(totalW / 2 + lensW * 0.02, browY);
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(-gap / 2, browY + lensH * 0.05);
	ctx.quadraticCurveTo(0, browY + lensH * 0.18, gap / 2, browY + lensH * 0.05);
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(-totalW / 2, browY + lensH * 0.1);
	ctx.lineTo(-totalW / 2 - armLen, browY - lensH * 0.05);
	ctx.moveTo(totalW / 2, browY + lensH * 0.1);
	ctx.lineTo(totalW / 2 + armLen, browY - lensH * 0.05);
	ctx.stroke();

	ctx.fillStyle = "rgba(255,255,255,0.22)";
	ctx.beginPath();
	ctx.ellipse(
		-totalW / 2 + lensW * 0.32,
		-lensH * 0.18,
		lensW * 0.2,
		lensH * 0.08,
		-0.1,
		0,
		Math.PI * 2,
	);
	ctx.fill();
	ctx.beginPath();
	ctx.ellipse(
		gap / 2 + lensW * 0.68,
		-lensH * 0.18,
		lensW * 0.2,
		lensH * 0.08,
		0.1,
		0,
		Math.PI * 2,
	);
	ctx.fill();
}

function aviatorTeardrop(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	w: number,
	h: number,
	mirror: boolean,
): void {
	// Anchor points (left lens, non-mirrored):
	//   topInner  = (x, y)             slightly rounded
	//   topOuter  = (x+w, y)           rounded corner
	//   sideOuter = (x+w, y+h*0.55)    widest point on outer side
	//   bottomTip = (x+w*0.4, y+h)     narrow point toward nose-bottom
	//   sideInner = (x, y+h*0.35)      curve down inner side
	ctx.beginPath();
	if (!mirror) {
		ctx.moveTo(x + w * 0.05, y);
		ctx.lineTo(x + w * 0.9, y);
		// rounded top-outer corner
		ctx.quadraticCurveTo(x + w, y, x + w, y + h * 0.12);
		// outer side bulge down to tip
		ctx.bezierCurveTo(
			x + w,
			y + h * 0.55,
			x + w * 0.85,
			y + h * 0.95,
			x + w * 0.45,
			y + h,
		);
		// pointed bottom-inner
		ctx.bezierCurveTo(
			x + w * 0.2,
			y + h * 0.98,
			x + w * 0.05,
			y + h * 0.75,
			x,
			y + h * 0.4,
		);
		// rounded top-inner corner back to start
		ctx.quadraticCurveTo(x, y, x + w * 0.05, y);
	} else {
		// mirror across vertical axis at x+w/2
		ctx.moveTo(x + w * 0.95, y);
		ctx.lineTo(x + w * 0.1, y);
		ctx.quadraticCurveTo(x, y, x, y + h * 0.12);
		ctx.bezierCurveTo(
			x,
			y + h * 0.55,
			x + w * 0.15,
			y + h * 0.95,
			x + w * 0.55,
			y + h,
		);
		ctx.bezierCurveTo(
			x + w * 0.8,
			y + h * 0.98,
			x + w * 0.95,
			y + h * 0.75,
			x + w,
			y + h * 0.4,
		);
		ctx.quadraticCurveTo(x + w, y, x + w * 0.95, y);
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

function drawMonocle(ctx: CanvasRenderingContext2D, eyeDist: number): void {
	const r = eyeDist * 0.55;
	const cx = eyeDist / 2;
	const cy = 0;
	const rim = Math.max(2, eyeDist * 0.07);

	ctx.save();
	ctx.lineWidth = rim;
	ctx.strokeStyle = "#1a1208";
	ctx.fillStyle = "rgba(220, 230, 240, 0.18)";
	ctx.beginPath();
	ctx.arc(cx, cy, r, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();

	ctx.fillStyle = "rgba(255,255,255,0.35)";
	ctx.beginPath();
	ctx.ellipse(
		cx - r * 0.35,
		cy - r * 0.35,
		r * 0.25,
		r * 0.12,
		-Math.PI / 4,
		0,
		Math.PI * 2,
	);
	ctx.fill();

	ctx.strokeStyle = "#3a2a10";
	ctx.lineWidth = Math.max(1.5, eyeDist * 0.025);
	const chainStartX = cx + r * Math.cos(Math.PI / 4);
	const chainStartY = cy + r * Math.sin(Math.PI / 4);
	const chainEndX = chainStartX + eyeDist * 0.25;
	const chainEndY = chainStartY + eyeDist * 0.9;
	ctx.beginPath();
	ctx.moveTo(chainStartX, chainStartY);
	ctx.quadraticCurveTo(
		chainStartX + eyeDist * 0.05,
		chainStartY + eyeDist * 0.55,
		chainEndX,
		chainEndY,
	);
	ctx.stroke();
	ctx.restore();
}

function starPath(
	ctx: CanvasRenderingContext2D,
	cx: number,
	cy: number,
	rOuter: number,
	rInner: number,
): void {
	const points = 5;
	ctx.beginPath();
	for (let i = 0; i < points * 2; i++) {
		const r = i % 2 === 0 ? rOuter : rInner;
		const a = -Math.PI / 2 + (i * Math.PI) / points;
		const x = cx + Math.cos(a) * r;
		const y = cy + Math.sin(a) * r;
		if (i === 0) ctx.moveTo(x, y);
		else ctx.lineTo(x, y);
	}
	ctx.closePath();
}

function drawStar(ctx: CanvasRenderingContext2D, eyeDist: number): void {
	const rOuter = eyeDist * 0.7;
	const rInner = rOuter * 0.45;
	const cxL = -eyeDist / 2;
	const cxR = eyeDist / 2;
	const armLen = eyeDist * 1.0;
	const lineW = Math.max(2, eyeDist * 0.06);

	ctx.save();
	ctx.lineJoin = "round";
	ctx.lineCap = "round";
	ctx.lineWidth = lineW;

	// frame colour: hot pink rim, gold inner shimmer
	ctx.strokeStyle = "#ff3da8";
	ctx.fillStyle = "rgba(255, 80, 160, 0.25)";

	starPath(ctx, cxL, 0, rOuter, rInner);
	ctx.fill();
	ctx.stroke();
	starPath(ctx, cxR, 0, rOuter, rInner);
	ctx.fill();
	ctx.stroke();

	// dark lens behind star: tinted disc clipped to star
	ctx.fillStyle = "rgba(30, 10, 40, 0.7)";
	ctx.save();
	starPath(ctx, cxL, 0, rOuter * 0.92, rInner * 0.92);
	ctx.clip();
	ctx.fillRect(cxL - rOuter, -rOuter, rOuter * 2, rOuter * 2);
	ctx.restore();
	ctx.save();
	starPath(ctx, cxR, 0, rOuter * 0.92, rInner * 0.92);
	ctx.clip();
	ctx.fillRect(cxR - rOuter, -rOuter, rOuter * 2, rOuter * 2);
	ctx.restore();

	// gold inner stroke for sparkle
	ctx.strokeStyle = "#ffd84a";
	ctx.lineWidth = Math.max(1, eyeDist * 0.02);
	starPath(ctx, cxL, 0, rOuter * 0.78, rInner * 0.78);
	ctx.stroke();
	starPath(ctx, cxR, 0, rOuter * 0.78, rInner * 0.78);
	ctx.stroke();

	// arms — anchor at outer side-point of star (angle ±18° from horizontal)
	ctx.strokeStyle = "#ff3da8";
	ctx.lineWidth = lineW;
	const sideAngle = (198 * Math.PI) / 180; // left outer side point
	const sideX = Math.cos(sideAngle) * rOuter;
	const sideY = Math.sin(sideAngle) * rOuter;
	ctx.beginPath();
	ctx.moveTo(cxL + sideX, sideY);
	ctx.lineTo(cxL + sideX - armLen, sideY);
	ctx.moveTo(cxR - sideX, sideY);
	ctx.lineTo(cxR - sideX + armLen, sideY);
	ctx.stroke();

	// glints
	ctx.fillStyle = "rgba(255,255,255,0.55)";
	ctx.beginPath();
	ctx.arc(cxL - rOuter * 0.25, -rOuter * 0.25, rOuter * 0.07, 0, Math.PI * 2);
	ctx.fill();
	ctx.beginPath();
	ctx.arc(cxR - rOuter * 0.25, -rOuter * 0.25, rOuter * 0.07, 0, Math.PI * 2);
	ctx.fill();

	ctx.restore();
}
