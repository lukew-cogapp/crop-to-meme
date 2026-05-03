import { MDXProvider } from "@mdx-js/react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import AboutEs from "../content/about.es.mdx";
import AboutEn from "../content/about.mdx";

const components = {
	h2: (p: React.HTMLAttributes<HTMLHeadingElement>) => (
		<h2 className="text-2xl font-bold mt-2" {...p} />
	),
	h3: (p: React.HTMLAttributes<HTMLHeadingElement>) => (
		<h3 className="text-xl font-semibold mt-6" {...p} />
	),
	h4: (p: React.HTMLAttributes<HTMLHeadingElement>) => (
		<h4 className="text-lg font-semibold mt-4 text-neutral-100" {...p} />
	),
	p: (p: React.HTMLAttributes<HTMLParagraphElement>) => (
		<p className="text-neutral-300" {...p} />
	),
	ul: (p: React.HTMLAttributes<HTMLUListElement>) => (
		<ul className="list-disc pl-5 text-neutral-300 space-y-1" {...p} />
	),
	a: (p: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
		<a className="text-neutral-100 underline hover:text-white" {...p} />
	),
	code: (p: React.HTMLAttributes<HTMLElement>) => (
		<code
			className="rounded bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 text-sm text-neutral-200"
			{...p}
		/>
	),
};

export function AboutPage() {
	const { t, i18n } = useTranslation();
	const Body = i18n.resolvedLanguage === "es" ? AboutEs : AboutEn;
	return (
		<div className="flex flex-col gap-4 max-w-none">
			<p>
				<Link to="/" className="text-neutral-400 hover:underline">
					{t("app.back")}
				</Link>
			</p>
			<MDXProvider components={components}>
				<Body />
			</MDXProvider>
		</div>
	);
}
