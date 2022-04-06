const get = (key: string, defaultValue: string): string => {
	if (typeof process.env[key] === "string") {
		const v = (process.env[key] as string).trim();
		if (v) {
			return v;
		}
	}
	return defaultValue;
};

export const rawUploads = get("BDAPI_AZURE_RAW_UPLOADS_CONTAINER", "rawuploads");
export const extracts = get("BDAPI_AZURE_EXTRACTS_CONTAINER", "borndigitalextracts");
