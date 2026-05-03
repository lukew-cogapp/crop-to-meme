import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.tsx";
import "./i18n";
import "./index.css";

const root = document.getElementById("root");
if (!root) throw new Error("no #root element");

createRoot(root).render(
	<StrictMode>
		<HashRouter>
			<App />
		</HashRouter>
	</StrictMode>,
);
