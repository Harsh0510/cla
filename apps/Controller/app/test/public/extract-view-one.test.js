const extractViewOneRaw = require("../../core/public/extract-view-one");
const Context = require("../common/Context");

let ctx, mockGenerateExtractViewUrlsWrap;
const nextMonthDate = new Date();
nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);

jest.mock(`../../core/public/common/generateExtractViewUrlsWrap`, () => {
	return function () {
		return mockGenerateExtractViewUrlsWrap;
	};
});

const getCanCopyResult = (query) => {
	if (query.indexOf("AS can_copy FROM cla_user") >= 0) {
		return {
			rows: [
				{
					can_copy: true,
				},
			],
			rowCount: 1,
		};
	}
	return null;
};

async function getGoodAmmDbQuery(query, values) {
	const cc = getCanCopyResult(query);
	if (cc) {
		return cc;
	}
	return {
		rows: [
			{
				work_isbn13: "1234561234561",
				pages: [4, 7, 9],
				date_expired: nextMonthDate,
				extract_status: "editable",
			},
		],
	};
}

async function getGoodAmmDbQuery_Viewers(query, values) {
	return {
		rows: [
			{
				work_isbn13: "1234561234561",
				pages: [4, 7, 9],
				date_expired: nextMonthDate,
			},
		],
	};
}

async function getBadAmmDbQuery_Viewers(query, values) {
	return {
		rows: [
			{
				work_isbn13: "1234561234561",
				pages: [4, 7, 9],
				date_expired: new Date("2019-01-10 10:28:15"),
			},
		],
	};
}

async function defaultGenerateExtractViewUrls(isbn13, pages) {
	const ret = [];
	let i = 1;
	for (const p of pages) {
		ret.push(i++);
	}
	return ret;
}

let mockIsIncludeDateEdited;
let mockIsIncludeModifyUserId;

/**
 * Reset function - called before each test.
 */
function resetAll() {
	ctx = new Context();
	ctx.appDbQuery = (query, values) => getGoodAmmDbQuery(query, values);
	ctx._koaCtx = {
		request: {
			header: {
				"user-agent": "dummy user agent",
				referrer: "dummy referrer",
			},
		},
	};
	mockGenerateExtractViewUrlsWrap = [
		"https://dummyimage.com/1200x1000/ee0000/333.png&text=1",
		"https://dummyimage.com/1200x1000/ee0000/333.png&text=2",
	];
	mockIsIncludeDateEdited = false;
	mockIsIncludeModifyUserId = false;
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function extractViewOne(data, generateExtractViewUrls) {
	let err = null;
	generateExtractViewUrls = generateExtractViewUrls || defaultGenerateExtractViewUrls;
	try {
		ctx.body = await extractViewOneRaw(data, ctx, generateExtractViewUrls);
	} catch (e) {
		err = e;
	}
	return err;
}

function getGoodParams() {
	return {
		extract_oid: "a".repeat(36),
		extract_share_oid: "b".repeat(36),
	};
}

test(`Error when invalid extract_oid is provided`, async () => {
	const params = getGoodParams();
	params.extract_oid = "54";
	expect(await extractViewOne(params)).toEqual(new Error("400 ::: extract_oid not valid"));
	expect(ctx.body).toEqual(null);
});

test(`Error when extract is not found`, async () => {
	const params = getGoodParams();
	ctx.getSessionData = async (_) => null;
	ctx.appDbQuery = async (query, values) => {
		const cc = getCanCopyResult(query);
		if (cc) {
			return cc;
		}
		return {
			rows: [],
			rowCount: 0,
		};
	};
	expect(await extractViewOne(params)).toEqual(new Error("400 ::: Extract not found"));
	expect(ctx.body).toEqual(null);
});

test(`Succeed when extract is found (teacher)`, async () => {
	const params = getGoodParams();
	ctx.sessionData.user_role = "teacher";
	ctx.sessionData.school_id = 1;
	expect(await extractViewOne(params)).toBe(null);
	expect(ctx.body).toEqual({
		asset: null,
		is_watermarked: undefined,
		urls: ["https://dummyimage.com/1200x1000/ee0000/333.png&text=1", "https://dummyimage.com/1200x1000/ee0000/333.png&text=2"],
	});
});

test(`Succeed when extract is found (viewers)`, async () => {
	const params = getGoodParams();
	ctx.sessionData = null;
	params.extract_share_oid = "b".repeat(36);
	ctx.appDbQuery = async function (query, values) {
		return await getGoodAmmDbQuery_Viewers(query, values);
	};
	expect(await extractViewOne(params)).toBe(null);
	expect(ctx.body).toEqual({
		asset: null,
		is_watermarked: undefined,
		urls: ["https://dummyimage.com/1200x1000/ee0000/333.png&text=1", "https://dummyimage.com/1200x1000/ee0000/333.png&text=2"],
	});
});

test(`Error when invalid extract_share_oid is provided for viewers`, async () => {
	ctx.sessionData = null;
	const params = getGoodParams();
	params.extract_share_oid = "1223345";
	expect(await extractViewOne(params)).toEqual(new Error("400 ::: Extract Share not valid"));
	expect(ctx.body).toEqual(null);
});

test(`error when link has exprired(viewers)`, async () => {
	const params = getGoodParams();
	ctx.sessionData = null;
	params.extract_share_oid = "b".repeat(36);
	ctx.appDbQuery = getBadAmmDbQuery_Viewers;
	expect(await extractViewOne(params)).toEqual(
		new Error("400 ::: The link to this content has expired. If you made the copy, please regenerate the link here.")
	);
	expect(ctx.body).toEqual(null);
});

test(`Error school id nopt provided in sessiondata (teacher)`, async () => {
	const params = getGoodParams();
	ctx.sessionData.user_role = "teacher";
	delete ctx.sessionData.school_id;
	expect(await extractViewOne(params)).toEqual(new Error("401 ::: You must be associated with a school to create an extract"));
	expect(ctx.body).toEqual(null);
});

test(`Success without extract_share_oid`, async () => {
	const params = getGoodParams();
	ctx.sessionData.user_role = "teacher";
	ctx.sessionData.school_id = 1;
	delete params.extract_share_oid;
	ctx.appDbQuery = getGoodAmmDbQuery;
	expect(await extractViewOne(params)).toBe(null);
	expect(ctx.body).toEqual({
		asset: null,
		is_watermarked: undefined,
		urls: ["https://dummyimage.com/1200x1000/ee0000/333.png&text=1", "https://dummyimage.com/1200x1000/ee0000/333.png&text=2"],
	});
});

test(`Success without user-agent and referer values`, async () => {
	const params = getGoodParams();
	ctx.sessionData.user_role = "teacher";
	ctx.sessionData.school_id = 1;
	ctx._koaCtx = {
		request: {
			header: {},
		},
	};
	delete params.extract_share_oid;
	ctx.appDbQuery = getGoodAmmDbQuery;
	expect(await extractViewOne(params)).toBe(null);
	expect(ctx.body).toEqual({
		asset: null,
		is_watermarked: undefined,
		urls: ["https://dummyimage.com/1200x1000/ee0000/333.png&text=1", "https://dummyimage.com/1200x1000/ee0000/333.png&text=2"],
	});
});

test(`Error when invalid extract_share_oid is provided as share for viewers)`, async () => {
	const params = getGoodParams();
	ctx.sessionData = null;
	params.extract_share_oid = "share";
	ctx.appDbQuery = getBadAmmDbQuery_Viewers;
	expect(await extractViewOne(params)).toEqual(new Error("400 ::: Extract Share not valid"));
	expect(ctx.body).toEqual(null);
});

test(`Teachers see any extract from their school for mobile and table view`, async () => {
	const params = getGoodParams();
	ctx.sessionData.user_role = "teacher";
	ctx.sessionData.school_id = 1;
	ctx._koaCtx = {
		request: {
			header: {},
		},
	};
	params.extract_share_oid = "share";
	ctx.appDbQuery = getGoodAmmDbQuery;
	expect(await extractViewOne(params)).toBe(null);
	expect(ctx.body).toEqual({
		asset: null,
		is_watermarked: undefined,
		urls: ["https://dummyimage.com/1200x1000/ee0000/333.png&text=1", "https://dummyimage.com/1200x1000/ee0000/333.png&text=2"],
	});
});

test(`Ensure modified_by_user_id and date_edited updated successfully in database`, async () => {
	const params = getGoodParams();
	ctx.sessionData.user_role = "teacher";
	ctx.sessionData.school_id = 1;
	ctx.appDbQuery = async (query, values) => {
		const cc = getCanCopyResult(query);
		query = query.trim().replace(/[\s\t\r\n]+/g, " ");
		if (cc) {
			return cc;
		}
		if (query.indexOf("UPDATE extract SET") !== -1) {
			mockIsIncludeModifyUserId = query.indexOf("modified_by_user_id") !== -1 ? true : false;
			mockIsIncludeDateEdited = query.indexOf("date_edited") !== -1 ? true : false;
		}
		return {
			rows: [
				{
					work_isbn13: "1234561234561",
					pages: [4, 7, 9],
					date_expired: nextMonthDate,
					extract_status: "editable",
				},
			],
		};
	};
	expect(await extractViewOne(params)).toBe(null);
	expect(ctx.body).toEqual({
		asset: null,
		is_watermarked: undefined,
		urls: ["https://dummyimage.com/1200x1000/ee0000/333.png&text=1", "https://dummyimage.com/1200x1000/ee0000/333.png&text=2"],
	});
	expect(mockIsIncludeDateEdited).toBe(true);
	expect(mockIsIncludeModifyUserId).toBe(true);
});
