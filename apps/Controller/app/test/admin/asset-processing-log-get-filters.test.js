const AssetProcessingLogGetFiltersRaw = require("../../core/admin/asset-processing-log-get-filters");
const Context = require("../common/Context");

async function getGoodAmmDbQuery(query, values) {
	query = query.replace(/\s+/g, " ");
	if (query.indexOf(`SELECT stage As id, stage AS title`) !== -1) {
		return { rows: [{ id: "stage1", title: "stage1" }] };
	}
	return;
}

function resetAll() {
	ctx = new Context();
	data = null;
	ctx.appDbQuery = async function (query, values) {
		return await getGoodAmmDbQuery(query, values);
	};
	ctx.getUserRole = async (_) => {
		return "cla-admin";
	};
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

const result = {
	result: [
		{
			id: "success",
			title: "Success",
			data: [
				{
					id: true,
					title: "true",
				},
				{
					id: false,
					title: "false",
				},
			],
		},
		{ id: "stage", title: "Stage", data: [{ id: "stage1", title: "stage1" }] },
	],
};

async function AssetProcessingLogGetFilters(data) {
	let err = null;
	try {
		ctx.body = await AssetProcessingLogGetFiltersRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Error when user not logged in`, async () => {
	ctx.sessionData = null;
	expect(await AssetProcessingLogGetFilters(data)).toEqual(new Error("401 ::: Unauthorized"));
});

test(`Error when user role as school-admin`, async () => {
	ctx.getUserRole = async (_) => {
		return "school-admin";
	};
	expect(await AssetProcessingLogGetFilters(data)).toEqual(new Error("401 ::: Unauthorized"));
	expect(ctx.body).toEqual(null);
});

test(`Success when user role as cla-admin`, async () => {
	expect(await AssetProcessingLogGetFilters(data)).toEqual(null);
	expect(ctx.body).toEqual(result);
});
