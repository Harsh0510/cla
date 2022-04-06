const axios = require("axios");

let apiRequestEx;

if (process.env.WONDE_API_TOKEN) {
	const axiosHeaders = {
		Authorization: "Bearer " + process.env.WONDE_API_TOKEN,
	};

	apiRequestEx = async (method, fullUrl, data) => {
		const config = {
			method: method,
			url: fullUrl,
			headers: axiosHeaders,
		};
		if (data) {
			config.data = data;
		}
		return (await axios(config)).data;
	};
} else {
	apiRequestEx = async () => {
		return {
			data: [],
		};
	};
}

module.exports = apiRequestEx;
