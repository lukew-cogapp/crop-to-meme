import mdx from "@mdx-js/rollup";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	base: process.env.GITHUB_PAGES_BASE ?? "/",
	plugins: [
		{ enforce: "pre", ...mdx({ providerImportSource: "@mdx-js/react" }) },
		react(),
		tailwindcss(),
	],
});
