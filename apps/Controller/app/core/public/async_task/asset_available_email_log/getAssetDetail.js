const { getURLEncodeAsset } = require("./misc");
const getUrl = require("../../../../common/getUrl");
const getAssetCitationText = require("./getAssetCitationText");

module.exports = function (asset) {
	const assetUrl = getUrl(`/works/${getURLEncodeAsset(asset.title, asset.pdf_isbn13)}`);
	const assetCitationText = getAssetCitationText(asset.title, asset.authors, asset.edition, asset.publisher, asset.publication_date);
	return { assetUrl: assetUrl, assetCitation: assetCitationText, pdf_isbn13: asset.pdf_isbn13 };
};
