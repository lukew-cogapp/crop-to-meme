declare module "*.svg" {
	const src: string;
	export default src;
}

declare module "*.mdx" {
	import type { ComponentType } from "react";

	const MDXComponent: ComponentType<Record<string, unknown>>;
	export default MDXComponent;
}
