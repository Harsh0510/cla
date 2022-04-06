const Context = require("../../common/Context");
const OLD_ENV = process.env;
let ctx;
let mockIsIncludeDateEdited;

/**
 * mock of pardot
 */
jest.mock("../../../common/pardot/pardot", () => {
	return {
		getProspect: () => {
			return mockGetProspectResult;
		},
		addProspect: () => {
			return mockAddProspectResult;
		},
		upsertListMembership: () => {
			return true;
		},
	};
});

/**
 * Reset function - called before each test.
 */
function resetAll() {
	ctx = new Context();
	mockSelectResult = {
		rowCount: 1,
		rows: [{ email: "mock@gmail.com" }],
	};
	mockUpdateResult = {
		rows: [{ email: "mock@gmail.com" }],
		rowCount: 0,
	};
	mockGetProspectResult = false;
	mockAddProspectResult = {
		prospect: [
			{
				id: 13,
				updated_at: "2020:05:23",
			},
		],
	};
	ctx.appDbQuery = (query, values) => {
		let trimQuery = query.trim().replace(/\s+/g, " ");
		if (trimQuery.indexOf("SELECT") !== -1) {
			return mockSelectResult;
		}
		if (trimQuery.indexOf("UPDATE") !== -1) {
			return mockUpdateResult;
		}
	};
	jest.resetModules(); // most important - it clears the cache
	process.env = { ...OLD_ENV }; // make a copy
	mockIsIncludeDateEdited = false;
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

test(`Returns if prospect will not add`, async () => {
	process.env.CLA_PARDOT_API_PRIVATE_KEY = "user key";
	const upsertUserToPardotRaw = require("../../../common/pardot/upsertUserToPardot");
	async function upsertUserToPardot(data) {
		let err = null;
		try {
			ctx.body = await upsertUserToPardotRaw(ctx, data);
		} catch (e) {
			err = e;
		}
		return err;
	}
	mockAddProspectResult = false;
	const item = await upsertUserToPardot("mock@gmail.com");
	expect(item).toBeNull();
});

test(`Returns if single prospect will not get`, async () => {
	process.env.CLA_PARDOT_API_PRIVATE_KEY = "user key";
	const upsertUserToPardotRaw = require("../../../common/pardot/upsertUserToPardot");
	async function upsertUserToPardot(data) {
		let err = null;
		try {
			ctx.body = await upsertUserToPardotRaw(ctx, data);
		} catch (e) {
			err = e;
		}
		return err;
	}
	mockSelectResult.rowCount = 2;
	const item = await upsertUserToPardot("mock@gmail.com");
	expect(item).toBeNull();
});

test(`Returns if prospect identifier is not updated`, async () => {
	process.env.CLA_PARDOT_API_PRIVATE_KEY = "user key";
	const upsertUserToPardotRaw = require("../../../common/pardot/upsertUserToPardot");
	async function upsertUserToPardot(data) {
		let err = null;
		try {
			ctx.body = await upsertUserToPardotRaw(ctx, data);
		} catch (e) {
			err = e;
		}
		return err;
	}
	const item = await upsertUserToPardot("mock@gmail.com");
	expect(item).toBeNull();
});

test(`Update Prospect successfully`, async () => {
	process.env.CLA_PARDOT_API_PRIVATE_KEY = "user key";
	const upsertUserToPardotRaw = require("../../../common/pardot/upsertUserToPardot");
	async function upsertUserToPardot(data) {
		let err = null;
		try {
			ctx.body = await upsertUserToPardotRaw(ctx, data);
		} catch (e) {
			err = e;
		}
		return err;
	}
	mockUpdateResult.rowCount = 1;
	const item = await upsertUserToPardot("mock@gmail.com");
	expect(item).toBeNull();
	expect(ctx.body).toEqual(undefined);
});

test(`Update Prospect successfully when prospect is not get`, async () => {
	process.env.CLA_PARDOT_API_PRIVATE_KEY = "user key";
	const upsertUserToPardotRaw = require("../../../common/pardot/upsertUserToPardot");
	async function upsertUserToPardot(data) {
		let err = null;
		try {
			ctx.body = await upsertUserToPardotRaw(ctx, data);
		} catch (e) {
			err = e;
		}
		return err;
	}
	mockGetProspectResult = true;
	mockUpdateResult.rowCount = 1;
	const item = await upsertUserToPardot("mock@gmail.com");
	expect(item).toBeNull();
	expect(ctx.body).toEqual(undefined);
});

test(`Return when CLA_PARDOT_API_PRIVATE_KEY is not passed `, async () => {
	const upsertUserToPardotRaw = require("../../../common/pardot/upsertUserToPardot");
	async function upsertUserToPardot(data) {
		let err = null;
		try {
			ctx.body = await upsertUserToPardotRaw(ctx, data);
		} catch (e) {
			err = e;
		}
		return err;
	}
	const item = await upsertUserToPardot("mock@gmail.com");
	expect(item).toBeNull();
	expect(ctx.body).toEqual(undefined);
});

test(`Ensure modified_by_user_id and date_edited updated successfully in database`, async () => {
	process.env.CLA_PARDOT_API_PRIVATE_KEY = "user key";
	const upsertUserToPardotRaw = require("../../../common/pardot/upsertUserToPardot");
	async function upsertUserToPardot(data) {
		let err = null;
		try {
			ctx.body = await upsertUserToPardotRaw(ctx, data);
		} catch (e) {
			err = e;
		}
		return err;
	}
	mockUpdateResult.rowCount = 1;
	ctx.appDbQuery = (query, values) => {
		let trimQuery = query.trim().replace(/\s+/g, " ");
		if (trimQuery.indexOf("SELECT") !== -1) {
			return mockSelectResult;
		}
		if (trimQuery.indexOf("UPDATE") !== -1) {
			mockIsIncludeDateEdited = trimQuery.indexOf("date_edited") !== -1 ? true : false;
			return mockUpdateResult;
		}
	};
	const item = await upsertUserToPardot("mock@gmail.com");
	expect(item).toBeNull();
	expect(ctx.body).toEqual(undefined);
	expect(mockIsIncludeDateEdited).toBe(true);
});
