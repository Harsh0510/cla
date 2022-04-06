const apiKey = process.env.CLA_CHECK_PERMISSIONS_API_KEY;
const axios = require("axios");

const getCoverStatus = (data) => {
	if (!data) {
		return "Not Found";
	}
	if (data.find((item) => item.reportType === "Excluded")) {
		return "Excluded";
	}
	if (data.find((item) => item.reportType === "Permitted")) {
		return "Covered";
	}
	return "Not Found";
};

const getPermissionsStatusReal = async (isbn) => {
	const result = await axios.get(`https://api.cla.co.uk/check-permissions/v1/getpermissionbyidentifier/ISBN/${isbn}/143?messageId=1&usageTypes=2`, {
		headers: {
			"Ocp-Apim-Subscription-Key": apiKey,
		},
	});
	return getCoverStatus(result.data.usagesSummary);
};

const getPermissionsStatusDummy = async (isbn) => {
	if (isbn === "9781446357040") {
		return "Excluded";
	}
	if (isbn === "9781446357064") {
		return "Covered";
	}
	return "Not Found";
};

module.exports = apiKey ? getPermissionsStatusReal : getPermissionsStatusDummy;
