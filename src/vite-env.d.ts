/// <reference types="vite/client" />

interface ImportMetaEnv {
	/** Base URL of the worker/ IIIF proxy. Unset disables the AIC provider. */
	readonly VITE_AIC_IIIF_PROXY?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
