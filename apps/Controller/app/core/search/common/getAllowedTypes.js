/**
 * Used for get-filters and asset-search endpoints
 */
const allowedFilterTypes = Object.create(null);
allowedFilterTypes.format = true;
allowedFilterTypes.language = true;
allowedFilterTypes.exam = true;
allowedFilterTypes.exam_board = true;
allowedFilterTypes.educational_year_group = true;
allowedFilterTypes.key_stage = true;
allowedFilterTypes.level = true;
allowedFilterTypes.scottish_level = true;
allowedFilterTypes.collection = true;
allowedFilterTypes.publisher = true;

const niceLanguagesMap = Object.create(null);
niceLanguagesMap.eng = "English";
niceLanguagesMap.wel = "Cymraeg/Welsh";
niceLanguagesMap.cym = niceLanguagesMap.wel;

module.exports = {
	filterTypes: allowedFilterTypes,
	niceLanguagesMap: niceLanguagesMap,
};
