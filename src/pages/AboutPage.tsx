import { Link } from "react-router-dom";
import { t } from "../i18n";

const PROMPTS = [
	"what could we do that would class as 'fun with iiif'",
	"I like crop to meme, maybe using AIC's API? and react-vite-tailwind",
	"I want to do face detect",
	"websearch for best face detection options",
	"lets use media pipe then",
	"also make sure we build this is a nice, abstract way. plan to deploy on gh pages",
	"websearch to make sure we're on the latest versions / techniques",
	"for the AIC API, they should have a filter for portraits that we should use, check their docs with a subagent",
	"or maybe we just have a filter _option_ but can still search",
	"give me a simple scaffold/skel ui, too",
	"is there a way, without wiring up an API to e.g. anthropic, that we could generate captions based on the content?",
	"lets make 100vh max, too",
	"lets make it so that you paste your own manifest / info.json in",
	"any cogapp clients? do some tests with Europeana search + access to iiif images",
	"add simple routing (react router?) so our pages have URLs. the final makememe should should references to the info.json and caption, so they can be shared",
	"lets not add europeana, but abstract so we add new ones later",
	"git init, gitignore and create repo in lukew-cogapp",
	"new about page, that contains a summary of the tech and the prompts we used",
];

export function AboutPage() {
	return (
		<div className="flex flex-col gap-6 prose prose-invert max-w-none">
			<p>
				<Link to="/" className="text-neutral-400 hover:underline">
					{t("app.back")}
				</Link>
			</p>

			<h2 className="text-2xl font-bold">{t("about.heading")}</h2>
			<p className="text-neutral-300">{t("about.summary")}</p>

			<h3 className="text-xl font-semibold mt-4">{t("about.stack")}</h3>
			<ul className="list-disc pl-5 text-neutral-300 space-y-1">
				<li>Vite + React 19 + TypeScript strict</li>
				<li>Tailwind v4 (CSS-first config)</li>
				<li>Biome v2 (lint + format)</li>
				<li>react-router-dom v7 (hash router for GitHub Pages)</li>
				<li>
					<code>@mediapipe/tasks-vision</code> FaceDetector (WebGPU/WASM,
					on-device)
				</li>
				<li>IIIF Image API 2.0 for crops + info.json</li>
				<li>IIIF Presentation API v2 + v3 for paste-your-own manifests</li>
				<li>Canvas 2D for meme rendering</li>
				<li>GitHub Actions → Pages deploy</li>
			</ul>

			<h3 className="text-xl font-semibold mt-4">{t("about.architecture")}</h3>
			<ul className="list-disc pl-5 text-neutral-300 space-y-1">
				<li>
					<code>lib/</code> — pure modules: AIC client, IIIF URL builder, face
					detector wrapper, image loader, meme renderer, caption templater
				</li>
				<li>
					<code>providers/</code> — pluggable source registry (AIC search, paste
					IIIF). Add new providers without touching pages.
				</li>
				<li>
					<code>pages/</code> — Home / Faces / Meme / About. Each page reads its
					state from URL search params, so any meme is a shareable link.
				</li>
			</ul>

			<h3 className="text-xl font-semibold mt-4">{t("about.prompts")}</h3>
			<p className="text-neutral-300">{t("about.promptsIntro")}</p>
			<ol className="list-decimal pl-5 text-neutral-300 space-y-1 text-sm">
				{PROMPTS.map((p) => (
					<li key={p}>
						<code>{p}</code>
					</li>
				))}
			</ol>
		</div>
	);
}
