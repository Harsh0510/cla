const abs = require("./azure/azureBlobService");
const BlobResource = require("./azure/BlobResource");

module.exports = async function (params, ctx) {
	const userRole = await ctx.getUserRole();

	// Throw an error if non cla-admins attempt to access this endpoint
	ctx.assert(userRole === "cla-admin", 401, "Unauthorized");

	let url;
	if (process.env.IS_AZURE) {
		const tok = abs.generateSasToken(new BlobResource("emailactivityreport", `report.xlsx`), "r", null, 20);
		url = tok.uri;
	} else {
		url = `https://file-examples.com/wp-content/uploads/2017/02/file_example_XLSX_5000.xlsx`;
	}

	return {
		url: url,
	};
};
