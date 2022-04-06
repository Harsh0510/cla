const assetProcessingLogExportRaw = require("../../core/admin/asset-processing-log-get-export");
const Context = require("../common/Context");
let ctx;

/**
 * Reset function - called before each test.
 */
function resetAll() {
	ctx = new Context();
	data = {
		query: "book",
		filter: {
			high_priority: [true, false],
			stage: ["stage1", "stage2"],
			success: [true, false],
			date_created_begin: 1624473000,
			date_created_end: 1634581800,
		},
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

async function assetProcessingLogExport(data) {
	let err = null;
	try {
		ctx.body = await assetProcessingLogExportRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test("When user is not logged in", async () => {
	ctx.sessionData.user_role = null;
	expect(await assetProcessingLogExport(data)).toEqual(new Error("401 ::: Unauthorized"));
	expect(ctx.body).toBeNull();
});

test("When user is not an admin", async () => {
	ctx.sessionData.user_role = "teacher";
	expect(await assetProcessingLogExport(data)).toEqual(new Error("401 ::: Unauthorized"));
	expect(ctx.body).toBeNull();
});

test(`Success when user pass filters as blank`, async () => {
	data.filter = {
		high_priority: [],
		stage: [],
		success: [],
	};
	ctx.sessionData.user_role = "cla-admin";
	ctx.doAppQuery = (query, values) => {
		if (query.includes("ORDER BY")) {
			return { rows: [{ id: 1, success: true }] };
		}
	};
	expect(await assetProcessingLogExport(data)).toBeNull();
	expect(ctx.body).toEqual({ data: [{ id: 1, success: true }] });
});

test(`Success when user pass query params null`, async () => {
	data.query = null;
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
	expect(await assetProcessingLogExport(data)).toBeNull();
	expect(ctx.body).toEqual({
		data: processingLogResults,
	});
});

test(`Success when user pass query params string`, async () => {
	data.query = "gg";
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
	expect(await assetProcessingLogExport(data)).toBeNull();
	expect(ctx.body).toEqual({
		data: processingLogResults,
	});
});

test(`Error when user pass wrong query params`, async () => {
	data.query = 123;
	expect(await assetProcessingLogExport(data, ctx)).toEqual(new Error(`400 ::: Query invalid`));
});

test(`Success when user pass filters with success`, async () => {
	data.filter = {
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
	expect(await assetProcessingLogExport(data)).toBeNull();
	expect(ctx.body).toEqual({ data: [{ id: 1, success: true }] });
});

test(`Error when user pass invalid filter params`, async () => {
	data.filter = [];
	expect(await assetProcessingLogExport(data)).toEqual(new Error("400 ::: Invalid filter provided"));

	data.filter = "ABC";
	expect(await assetProcessingLogExport(data)).toEqual(new Error("400 ::: Invalid filter provided"));
	expect(ctx.body).toBeNull();
});

test(`Error when invalid begin date is provided`, async () => {
	data.filter.date_created_begin = [];
	expect(await assetProcessingLogExport(data)).toEqual(new Error("400 ::: Date created (from) invalid"));
	expect(ctx.body).toBeNull();
});

test(`Error when invalid begin date is provided`, async () => {
	data.filter.date_created_end = [];
	expect(await assetProcessingLogExport(data)).toEqual(new Error("400 ::: Date created (to) invalid"));
	expect(ctx.body).toBeNull();
});

test(`Success when user pass filters with high_priority`, async () => {
	data.filter = {
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
	expect(await assetProcessingLogExport(data)).toBeNull();
	expect(ctx.body).toEqual({ data: [{ id: 1, success: true }] });
});

test(`Success when user not pass filters`, async () => {
	delete data.filter;
	ctx.sessionData.user_role = "cla-admin";

	ctx.doAppQuery = (query, values) => {
		if (query.includes("_count_")) {
			return { rows: [{ _count_: 1 }] };
		}
		if (query.includes("ORDER BY")) {
			return { rows: [{ id: 1, success: true }] };
		}
	};
	expect(await assetProcessingLogExport(data)).toBeNull();
	expect(ctx.body).toEqual({ data: [{ id: 1, success: true }] });
});
