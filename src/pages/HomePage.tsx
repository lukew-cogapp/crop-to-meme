import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ManifestPaste } from "../components/ManifestPaste";
import { ProviderSearch } from "../components/ProviderSearch";
import { listProviders } from "../lib/providers";
import { pasteRef } from "../providers/iiif-paste";

export function HomePage() {
	const navigate = useNavigate();
	const providers = listProviders();
	const [activeId, setActiveId] = useState(providers[0]?.id ?? "");
	const active = providers.find((p) => p.id === activeId);

	const goToFaces = (sourceRef: string) => {
		navigate(`/faces?src=${encodeURIComponent(sourceRef)}`);
	};

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-wrap gap-2">
				{providers.map((p) => (
					<button
						key={p.id}
						type="button"
						onClick={() => setActiveId(p.id)}
						className={`rounded-md border px-3 py-1.5 text-sm ${
							activeId === p.id
								? "bg-white text-black border-white"
								: "border-neutral-700 text-neutral-300"
						}`}
					>
						{p.name}
					</button>
				))}
			</div>

			{active?.kind === "search" && (
				<ProviderSearch
					provider={active}
					onPick={(hit) => goToFaces(hit.sourceRef)}
				/>
			)}

			{active?.kind === "paste" && (
				<ManifestPaste onSubmit={(url) => goToFaces(pasteRef(url))} />
			)}
		</div>
	);
}
