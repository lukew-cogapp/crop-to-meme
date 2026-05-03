import { useId, useState } from "react";
import { useTranslation } from "react-i18next";

type Props = { onSubmit: (input: string) => void };

const EXAMPLES = [
	{
		labelKey: "paste.exampleAic" as const,
		url: "https://www.artic.edu/iiif/2/3a608f55-d76e-fa96-d0b1-0789fbc48f1e/info.json",
	},
];

export function ManifestPaste({ onSubmit }: Props) {
	const { t } = useTranslation();
	const inputId = useId();
	const [value, setValue] = useState("");

	return (
		<div className="flex flex-col gap-3">
			<label htmlFor={inputId} className="text-sm text-neutral-300">
				{t("paste.label")}
			</label>
			<textarea
				id={inputId}
				value={value}
				onChange={(e) => setValue(e.target.value)}
				rows={4}
				placeholder={t("paste.placeholder")}
				className="w-full rounded-lg bg-neutral-900 border border-neutral-700 px-4 py-3 font-mono text-sm focus-visible:border-neutral-100"
			/>
			<div className="flex flex-wrap gap-2 text-xs">
				{EXAMPLES.map((ex) => (
					<button
						key={ex.url}
						type="button"
						onClick={() => setValue(ex.url)}
						className="rounded-md border border-neutral-700 px-3 py-1 text-neutral-300 hover:border-neutral-400"
					>
						{t(ex.labelKey)}
					</button>
				))}
			</div>
			<button
				type="button"
				onClick={() => onSubmit(value.trim())}
				disabled={!value.trim()}
				className="self-start rounded-lg bg-white text-black px-5 py-2 font-medium disabled:opacity-50"
			>
				{t("paste.load")}
			</button>
		</div>
	);
}
