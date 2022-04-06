const getAssetDetail = require("./getAssetDetail");

module.exports = function (userAssetData = []) {
	const list = [];
	for (const userAsset of userAssetData) {
		const assetData = getAssetDetail(userAsset);
		list.push(`<li><a href="${assetData.assetUrl}" target="_blank" title="${userAsset.title}">${assetData.assetCitation}</a></li>`);
	}
	return list;
};
