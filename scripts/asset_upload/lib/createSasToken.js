const AzureBlob = require("@azure/storage-blob");

module.exports = (accountDetails, permissions, seconds) => {
	if (!permissions) {
		permissions = "rwdlacup";
	}
	if (!seconds) {
		seconds = 24 * 60 * 60; // 24 hours
	}
	const starts = new Date();
	starts.setHours(starts.getHours() - 2);
	const ends = new Date();
	ends.setSeconds(ends.getSeconds() + seconds);
	return AzureBlob.generateAccountSASQueryParameters(
		{
			startsOn: starts,
			expiresOn: ends,
			permissions: AzureBlob.AccountSASPermissions.parse(permissions),
			services: "bqtf",
			resourceTypes: "sco",
		},
		new AzureBlob.StorageSharedKeyCredential(
			accountDetails.AccountName,
			accountDetails.AccountKey
		)
	).toString();
};