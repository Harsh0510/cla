const extractGetShareLinksRaw = require("../../core/public/extract-get-share-links");
const Context = require("../common/Context");

let ctx, mockExtractShareResult;

function resetAll() {
	ctx = new Context();
	mockExtractShareResult = [
		{
			oid: "eb1d85eba61f3b2c1fdd72f84e851b7278a3",
			created: "2019-02-27T07:59:02.895Z",
			edited: "2019-02-27T07:59:02.895Z",
			revoked: null,
			user_id: 12,
			title: "unnamed share link",
			teacher: "afa7name ala7name",
		},
	];
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function extractGetShareLinks(data) {
	let err = null;
	try {
		ctx.body = await extractGetShareLinksRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function getParams() {
	return {
		extract_oid: "84c3ab3b25e9a9c988c39b9a3e97a26771b8",
	};
}

test(`Error Unauthorized`, async () => {
	ctx.sessionData = null;
	const params = getParams();
	expect(await extractGetShareLinks(params, ctx)).toEqual(new Error(`401 ::: Unauthorized`));
});

test(`Error when not provided extract_oid`, async () => {
	const params = getParams();
	delete params.extract_oid;
	expect(await extractGetShareLinks(params, ctx)).toEqual(new Error(`400 ::: extract_oid not provided`));
});

test(`Error when provided extract_oid is not a string`, async () => {
	const params = getParams();
	params.extract_oid = 345;
	expect(await extractGetShareLinks(params, ctx)).toEqual(new Error(`400 ::: extract_oid invalid`));
});

test(`Provided valid extract_oid`, async () => {
	const params = getParams();
	ctx.appDbQuery = async function (query) {
		if (query.indexOf("extract_share") !== -1) {
			return { rows: mockExtractShareResult };
		}
		if (query.indexOf("AS can_copy FROM cla_user") !== -1) {
			return {
				rows: [
					{
						can_copy: true,
					},
				],
				rowCount: 1,
			};
		}
		throw new Error("should never get here");
	};

	expect(await extractGetShareLinks(params, ctx)).toBeNull();
	expect(ctx.body).toEqual({
		result: mockExtractShareResult,
	});
});

test(`Provided valid extract_oid with extract_share result as null`, async () => {
	const params = getParams();
	ctx.appDbQuery = async function (query) {
		if (query.indexOf("extract_share") !== -1) {
			return { rows: [] };
		}
		if (query.indexOf("AS can_copy FROM cla_user") !== -1) {
			return {
				rows: [
					{
						can_copy: true,
					},
				],
				rowCount: 1,
			};
		}
		throw new Error("should never get here");
	};

	expect(await extractGetShareLinks(params, ctx)).toBeNull();
	expect(ctx.body).toEqual({
		result: null,
	});
});

test(`Provided valid extract_oid but not get extract.id`, async () => {
	const params = getParams();
	ctx.appDbQuery = async function (query) {
		if (query.indexOf("extract.id") !== -1) {
			return { rows: [] };
		}
		if (query.indexOf("extract_share") !== -1) {
			return { rows: [] };
		}
		if (query.indexOf("AS can_copy FROM cla_user") !== -1) {
			return {
				rows: [
					{
						can_copy: true,
					},
				],
				rowCount: 1,
			};
		}
		throw new Error("should never get here");
	};

	expect(await extractGetShareLinks(params, ctx)).toBeNull();
	expect(ctx.body).toEqual({ result: null });
});

test(`Unexpected SQL error`, async () => {
	const params = getParams();
	ctx.appDbQuery = async function (query) {
		throw new Error("Unknown error");
	};
	expect(await extractGetShareLinks(params, ctx)).toEqual(new Error(`Unknown error`));
});
