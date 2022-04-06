const extractGetFiltersRaw = require("../../core/public/extract-get-filters");
const Context = require("../common/Context");

let ctx;

function resetAll() {
	ctx = new Context();
	ctx.responseStatus = 200;
	ctx.body = null;
}

beforeEach(resetAll);
afterEach(resetAll);

async function extractGetFilters(data) {
	let err = null;
	try {
		ctx.body = await extractGetFiltersRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function getParams() {
	return {};
}

test(`Error when not logged in`, async () => {
	const params = getParams();
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => reject(new Error("failed")));
	expect(await extractGetFilters(params, ctx)).toEqual(new Error("failed"));
});

test(`Error when sql throw exception 'An unexpected error has occurred'`, async () => {
	const params = getParams();
	ctx.doAppQuery = async function (query, values) {
		throw "An unexpected error has occurred";
	};
	expect(await extractGetFilters(params, ctx)).toEqual(new Error("500 ::: An unexpected error has occurred"));
});

test(`Return without any row found`, async () => {
	const params = getParams();
	ctx.doAppQuery = async function (query, values) {
		return { rows: [] };
	};
	expect(await extractGetFilters(params, ctx)).toEqual(null);
});

test(`Success! even if you have not passed 'exam_board' value`, async () => {
	const params = getParams();
	ctx.doAppQuery = async function (query, values) {
		return {
			rows: [
				{ id: 356, title: "Biology" },
				{ id: 422, title: "Demo" },
			],
		};
	};
	expect(await extractGetFilters(params)).toBe(null);
	expect(ctx.body).toEqual({
		result: [
			{
				id: "class",
				title: "class",
				data: [
					{ id: 356, title: "Biology" },
					{ id: 422, title: "Demo" },
				],
			},
		],
	});
});
