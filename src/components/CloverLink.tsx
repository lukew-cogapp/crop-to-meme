const CLOVER_REPO = "https://github.com/samvera-labs/clover-iiif";

export function CloverLink() {
	return (
		<a
			href={CLOVER_REPO}
			target="_blank"
			rel="noopener noreferrer"
			className="underline decoration-dotted underline-offset-2 hover:text-white"
		>
			Clover IIIF
		</a>
	);
}
