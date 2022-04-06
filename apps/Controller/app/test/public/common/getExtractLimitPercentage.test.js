const getExtractLimitPercentageRaw = require("../../../core/public/common/getExtractLimitPercentage");
const Context = require("../../common/Context");
const OLD_ENV = process.env;
let ctx, mockValidISBN, mockResult, mockReturnValue;

let apiResult = {
	success: "success",
	error: "error",
	NoData: "No Data",
};

let querier = async (psqlQuery) => {
	const query = psqlQuery.replace(/[\s\t\n\r]+/g, " ").trim();
	if (query.indexOf("SELECT CASE WHEN asset.can_copy_in_full THEN 100 ELSE COALESCE(publisher.class_extract_limit_percentage") === 0) {
		if (mockResult === apiResult.success) {
			return { rows: [{ class: 100, school: 100 }], rowCount: 1 };
		} else if (mockResult === apiResult.NoData) {
			return { rows: [], rowCount: 0 };
		} else if (mockResult === apiResult.error) {
			throw "Unknown Error";
		}
	}
};

function resetAll() {
	ctx = new Context();
	mockValidISBN = "998765432112";
	mockResult = apiResult.success;
	mockReturnValue = { class: 5, school: 20 };
}
beforeEach(() => {
	jest.resetModules(); // most important - it clears the cache
	process.env = { ...OLD_ENV }; // make a copy
	resetAll();
});

afterEach(() => {
	process.env = OLD_ENV; // restore old env
	resetAll();
});

async function getExtractLimitPercentage(data) {
	let err = null;
	try {
		ctx.body = await getExtractLimitPercentageRaw(querier, data);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Return school extract limit percentage when success`, async () => {
	const data = mockValidISBN;
	mockResult = apiResult.success;
	expect(await getExtractLimitPercentage(data)).toBeNull();
	expect(ctx.body).toEqual({ class: 1, school: 1 });
});

test(`Return school extract limit percentage  when no data found`, async () => {
	const data = mockValidISBN;
	mockResult = apiResult.NoData;
	expect(await getExtractLimitPercentage(data)).toBeNull();
	expect(ctx.body).toEqual({ class: 0.05, school: 0.2 });
});

test(`Return school extract limit percentage as 0 when error`, async () => {
	const data = mockValidISBN;
	mockResult = apiResult.error;
	expect(await getExtractLimitPercentage(data)).toBe("Unknown Error");
	expect(ctx.body).toEqual(null);
});

test(`Return school extract limit percentage when no data found`, async () => {
	process.env.DEFAULT_SCHOOL_EXTRACT_LIMIT_PERCENTAGE = 523;
	process.env.DEFAULT_CLASS_EXTRACT_LIMIT_PERCENTAGE = 222;

	const getExtractLimitPercentageRaw = require("../../../core/public/common/getExtractLimitPercentage");
	async function getExtractLimitPercentage(data) {
		let err = null;
		try {
			ctx.body = await getExtractLimitPercentageRaw(querier, data);
		} catch (e) {
			err = e;
		}
		return err;
	}

	const data = mockValidISBN;
	mockResult = apiResult.NoData;
	expect(await getExtractLimitPercentage(data)).toBeNull();
	expect(ctx.body).toEqual({ class: 1, school: 1 });
});
