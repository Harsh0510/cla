export default () => {
	if (process.env["BDAPI_BIND_PORT"]) {
		return parseInt(process.env["BDAPI_BIND_PORT"], 10) || 80;
	}
	return 80;
};
