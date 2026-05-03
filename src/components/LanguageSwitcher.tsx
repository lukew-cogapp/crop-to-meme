import { useTranslation } from "react-i18next";

const LOCALES = [
	{ id: "en", label: "EN", full: "English" },
	{ id: "es", label: "ES", full: "Español" },
];

export function LanguageSwitcher() {
	const { i18n } = useTranslation();
	const current = i18n.resolvedLanguage;
	return (
		<div className="flex gap-1 text-xs">
			{LOCALES.map((l) => (
				<button
					key={l.id}
					type="button"
					onClick={() => i18n.changeLanguage(l.id)}
					aria-pressed={current === l.id}
					aria-label={l.full}
					lang={l.id}
					className={`px-2.5 py-1.5 min-h-[28px] min-w-[28px] rounded border ${
						current === l.id
							? "bg-white text-black border-white"
							: "border-neutral-700 text-neutral-200 hover:border-neutral-400"
					}`}
				>
					{l.label}
				</button>
			))}
		</div>
	);
}
