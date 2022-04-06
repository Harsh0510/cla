const imprintUpdateRaw = require("../../core/admin/imprint-update");
const Context = require("../common/Context");

let ctx;
let mockIsIncludeModifyUserIdForImprint;
let mockIsIncludeDateEditedForImprint;
let mockIsIncludeModifyUserIdForAsset;
let mockIsIncludeDateEditedForAsset;

function getValidRequest() {
	return {
		id: 1023,
		buy_book_rules: ["google.com", "facebook.com"],
	};
}

/**
 * Reset function - called before each test.
 */
function resetAll() {
	ctx = new Context();
	mockIsIncludeModifyUserIdForAsset = false;
	mockIsIncludeDateEditedForAsset = false;
	mockIsIncludeModifyUserIdForImprint = false;
	mockIsIncludeDateEditedForImprint = false;
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function imprintUpdate(data) {
	let err = null;
	try {
		ctx.body = await imprintUpdateRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

//Error when user role is teacher
test(`Error "Unauthorized" when user role is teacher`, async () => {
	ctx.sessionData.user_role = "teacher";
	const data = getValidRequest();
	expect(await imprintUpdate(data)).toEqual(new Error("401 ::: Unauthorized"));
});

//Error when user role is school-admin
test(`Error "Unauthorized" when user role is school-admin`, async () => {
	ctx.sessionData.user_role = "school-admin";
	const data = getValidRequest();
	expect(await imprintUpdate(data)).toEqual(new Error("401 ::: Unauthorized"));
});

//Error when id is not pass
test(`Error "ID invalid" when id is not pass`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	delete data.id;
	expect(await imprintUpdate(data)).toEqual(new Error("400 ::: ID invalid"));
});

//Error when id is invalid
test(`Error "ID invalid" when id is invalid`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	data.id = "test12222";
	expect(await imprintUpdate(data)).toEqual(new Error("400 ::: ID invalid"));
});

//Error "No fields changed" when id is negative
test(`Error "ID must not be negative" when id is negative`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	data.id = -20;
	expect(await imprintUpdate(data)).toEqual(new Error("400 ::: ID must not be negative"));
});

test(`Error "No fields changed" when not pass the buy_book_rules`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	delete data.buy_book_rules;
	expect(await imprintUpdate(data)).toEqual(new Error("400 ::: No fields changed"));
});

//Error "'Buy Book' rules must be an array" when buy_book_rules invalid
test(`Error "'Buy Book' rules must be an array" when buy_book_rules invalid`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	data.buy_book_rules = "test.com";
	expect(await imprintUpdate(data)).toEqual(new Error(`400 ::: 'Buy Book' rules must be an array`));
});

//Error "'Buy Book' rules must be an array" when buy_book_rules as object
test(`Error "'Buy Book' rules must be an array" when buy_book_rules as object`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	data.buy_book_rules = { t1: "test.com" };
	expect(await imprintUpdate(data)).toEqual(new Error(`400 ::: 'Buy Book' rules must be an array`));
});

//Error "Too many 'Buy Book' rules" when buy_book_rules length > 10
test(`Error "Too many 'Buy Book' rules" when buy_book_rules length > 10`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	data.buy_book_rules = [
		"test1.com",
		"test1.com",
		"test1.com",
		"test1.com",
		"test1.com",
		"test1.com",
		"test1.com",
		"test1.com",
		"test1.com",
		"test1.com",
		"test1.com",
		"test1.com",
	];
	expect(await imprintUpdate(data)).toEqual(new Error(`400 ::: Too many 'Buy Book' rules`));
});

//Error "Too many 'Buy Book' rules" when buy_book_rules some values are invalid
test(`Error "Too many 'Buy Book' rules" when buy_book_rules some values are invalid`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	data.buy_book_rules = ["test1.com", "test1.com", "test1.com", "test1.com", "test1.com", "test1.com", 123, -5];
	expect(await imprintUpdate(data)).toEqual(new Error(`400 ::: Rule 7 not a string`));
});

test(`Unknown SQL error`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	ctx.doAppQuery = (query, values) => {
		throw new Error("Unknown error");
	};
	const data = getValidRequest();
	expect(await imprintUpdate(data)).toEqual(new Error("Unknown error"));
});

//Success
test(`Success`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	ctx.doAppQuery = (query, values) => {
		query = query.trim().replace(/\s+/g, " ");
		if (query.indexOf("UPDATE imprint") == 0) {
			return { rows: [], rowCount: 1 };
		}
	};
	const data = getValidRequest();
	expect(await imprintUpdate(data)).toBeNull();
	expect(ctx.body).toMatchObject({ result: true });
});

test(`Ensure modified_by_user_id and date_edited updated successfully in database`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	ctx.doAppQuery = (query, values) => {
		query = query.trim().replace(/\s+/g, " ");
		if (query.indexOf("UPDATE imprint") == 0) {
			mockIsIncludeModifyUserIdForImprint = query.indexOf("modified_by_user_id") !== -1 ? true : false;
			mockIsIncludeDateEditedForImprint = query.indexOf("date_edited") !== -1 ? true : false;
			return { rows: [], rowCount: 1 };
		}
		if (query.indexOf("UPDATE asset") == 0) {
			mockIsIncludeModifyUserIdForAsset = query.indexOf("modified_by_user_id") !== -1 ? true : false;
			mockIsIncludeDateEditedForAsset = query.indexOf("date_edited") !== -1 ? true : false;
			return { rows: [], rowCount: 1 };
		}
	};
	const data = getValidRequest();
	expect(await imprintUpdate(data)).toBeNull();
	expect(ctx.body).toMatchObject({ result: true });
	expect(mockIsIncludeModifyUserIdForImprint).toEqual(true);
	expect(mockIsIncludeDateEditedForImprint).toEqual(true);
	expect(mockIsIncludeModifyUserIdForAsset).toEqual(true);
	expect(mockIsIncludeDateEditedForAsset).toEqual(true);
});
