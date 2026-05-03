import { lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Link, Route, Routes } from "react-router-dom";
import "./providers";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { AboutPage } from "./pages/AboutPage";
import { FacesPage } from "./pages/FacesPage";
import { HomePage } from "./pages/HomePage";
import { MemePage } from "./pages/MemePage";

const ViewPage = lazy(() =>
	import("./pages/ViewPage").then((m) => ({ default: m.ViewPage })),
);

export default function App() {
	const { t } = useTranslation();
	return (
		<div className="min-h-screen p-4 sm:p-8 max-w-5xl mx-auto">
			<a href="#main" className="skip-link">
				{t("app.skipToContent")}
			</a>
			<header className="mb-8 flex items-baseline justify-between gap-4">
				<div>
					<Link to="/" className="text-3xl font-bold hover:text-white">
						{t("app.title")}
					</Link>
					<p className="text-neutral-300 text-sm mt-1">{t("app.tagline")}</p>
				</div>
				<nav
					aria-label={t("app.primaryNav")}
					className="flex items-center gap-4"
				>
					<LanguageSwitcher />
					<Link
						to="/about"
						className="text-sm text-neutral-300 hover:text-white"
					>
						{t("app.about")}
					</Link>
				</nav>
			</header>

			<main id="main">
				<Suspense
					fallback={
						<p role="status" aria-live="polite" className="text-neutral-200">
							{t("app.loading")}
						</p>
					}
				>
					<Routes>
						<Route path="/" element={<HomePage />} />
						<Route path="/faces" element={<FacesPage />} />
						<Route path="/meme" element={<MemePage />} />
						<Route path="/view" element={<ViewPage />} />
						<Route path="/about" element={<AboutPage />} />
						<Route
							path="*"
							element={<p className="text-neutral-300">{t("app.notFound")}</p>}
						/>
					</Routes>
				</Suspense>
			</main>
		</div>
	);
}
