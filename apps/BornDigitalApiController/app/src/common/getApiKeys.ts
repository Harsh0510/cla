export default () => {
	const ret = new Set<string>();
	if (!process.env["BDAPI_API_KEYS"]) {
		return ret;
	}
	const parts = process.env["BDAPI_API_KEYS"].split(/[\s,;]+/g);
	for (const part of parts) {
		ret.add(part);
	}
	return ret;
};
