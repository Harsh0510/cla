const getApiBaseDomain = (loc, env) => {
	if (env.CLA_ENDPOINT_CONTROLLER) {
		return env.CLA_ENDPOINT_CONTROLLER;
	}
	if (loc.port == "16000") {
		return loc.hostname + ":13000";
	}
	if (loc.host.indexOf("public-web-app") >= 0) {
		const replacement = env.NODE_ENV === "development" ? "stage-controller" : "production-controller";
		return loc.host.replace(/public-web-app/g, replacement);
	}
	if (loc.host.indexOf("www.") === 0) {
		// strip out the 'www.'
		return "api" + loc.host.slice(3);
	}
	return "api." + loc.host;
};

const apiBaseOrigin = window.location.protocol + "//" + getApiBaseDomain(window.location, process.env);

export default apiBaseOrigin;
