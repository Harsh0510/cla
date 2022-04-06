const axios = require("axios").default;

module.exports = async (apiBase, email, password) => {
	const result = await axios.post(
		apiBase + '/auth/login',
		{
			email: email,
			password: password,
		},
		{
			headers: {
				'X-CSRF': 'y'
			}
		}
	);
	if (result.data.session_token) {
		return result.data.session_token;
	}
	let cookieHeader = result.headers["set-cookie"];
	if (Array.isArray(cookieHeader)) {
		cookieHeader = cookieHeader.join(";");
	}
	if (!cookieHeader) {
		throw new Error("could not find session cookie [1]");
	}
	const match = cookieHeader.match(/\bXSESSID=([0-9a-f]+)\b/);
	if (!match) {
		throw new Error("could not find session cookie [2]");
	}
	return match[1];
};