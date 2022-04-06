const assetProcessinglogInsertRaw = require("../../core/public/asset-processing-log-insert");

let ctx;

async function getDbQuery(query, values) {
	query = query.replace(/\s+/g, " ");
	if (query.indexOf("INSERT INTO asset_processing_log") !== -1) {
		return;
	}
	throw new Error("should not be here");
}

function resetAll() {
	ctx = {
		assert(expr, status, msg) {
			if (expr) {
				return;
			}
			ctx.responseStatus = status;
			throw new Error(`${status} ::: ${msg}`);
		},
		throw(status, msg) {
			ctx.responseStatus = status;
			throw new Error(`${status} ::: ${msg}`);
		},
		async ensureLoggedIn() {
			return true;
		},
		async appDbQuery(a, b) {
			return await getDbQuery(a, b);
		},
		responseStatus: 200,
	};
}

async function assetProcessinglogInsert(data) {
	let err = null;
	try {
		ctx.body = await assetProcessinglogInsertRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function getGoodParams() {
	return [
		{
			date_created: 123456789,
			session_identifier: "session_identifier1",
			session_index: 1,
			stage: "stage1",
			sub_stage: "sub_stage1",
			asset_identifier: "asset_identifier1",
			high_priority: true,
			success: true,
		},
	];
}
beforeEach(resetAll);
afterEach(resetAll);

test(`Error when invalid params provided`, async () => {
	const params = {
		items: {
			date_created: 123456789,
			session_identifier: "session_identifier1",
			session_index: 1,
			stage: "stage1",
			sub_stage: "sub_stage1",
			asset_identifier: "asset_identifier1",
			high_priority: true,
			success: true,
		},
	};
	expect(await assetProcessinglogInsert(params)).toEqual(new Error("400 ::: items not provided"));
});

test(`Error when params empty array provided`, async () => {
	const params = {
		items: [],
	};
	expect(await assetProcessinglogInsert(params)).toEqual(new Error("400 ::: items.length > 0"));
});

test("Success when valid params provided", async () => {
	const params = {
		items: getGoodParams(),
	};
	expect(await assetProcessinglogInsert(params)).toEqual(null);
	expect(ctx.body).toEqual({});
});

test("Success when session_index is not provided integer value", async () => {
	const data = getGoodParams();
	data[0].session_index = null;
	const params = {
		items: data,
	};
	expect(await assetProcessinglogInsert(params)).toEqual(null);
	expect(ctx.body).toEqual({});
});

test("Success when success is not provided boolean value", async () => {
	const data = getGoodParams();
	data[0].success = "test";
	const params = {
		items: data,
	};
	expect(await assetProcessinglogInsert(params)).toEqual(null);
	expect(ctx.body).toEqual({});
});
