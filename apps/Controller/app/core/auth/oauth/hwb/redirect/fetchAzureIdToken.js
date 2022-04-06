const axios = require("axios");

const env = require("../common/env");

module.exports = async (challenge, authCode) => {
	const res = await axios.post(
		env.tokenEndpoint,
		new URLSearchParams({
			client_id: env.clientId,
			grant_type: "authorization_code",
			scope: env.scope,
			code: authCode,
			redirect_uri: env.redirectUri,
			client_secret: env.clientSecret,
			code_verifier: challenge,
		})
	);
	return res && res.data && res.data.id_token ? res.data.id_token : null;
};
