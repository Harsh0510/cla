const hmac = require("../common/hmac");

module.exports = (params) => {
	if (params.error) {
		// some kind of error happened
		let err = params.error.toString();
		if (params.error_description) {
			err += ": " + params.error_description;
		}
		return [err];
	}
	if (!(params.code && params.state)) {
		// error
		return ["code and state not both provided"];
	}
	const stateParts = params.state.split("_");
	if (stateParts.length !== 2) {
		// error
		return ["state param malformed"];
	}
	if (hmac(stateParts[0]) !== stateParts[1]) {
		// error
		return ["hmac mismatch"];
	}
	return [null, stateParts[0]];
};
