//send an alert when MIN_HIGHEST_RATIO value reached
const MIN_HIGHEST_RATIO = 10;

/**
 * getSchoolExtractRatio
 * @param {*} pageCountExtractedForSchool
 * @param {*} allowed_extract_count
 */
const getSchoolExtractRatio = function (pageCountExtractedForSchool, allowed_extract_count, SchoolPercentageRatio) {
	const usagePercentage = Math.ceil((pageCountExtractedForSchool * SchoolPercentageRatio * 100) / allowed_extract_count);
	if (usagePercentage < 10) {
		return 0;
	}
	return Math.floor(usagePercentage / 5) * 5;
};

module.exports = {
	MIN_HIGHEST_RATIO,
	getSchoolExtractRatio,
};
