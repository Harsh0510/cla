const getQueryForAssetProcessingLogGetAllRaw = require("../../common/getQueryForAssetProcessingLogGetAll");
const Context = require("../common/Context");
let ctx;

/**
 * Reset function - called before each test.
 */
function resetAll() {
	ctx = new Context();
	query = "book";
	filter = {
		high_priority: [true, false],
		stage: ["stage1", "stage2"],
		success: [true, false],
		date_created_begin: 1624473000,
		date_created_end: 1634581800,
	};
	processingLogResults = [
		{
			asset_identifier: "A311138111",
			content: "National Geographic Primary Readers is a high-interest series of beginning reading books that have been developed in consultation",
			date_created: "2021-02-18T06:13:32.326Z",
			high_priority: false,
			id: 4,
			stage: "stage2",
			sub_stage: "stage2.1",
			success: false,
		},
	];
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function getQueryForAssetProcessingLogGetAll(filter, query) {
	let err = null;
	try {
		ctx.body = await getQueryForAssetProcessingLogGetAllRaw(ctx, filter, query);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Success when user pass filters as blank`, async () => {
	filter = {
		high_priority: [],
		stage: [],
		success: [],
	};
	ctx.doAppQuery = (query, values) => {
		if (query.includes("ORDER BY")) {
			return { rows: [{ id: 1, success: true }] };
		}
	};
	expect(await getQueryForAssetProcessingLogGetAll(filter, query)).toBeNull();
	expect(ctx.body).toEqual({
		queryBinds: ["book"],
		whereClauses: "WHERE (asset_processing_log.high_priority = TRUE) AND (asset_processing_log.keywords @@ plainto_tsquery($1))",
	});
});

test(`Success when user pass query params null`, async () => {
	query = null;
	ctx.appDbQuery = async function (query, values) {
		if (query.indexOf("COUNT(*)") !== -1) {
			return { rows: [{ _count_: 1 }] };
		}
		if (query.indexOf("ORDER BY") !== -1) {
			return {
				rows: processingLogResults,
			};
		}
	};
	expect(await getQueryForAssetProcessingLogGetAll(filter, query)).toBeNull();
	expect(ctx.body).toEqual({
		queryBinds: ["stage1", "stage2"],
		whereClauses:
			"WHERE (asset_processing_log.high_priority = TRUE) AND (asset_processing_log.stage IN ($1, $2)) AND ( asset_processing_log.success IN (true, false)) AND (asset_processing_log.date_created >= TO_TIMESTAMP(1624473000)) AND (asset_processing_log.date_created <= TO_TIMESTAMP(1634581800))",
	});
});

test(`Success when user pass query params string`, async () => {
	query = "gg";
	ctx.appDbQuery = async function (query, values) {
		if (query.indexOf("COUNT(*)") !== -1) {
			return { rows: [{ _count_: 1 }] };
		}
		if (query.indexOf("ORDER BY") !== -1) {
			return {
				rows: processingLogResults,
			};
		}
	};
	expect(await getQueryForAssetProcessingLogGetAll(filter, query)).toBeNull();
	expect(ctx.body).toEqual({
		queryBinds: ["stage1", "stage2", "gg"],
		whereClauses:
			"WHERE (asset_processing_log.high_priority = TRUE) AND (asset_processing_log.stage IN ($1, $2)) AND ( asset_processing_log.success IN (true, false)) AND (asset_processing_log.date_created >= TO_TIMESTAMP(1624473000)) AND (asset_processing_log.date_created <= TO_TIMESTAMP(1634581800)) AND (asset_processing_log.keywords @@ plainto_tsquery($3))",
	});
});

test(`Error when user pass wrong query params`, async () => {
	query = 123;
	expect(await getQueryForAssetProcessingLogGetAll(filter, query, ctx)).toEqual(new Error(`400 ::: Query invalid`));
});

test(`Success when user pass filters with success`, async () => {
	filter = {
		success: [true, false],
	};
	ctx.sessionData.user_role = "cla-admin";

	ctx.doAppQuery = (query, values) => {
		if (query.includes("_count_")) {
			return { rows: [{ _count_: 1 }] };
		}
		if (query.includes("ORDER BY")) {
			return { rows: [{ id: 1, success: true }] };
		}
	};
	expect(await getQueryForAssetProcessingLogGetAll(filter, query)).toBeNull();
	expect(ctx.body).toEqual({
		queryBinds: ["book"],
		whereClauses:
			"WHERE (asset_processing_log.high_priority = TRUE) AND ( asset_processing_log.success IN (true, false)) AND (asset_processing_log.keywords @@ plainto_tsquery($1))",
	});
});

test(`Error when user pass invalid filter params`, async () => {
	filter = [];
	expect(await getQueryForAssetProcessingLogGetAll(filter, query)).toEqual(new Error("400 ::: Invalid filter provided"));

	filter = "ABC";
	expect(await getQueryForAssetProcessingLogGetAll(filter, query)).toEqual(new Error("400 ::: Invalid filter provided"));
	expect(ctx.body).toBeNull();
});

test(`Error when invalid begin date is provided`, async () => {
	filter.date_created_begin = [];
	expect(await getQueryForAssetProcessingLogGetAll(filter, query)).toEqual(new Error("400 ::: Date created (from) invalid"));
	expect(ctx.body).toBeNull();
});

test(`Error when invalid begin date is provided`, async () => {
	filter.date_created_end = [];
	expect(await getQueryForAssetProcessingLogGetAll(filter, query)).toEqual(new Error("400 ::: Date created (to) invalid"));
	expect(ctx.body).toBeNull();
});

test(`Success when user pass filters with high_priority`, async () => {
	filter = {
		high_priority: [true, false],
	};
	ctx.sessionData.user_role = "cla-admin";

	ctx.doAppQuery = (query, values) => {
		if (query.includes("_count_")) {
			return { rows: [{ _count_: 1 }] };
		}
		if (query.includes("ORDER BY")) {
			return { rows: [{ id: 1, success: true }] };
		}
	};
	expect(await getQueryForAssetProcessingLogGetAll(filter, query)).toBeNull();
	expect(ctx.body).toEqual({
		queryBinds: ["book"],
		whereClauses: "WHERE (asset_processing_log.high_priority = TRUE) AND (asset_processing_log.keywords @@ plainto_tsquery($1))",
	});
});

test(`Success when user not pass filters`, async () => {
	ctx.sessionData.user_role = "cla-admin";

	ctx.doAppQuery = (query, values) => {
		if (query.includes("_count_")) {
			return { rows: [{ _count_: 1 }] };
		}
		if (query.includes("ORDER BY")) {
			return { rows: [{ id: 1, success: true }] };
		}
	};
	expect(await getQueryForAssetProcessingLogGetAll(null, query)).toBeNull();
	expect(ctx.body).toEqual({
		queryBinds: ["book"],
		whereClauses: "WHERE (asset_processing_log.high_priority = TRUE) AND (asset_processing_log.keywords @@ plainto_tsquery($1))",
	});
});
