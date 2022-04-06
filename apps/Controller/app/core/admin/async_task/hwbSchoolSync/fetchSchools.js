const axios = require("axios");

const fetchAccessToken = async (tokenEndpoint, clientId, clientSecret) => {
	return (
		await axios.post(
			tokenEndpoint,
			new URLSearchParams({
				client_id: clientId,
				grant_type: "client_credentials",
				client_secret: clientSecret,
				scope: "tpspapi",
			}),
			{
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
			}
		)
	).data.access_token;
};

const fetchSchools = async (schoolsApiEndpoint, accessToken, base64Cert) => {
	return (
		await axios.get(schoolsApiEndpoint, {
			headers: {
				Authorization: "Bearer " + accessToken,
				ClientCert: base64Cert,
			},
		})
	).data;
};

module.exports = async (settings) => {
	const accessToken = await fetchAccessToken(settings.tokenEndpoint, settings.clientId, settings.clientSecret);
	return await fetchSchools(settings.schoolApiEndpoint, accessToken, settings.base64Cert);
};
