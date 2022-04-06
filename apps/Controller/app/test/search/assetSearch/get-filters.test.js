const assetGetFiltersRaw = require("../../../core/search/assetSearch/get-filters.js");
const Context = require("../../common/Context");

let ctx;
const mock_QueryResultData = {
	resultThirdLevelSubjects: [
		{ id: "ABC", title: "Parent Subject 1" },
		{ id: "DEF", title: "Parent Subject 2" },
	],
	resultFourthLevelSubjects: [
		{ id: "ABCD", title: "Child Subject 1" },
		{ id: "DEFG", title: "Child Subject 2" },
	],
	resultLevel: [
		{ type: "level", value: "primary" },
		{ type: "level", value: "secondary" },
	],
	resultExam: [
		{ type: "exam", value: "A Level" },
		{ type: "exam", value: "AS Level" },
	],
	resultExamBoard: [
		{ type: "exam_board", value: "AQA" },
		{ type: "exam_board", value: "Edexcel" },
	],
	resultKeyStage: [
		{ type: "key_stage", value: "KS0" },
		{ type: "key_stage", value: "KS1" },
	],
	resultPublisher: [
		{ type: "publisher", value: "Bloomsbury Publishing" },
		{ type: "publisher", value: "Cambridge University Press" },
	],
	resultContentFrom: [
		{ type: "format", value: "BO" },
		{ type: "format", value: "MI" },
	],
	resultCollection: [{ value: "collection 1" }, { value: "Collection 2" }],
	resultScottishLevel: [{ value: "level" }, { value: "scottish level" }],

	resultLanguage: [{ value: "eng" }, { value: "wel" }],
};

function resetAll() {
	ctx = new Context();
	ctx.appDbQuery = async function (query, values) {
		query = query.trim().replace(/\s+/g, " ");
		if (query.indexOf("third_level_subject.code AS id,") !== -1) {
			return { rows: mock_QueryResultData.resultThirdLevelSubjects };
		}
		if (query.indexOf("fourth_level_subject.code AS id,") !== -1) {
			return { rows: mock_QueryResultData.resultFourthLevelSubjects };
		}
		if (query.indexOf("af_level.level AS value FROM asset") !== -1) {
			return { rows: mock_QueryResultData.resultLevel };
		}
		if (query.indexOf("af_exam.exam AS value FROM asset") !== -1) {
			return { rows: mock_QueryResultData.resultExam };
		}
		if (query.indexOf("af_exam_board.exam_board AS value FROM asset") !== -1) {
			return { rows: mock_QueryResultData.resultExamBoard };
		}
		if (query.indexOf("af_language.language AS value FROM asset") !== -1) {
			return { rows: mock_QueryResultData.resultLanguage };
		}
		if (query.indexOf("af_key_stage.key_stage AS value FROM asset") !== -1) {
			return { rows: mock_QueryResultData.resultKeyStage };
		}
		if (query.indexOf("asset.publisher_name_log AS value FROM asset") !== -1) {
			return { rows: mock_QueryResultData.resultKeyStage };
		}
		if (query.indexOf("content_form AS value FROM asset") !== -1) {
			return { rows: mock_QueryResultData.resultContentFrom };
		}
		if (query.indexOf("af_collection.collection AS value") !== -1) {
			return { rows: mock_QueryResultData.resultCollection };
		}
		if (query.indexOf("af_scottish_level.scottish_level AS value") !== -1) {
			return { rows: mock_QueryResultData.resultScottishLevel };
		}
	};
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function assetGetFilters(data) {
	let err = null;
	try {
		ctx.body = await assetGetFiltersRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function getParams() {
	return {
		filter: {
			subject: ["YND", "YNDS"],
			exam: ["A Level"],
			exam_board: ["Edexcel", "AQA"],
			key_stage: ["KS0"],
			level: ["primary"],
			publisher: ["Bloomsbury Publishing"],
			format: ["MI"],
		},
	};
}

test(`Success when user with cla-admin`, async () => {
	ctx.sessionData.user_role = "cla-admin";

	expect(await assetGetFilters({}, ctx)).toBeNull();
	expect(ctx.body).not.toEqual(null);
});

test(`Success when subject data not found`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	(mock_QueryResultData.resultThirdLevelSubjects = []), expect(await assetGetFilters({}, ctx)).toBeNull();
	expect(ctx.body).not.toEqual(null);
});
