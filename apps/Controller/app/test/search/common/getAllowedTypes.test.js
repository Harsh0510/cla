const getAllowedTypes = require("../../../core/search/common/getAllowedTypes");

/** renders correctly with object only */
test("renders correctly with object only", async () => {
	const item = Object.prototype.toString.call(getAllowedTypes).slice(8, -1) === "Object" ? true : false;
	expect(item).toBe(true);
});

/** Count Object size */
test("Count Object size", async () => {
	var item = Object.keys(getAllowedTypes);
	expect(item.length).toBe(2);
});

/** returns Object correctly */
test("returns Object correctly", async () => {
	var item = getAllowedTypes;
	expect(item).toEqual({
		filterTypes: {
			collection: true,
			educational_year_group: true,
			exam: true,
			exam_board: true,
			format: true,
			key_stage: true,
			language: true,
			level: true,
			publisher: true,
			scottish_level: true,
		},
		niceLanguagesMap: {
			cym: "Cymraeg/Welsh",
			eng: "English",
			wel: "Cymraeg/Welsh",
		},
	});
});
