const getHomeFlyoutInfoRaw = require("../../core/public/get-home-flyout-info");
const Context = require("../common/Context");

let ctx, mockUserSessionData, mockExpiredCopiesCount, mockRolloverData, mockScreenResult;
function resetAll() {
	mockUserSessionData = {
		user_role: "teacher",
		user_id: 185692,
		school_id: 153,
	};
	ctx = new Context();
	ctx.getSessionData = async (_) => {
		return mockUserSessionData;
	};

	ctx.getUserRole = async (_) => {
		return mockUserSessionData.user_role;
	};

	ctx.appDbQuery = async function (query, values) {
		return await getGoodAmmDbQuery(query, values);
	};

	mockExpiredCopiesCount = { rows: [{ _count_: 1 }] };
	mockRolloverData = { rows: [{ rollover_completed: "completed", target_execution_date: "2021-06-23 12:41:23.992333+00" }], rowCount: 1 };
	mockScreenResult = { rows: [{ screen: "home_review_copies", index: 0 }] };
}

beforeEach(resetAll);
afterEach(resetAll);

function getGoodParams() {
	return {};
}

async function getGoodAmmDbQuery(query, values) {
	query = query.replace(/\s+/g, " ");
	if (query.indexOf(`SELECT COUNT`) !== -1) {
		return mockExpiredCopiesCount;
	}
	if (query.indexOf(`SELECT screen,`) !== -1) {
		return mockScreenResult;
	}
	if (query.indexOf(`SELECT rollover_job.status`)) {
		return mockRolloverData;
	}
	return;
}

async function getHomeFlyoutInfo() {
	let err = null;
	try {
		ctx.body = await getHomeFlyoutInfoRaw(null, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Success`, async () => {
	const params = getGoodParams();
	expect(await getHomeFlyoutInfo()).toEqual(null);
	expect(ctx.body).not.toBeNull();
	expect(ctx.body).toEqual({
		flyout_seen_data: { home_review_copies: 0 },
		rollover_data: {
			extract_expiry_count: 1,
			rollover_completed: "completed",
			target_execution_date: "2021-06-23 12:41:23.992333+00",
		},
	});
});

test(`Error when user is not logged in`, async () => {
	const params = getGoodParams();
	mockUserSessionData = [];
	expect(await getHomeFlyoutInfo()).toEqual(new Error("401 ::: Unauthorized"));
});

test(`When rollover is not hapened`, async () => {
	const params = getGoodParams();
	mockRolloverData.rowCount = 0;
	mockRolloverData.rows = [];
	expect(await getHomeFlyoutInfo()).toEqual(null);
	expect(ctx.body).not.toBeNull();
	expect(ctx.body).toEqual({
		flyout_seen_data: { home_review_copies: 0 },
		rollover_data: {
			extract_expiry_count: 1,
			rollover_completed: 0,
			target_execution_date: null,
		},
	});
});
