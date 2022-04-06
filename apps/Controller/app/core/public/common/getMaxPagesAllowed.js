module.exports = function (assetPageCount, allowedExtractRatio) {
	return Math.ceil(assetPageCount * allowedExtractRatio);
};
