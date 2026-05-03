import { Link, Route, Routes } from "react-router-dom";
import "./providers";
import { t } from "./i18n";
import { AboutPage } from "./pages/AboutPage";
import { FacesPage } from "./pages/FacesPage";
import { HomePage } from "./pages/HomePage";
import { MemePage } from "./pages/MemePage";

export default function App() {
	return (
		<div className="min-h-screen p-4 sm:p-8 max-w-5xl mx-auto">
			<header className="mb-8 flex items-baseline justify-between gap-4">
				<div>
					<Link to="/" className="text-3xl font-bold hover:text-white">
						{t("app.title")}
					</Link>
					<p className="text-neutral-400 text-sm mt-1">{t("app.tagline")}</p>
				</div>
				<Link to="/about" className="text-sm text-neutral-400 hover:text-white">
					{t("app.about")}
				</Link>
			</header>

			<Routes>
				<Route path="/" element={<HomePage />} />
				<Route path="/faces" element={<FacesPage />} />
				<Route path="/meme" element={<MemePage />} />
				<Route path="/about" element={<AboutPage />} />
				<Route
					path="*"
					element={<p className="text-neutral-400">{t("app.notFound")}</p>}
				/>
			</Routes>
		</div>
	);
}
