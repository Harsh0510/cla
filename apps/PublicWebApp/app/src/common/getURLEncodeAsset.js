/**
 * Created seperate function for get the EncodeAsset url
 * Used in Work Result/
 * @param {*} asset
 */
export default function getURLEncodeAsset(asset) {
	const title = asset.title.replace(/[^A-Za-z0-9_-]+/g, "-").toLowerCase();
	return asset.pdf_isbn13 + "-" + title;
}
