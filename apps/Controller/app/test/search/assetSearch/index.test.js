const assetSearchRaw = require("../../../core/search/assetSearch/index.js");
const Context = require("../../common/Context");

let ctx;
const mock_QueryResultData = {
	resultThirdLevelSubjects: [
		{ id: "ABC", title: "Parent Subject 1", count: 1 },
		{ id: "DEF", title: "Parent Subject 2", count: 1 },
	],
	resultFourthLevelSubjects: [
		{ id: "ABCD", title: "Child Subject 1", count: 2 },
		{ id: "DEFG", title: "Child Subject 2", count: 2 },
	],
	resultLevel: [
		{ type: "level", value: "primary", count: "2" },
		{ type: "level", value: "secondary", count: "2" },
	],
	resultExam: [
		{ type: "exam", value: "A Level", count: "2" },
		{ type: "exam", value: "AS Level", count: "2" },
	],
	resultExamBoard: [
		{ type: "exam_board", value: "AQA", count: "2" },
		{ type: "exam_board", value: "Edexcel", count: "2" },
	],
	resultKeyStage: [
		{ type: "key_stage", value: "KS0", count: "2" },
		{ type: "key_stage", value: "KS1", count: "2" },
	],
	resultPublisher: [
		{ type: "publisher", value: "Bloomsbury Publishing", count: "2" },
		{ type: "publisher", value: "Cambridge University Press", count: "2" },
	],
	resultContentFrom: [
		{ type: "format", value: "BO", count: "20" },
		{ type: "format", value: "MI", count: "2" },
	],
	resultLanguage: [
		{ value: "eng", count: 2 },
		{ value: "wel", count: 5 },
	],
	resultCollection: [
		{ value: "test", count: 2 },
		{ value: "collection", count: 5 },
	],
	resultScottishValue: [
		{ value: "test1", count: 2 },
		{ value: "test2", count: 5 },
	],
	resultExtract: [{ title: "test", page_range: [1, 2], oid: "eda1c0f1ca33f9554f46aaefc84914776042" }],
	count: 5,
	count_unlockbooks: 5,
	count_allcopies: 5,
	count_mycopies: 5,
	count_allExtracts: 5,
};

function resetAll() {
	ctx = new Context();
	ctx.appDbQuery = async function (query, values) {
		query = query.trim().replace(/\s+/g, " ");
		if (query.indexOf("COUNT(DISTINCT asset.id) AS _count_") !== -1) {
			return { rows: [{ _count_: mock_QueryResultData.count }] };
		}
		if (query.indexOf("FROM ( SELECT DISTINCT ON (asset.id)") !== -1) {
			return { rows: [] };
		}
		if (query.indexOf("COUNT(DISTINCT asset.id) AS count_unlockbooks") !== -1) {
			return { rows: [{ count_unlockbooks: mock_QueryResultData.count_unlockbooks }] };
		}
		if (query.indexOf("COUNT(DISTINCT asset.id) AS count_allcopies") !== -1) {
			return { rows: [{ count_allcopies: mock_QueryResultData.count_allcopies }] };
		}
		if (query.indexOf("COUNT(DISTINCT asset.id) AS count_mycopies") !== -1) {
			return { rows: [{ count_mycopies: mock_QueryResultData.count_mycopies }] };
		}
		if (query.indexOf("COUNT(DISTINCT asset.id) AS count_all") !== -1) {
			return { rows: [{ count_all: mock_QueryResultData.count_all }] };
		}
		if (query.indexOf("third_level_subject.code AS id,") !== -1) {
			return { rows: mock_QueryResultData.resultThirdLevelSubjects };
		}
		if (query.indexOf("fourth_level_subject.code AS id,") !== -1) {
			return { rows: mock_QueryResultData.resultFourthLevelSubjects };
		}
		if (query.indexOf("af_level.level AS value, COUNT(DISTINCT asset.id) AS count") !== -1) {
			return { rows: mock_QueryResultData.resultLevel };
		}
		if (query.indexOf("af_exam.exam AS value, COUNT(DISTINCT asset.id) AS count") !== -1) {
			return { rows: mock_QueryResultData.resultExam };
		}
		if (query.indexOf("af_exam_board.exam_board AS value, COUNT(DISTINCT asset.id) AS count") !== -1) {
			return { rows: mock_QueryResultData.resultExamBoard };
		}
		if (query.indexOf("af_language.language AS value, COUNT(DISTINCT asset.id) AS count") !== -1) {
			return { rows: mock_QueryResultData.resultLanguage };
		}
		if (query.indexOf("af_key_stage.key_stage AS value, COUNT(DISTINCT asset.id) AS count") !== -1) {
			return { rows: mock_QueryResultData.resultKeyStage };
		}
		if (query.indexOf("asset.publisher_name_log AS value, COUNT(DISTINCT asset.id) AS count") !== -1) {
			return { rows: mock_QueryResultData.resultKeyStage };
		}
		if (query.indexOf("content_form AS value, COUNT(DISTINCT asset.id) AS count") !== -1) {
			return { rows: mock_QueryResultData.resultContentFrom };
		}
		if (query.indexOf("SELECT af_collection.collection AS value") !== -1) {
			return { rows: mock_QueryResultData.resultCollection };
		}
		if (query.indexOf("SELECT af_scottish_level.scottish_level AS value,") !== -1) {
			return { rows: mock_QueryResultData.resultScottishValue };
		}
		if (query.indexOf("FROM asset_user_upload") !== -1) {
			return { rows: mock_QueryResultData.resultExtract };
		}
		if (query.indexOf("COUNT(DISTINCT asset.id) AS count_allextracts") !== -1) {
			return { rows: [{ count_all: mock_QueryResultData.count_allExtracts }] };
		}
	};
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function assetSearch(data) {
	let err = null;
	try {
		ctx.body = await assetSearchRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function getParams() {
	return {
		offset: 30,
		limit: 10,
		query: "john smith",
		filter: {
			misc: [],
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

test(`Error when provided query is not a string`, async () => {
	const params = getParams();
	params.query = 345;
	expect(await assetSearch(params, ctx)).toEqual(new Error(`400 ::: Query invalid`));
});

test(`Error when offset not provided`, async () => {
	const params = getParams();
	delete params.offset;
	expect(await assetSearch(params, ctx)).toEqual(new Error(`400 ::: Offset invalid`));
});

test(`Error when provided offset is not a non-negative integer`, async () => {
	const params = getParams();
	params.offset = 34.5;
	expect(await assetSearch(params, ctx)).toEqual(new Error(`400 ::: Offset must be an integer`));
});

test(`Error when provided offset is -1`, async () => {
	const params = getParams();
	params.offset = -1;
	expect(await assetSearch(params, ctx)).toEqual(new Error(`400 ::: Offset must not be negative`));
});

test(`Error when provided offset is 'test'`, async () => {
	const params = getParams();
	params.offset = "test";
	expect(await assetSearch(params, ctx)).toEqual(new Error(`400 ::: Offset invalid`));
});

test(`Error when limit not provided`, async () => {
	const params = getParams();
	delete params.limit;
	expect(await assetSearch(params, ctx)).toEqual(new Error(`400 ::: Valid limit not provided`));
});

test(`Error when provided limit is 0`, async () => {
	const params = getParams();
	params.limit = 0;
	expect(await assetSearch(params, ctx)).toEqual(new Error(`400 ::: Valid limit not provided`));
});

test(`Error when provided limit is -1`, async () => {
	const params = getParams();
	params.limit = -1;
	expect(await assetSearch(params, ctx)).toEqual(new Error(`400 ::: Valid limit not provided`));
});

test(`Error when provided limit is too high`, async () => {
	const params = getParams();
	params.limit = 500;
	expect(await assetSearch(params, ctx)).toEqual(new Error(`400 ::: Valid limit not provided`));
});

test(`Error when provided limit is "S2"`, async () => {
	const params = getParams();
	params.limit = "s2";
	expect(await assetSearch(params, ctx)).toEqual(new Error(`400 ::: Valid limit not provided`));
});

test(`Error when provided limit is not an integer`, async () => {
	const params = getParams();
	params.limit = 45.5;
	expect(await assetSearch(params, ctx)).toEqual(new Error(`400 ::: Valid limit not provided`));
});

test(`Search with no results should return empty array`, async () => {
	const params = getParams();
	ctx.sessionData = { user_id: 5 };
	mock_QueryResultData.resultExtract = [];
	expect(await assetSearch(params, ctx)).toBeNull();
	expect(ctx.body).not.toBeNull();
});

test(`Successful query with results for viewer`, async () => {
	ctx.sessionData = null;
	const params = getParams();
	params.filter = null;
	expect(await assetSearch(params, ctx)).toBeNull();
	expect(ctx.body).not.toBeNull();
});

test(`Successful query with results should return those results with filter misc mycopies`, async () => {
	const params = getParams();
	delete params.query;
	params.filter = { misc: ["my_copies"], subject: ["YND", "YNDS", "YND23", "YNDS@123"] };
	ctx.getSessionData = async function () {
		return { user_id: 5 };
	};
	expect(await assetSearch(params, ctx)).toBeNull();
	expect(ctx.body).not.toBeNull();
});

test(`Error when pass filter key as invalid (not include misc and subject)`, async () => {
	const params = getParams();
	params.filter = { misc0: null, subject0: ["Y", "R"], subject1: ["Y", "R"] }; // ,misc1: ["my_school_library"],
	ctx.appDbQuery = async function (query) {
		if (query.indexOf("_count_") !== -1) {
			throw new Error("undefined");
		}
		if (query.indexOf("ORDER BY") !== -1) {
			throw new Error('Cannot read property "rows" of undefined');
		}
		throw new Error("should never get here");
	};
	expect(await assetSearch(params, ctx)).toEqual(new Error(`400 ::: undefined`));
});

test(`Successful query with results for viewer`, async () => {
	ctx.sessionData = null;
	const params = getParams();
	params.filter = null;
	expect(await assetSearch(params, ctx)).toBeNull();
	expect(ctx.body).not.toBeNull();
});

test(`Successful results search with some filter data`, async () => {
	const params = getParams();
	delete params.filter, params.query;

	ctx.getSessionData = async function () {
		return { user_id: 5 };
	};
	expect(await assetSearch(params, ctx)).toBeNull();
	expect(ctx.body).not.toBeNull();
	expect(ctx.body.resultFilter.length).toEqual(11);
});

test(`Successful results search with asset filter subject as invalid`, async () => {
	const params = getParams();
	params.filter.subject = ["ABC123", "AB!@", "@123"];

	ctx.getSessionData = async function () {
		return { user_id: 5 };
	};
	expect(await assetSearch(params, ctx)).toBeNull();
	expect(ctx.body).not.toBeNull();
	expect(ctx.body.resultFilter.length).toEqual(11);
});

test(`Successful results search with no asset other filter data`, async () => {
	const params = getParams();
	delete params.filter, params.query;

	ctx.getSessionData = async function () {
		return { user_id: 5 };
	};

	expect(await assetSearch(params, ctx)).toBeNull();
	expect(ctx.body).not.toBeNull();
	expect(ctx.body.resultFilter.length).toEqual(11);
});

test(`When there is no results found then return unfilter count 0`, async () => {
	mock_QueryResultData.count = 0;
	const params = getParams();
	ctx.getSessionData = async function () {
		return { user_id: 5 };
	};
	expect(await assetSearch(params, ctx)).toBeNull();
	expect(ctx.body).not.toBeNull();
});

test(`Successful query with results should return those results with filter misc all copies`, async () => {
	const params = getParams();
	delete params.query;
	params.filter = { misc: ["all_copies"], subject: ["YND", "YNDS", "YND23", "YNDS@123"] };
	ctx.getSessionData = async function () {
		return { user_id: 5 };
	};
	expect(await assetSearch(params, ctx)).toBeNull();
	expect(ctx.body).not.toBeNull();
});

test(`Successful query with results should return those results with filter misc unlock books`, async () => {
	const params = getParams();
	delete params.query;
	params.filter = { misc: ["unlock_books"], subject: ["YND", "YNDS", "YND23", "YNDS@123"] };
	ctx.getSessionData = async function () {
		return { user_id: 5 };
	};
	expect(await assetSearch(params, ctx)).toBeNull();
	expect(ctx.body).not.toBeNull();
});

test(`Successful query with results should return those results with filter misc all_extracts`, async () => {
	const params = getParams();
	delete params.query;
	params.filter = { misc: ["all_extracts"], subject: ["YND", "YNDS", "YND23", "YNDS@123"] };
	ctx.getSessionData = async function () {
		return { user_id: 5 };
	};
	expect(await assetSearch(params, ctx)).toBeNull();
	expect(ctx.body).not.toBeNull();
});
