const extractShareDeactivateRaw = require("../../core/public/extract-share-deactivate");
const Context = require("../common/Context");

let ctx;
let mockIsIncludeDateEdited;
let mockIsIncludeModifyUserId;

/**
 * Reset function - called before each test.
 */
function resetAll() {
	ctx = new Context();
	mockIsIncludeDateEdited = false;
	mockIsIncludeModifyUserId = false;
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function extractShareDeactivate(data) {
	let err = null;
	try {
		ctx.body = await extractShareDeactivateRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function getParams() {
	return {
		share_oid: "f1b653667bb585e633934aab335e27ed025f",
	};
}

test(`Error when no share_oid provided`, async () => {
	const params = getParams();
	delete params.share_oid;
	expect(await extractShareDeactivate(params, ctx)).toEqual(new Error("400 ::: Share not provided"));
});

test(`Error when no share_oid not string`, async () => {
	const params = getParams();
	params.share_oid = ["f1b653667bb585e633934aab335e27ed025f"];
	expect(await extractShareDeactivate(params, ctx)).toEqual(new Error("400 ::: Share invalid"));
});

test(`Error when not logged in`, async () => {
	const params = getParams();
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => reject(new Error("failed")));
	expect(await extractShareDeactivate(params, ctx)).toEqual(new Error("failed"));
});

test(`Error when user login with cla-admin `, async () => {
	const params = getParams();
	expect(await extractShareDeactivate(params, ctx)).toEqual(new Error("401 ::: Unauthorized"));
});

test(`Error when user login with school-admin but not have any school `, async () => {
	const params = getParams();
	ctx.sessionData.user_role = "school-admin";
	delete ctx.sessionData.school_id;
	expect(await extractShareDeactivate(params, ctx)).toEqual(new Error("401 ::: You must be associated with a school to deactivate this share link"));
});

test(`Unknown error when update extract share deactivate in database`, async () => {
	const params = getParams();
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => resolve());
	ctx.getSessionData = (_) => new Promise((resolve, reject) => resolve({ user_role: "school-admin", school_id: 5 }));
	ctx.appDbQuery = (_) => new Promise((resolve, reject) => reject(new Error("400 ::: Unknown error [1]")));
	expect(await extractShareDeactivate(params, ctx)).toEqual(new Error("400 ::: Unknown error [1]"));
});

test(`Success when update extract share deactivate in database`, async () => {
	const params = getParams();

	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => resolve());
	ctx.getSessionData = (_) => new Promise((resolve, reject) => resolve({ user_role: "school-admin", school_id: 5 }));
	ctx.doAppQuery = (query) => {
		if (query.indexOf("AS can_copy FROM cla_user") !== -1) {
			return {
				rowCount: 1,
				rows: [
					{
						can_copy: true,
					},
				],
			};
		}
		return { oid: "f1b653667bb585e633934aab335e27ed025f" };
	};
	expect(await extractShareDeactivate(params, ctx)).toBeNull();
	expect(ctx.body).toEqual({ oid: "f1b653667bb585e633934aab335e27ed025f" });
});

test(`Ensure modified_by_user_id and date_edited updated successfully in database`, async () => {
	const params = getParams();

	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => resolve());
	ctx.getSessionData = (_) => new Promise((resolve, reject) => resolve({ user_role: "school-admin", school_id: 5 }));
	ctx.doAppQuery = (query) => {
		query = query.trim().replace(/[\s\t\r\n]+/g, " ");
		if (query.indexOf("AS can_copy FROM cla_user") !== -1) {
			return {
				rowCount: 1,
				rows: [
					{
						can_copy: true,
					},
				],
			};
		}
		if (query.indexOf("UPDATE extract_share SET") !== -1) {
			mockIsIncludeModifyUserId = query.indexOf("modified_by_user_id") !== -1 ? true : false;
			mockIsIncludeDateEdited = query.indexOf("date_edited") !== -1 ? true : false;
		}
		return { oid: "f1b653667bb585e633934aab335e27ed025f" };
	};
	expect(await extractShareDeactivate(params, ctx)).toBeNull();
	expect(ctx.body).toEqual({ oid: "f1b653667bb585e633934aab335e27ed025f" });
	expect(mockIsIncludeDateEdited).toBe(true);
	expect(mockIsIncludeModifyUserId).toBe(true);
});
