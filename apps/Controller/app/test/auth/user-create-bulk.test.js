const userCreateBulkRaw = require("../../core/auth/user-create-bulk");
const Context = require("../common/Context");

let ctx;
let mockSendActivateEmailError = false;
let mockthrowException = false;

function resetAll() {
	ctx = new Context();
	mockSendActivateEmailError = false;
	mockthrowException = false;
	mockThrowException = {
		status: 400,
		message: "Not Found",
	};
}

jest.mock("../../core/auth/common/sendActivateEmail", () => {
	return function () {
		return true;
	};
});

jest.mock("../../core/auth/common/userCreate", () => {
	return function () {
		if (mockthrowException) {
			throw mockThrowException;
		} else {
			return true;
		}
	};
});

const sendEmail = async () => {
	return true;
};

/** Clear everything before and after each test */
beforeEach(resetAll);
afterEach(resetAll);

async function userCreateBulk(data) {
	let err = null;
	try {
		ctx.body = await userCreateBulkRaw(data, ctx, sendEmail);
	} catch (e) {
		err = e;
	}
	return err;
}

/** default params for create user */
function getParams() {
	return {
		items: [
			{
				email: "amin@email.com",
				first_name: "Amin",
				job_title: "teacher",
				last_name: "alex",
				role: "teacher",
				school_id: 65,
				title: "Mr",
			},
			{
				email: "miloni@email.com",
				first_name: "miloni",
				job_title: "teacher",
				last_name: "mili",
				role: "teacher",
				school_id: 65,
				title: "Mrs",
			},
		],
	};
}

function getInvalidParams() {
	return {
		items: [
			{
				email: "abcsd",
				first_name: "test",
				job_title: "teacher",
				last_name: "alex",
				role: "teacher",
				school_id: 65,
				title: "Mr",
			},
			{
				email: "miloni@email.com",
				first_name: "test@123@",
				job_title: "teacher",
				last_name: "mili",
				role: "teacher",
				school_id: 65,
				title: "Mrs",
			},
			{
				email: "miloni1@email.com",
				first_name: "test",
				job_title: "teacher",
				last_name: "mili@122###",
				role: "teacher",
				school_id: 65,
				title: "Mrs",
			},
			{
				email: "miloni3@email.com",
				first_name: "test",
				job_title: "teacher",
				last_name: "alexa",
				role: "test",
				school_id: 65,
				title: "Mrs",
			},
		],
	};
}

test(`Error Must provide at least one user when params as blank array`, async () => {
	ctx.sessionData.user_role = "school-admin";
	const params = getParams();
	params.items = null;
	expect(await userCreateBulk(params)).toEqual(new Error(`400 ::: Must provide at least one user`));
	expect(ctx.body).toEqual(null);
});

test(`Error Must provide at least one user when params as blank array`, async () => {
	ctx.sessionData.user_role = "school-admin";
	const params = getParams();
	params.items = [];
	expect(await userCreateBulk(params)).toEqual(new Error(`400 ::: Must provide at least one user`));
	expect(ctx.body).toEqual(null);
});

test(`Error Cannot upload more than 1000 users at a time - please try with fewer rows`, async () => {
	ctx.sessionData.user_role = "school-admin";
	const params = getParams();
	params.items.length = 1100;
	expect(await userCreateBulk(params)).toEqual(new Error(`400 ::: Cannot upload more than 1000 users at a time - please try with fewer rows`));
	expect(ctx.body).toEqual(null);
});

test(`Error Unauthorized when user role as teacher`, async () => {
	ctx.sessionData.user_role = "teacher";
	const params = getParams();
	expect(await userCreateBulk(params)).toEqual(new Error(`401 ::: Unauthorized`));
	expect(ctx.body).toEqual(null);
});

test(`Catch exception`, async () => {
	mockthrowException = true;
	ctx.sessionData.user_role = "school-admin";
	const params = getParams();
	expect(await userCreateBulk(params)).toEqual(null);
	expect(ctx.body).toEqual({
		results: [
			{ success: false, message: "Not Found", httpCode: 400 },
			{ success: false, message: "Not Found", httpCode: 400 },
		],
	});

	mockThrowException.status = 500;
	expect(await userCreateBulk(params)).toEqual(null);
	expect(ctx.body).toEqual({ results: [{ success: false }, { success: false }] });
});

test(`Get Results when user role as school-admin`, async () => {
	ctx.sessionData.user_role = "school-admin";
	ctx.appDbQuery = async function (query, values) {
		const queryText = query.replace(/[\s\t\n\r]+/g, " ").trim();
		if (queryText.indexOf("cla_role") !== -1) {
			return { rows: [{ count: 1 }] };
		}
		if (queryText.indexOf("COUNT(*)") !== -1) {
			return { rows: [{ count: 1 }] };
		}
		if (queryText.indexOf("SELECT id FROM school") !== -1) {
			return { rows: [{ id: 65 }] };
		}
		if (queryText.indexOf("INSERT INTO") !== -1) {
			return { rows: [{ id: 70 }] };
		}
		throw new Error("should never get here");
	};
	const params = getInvalidParams();
	expect(await userCreateBulk(params, ctx)).toEqual(null);
	expect(ctx.body).toEqual({ results: [{ success: true }, { success: true }, { success: true }, { success: true }] });
});

test(`Get Results when user role as school-admin`, async () => {
	ctx.sessionData.user_role = "school-admin";
	ctx.sessionData.school_id = 7;
	ctx.appDbQuery = async function (query, values) {
		const queryText = query.replace(/[\s\t\n\r]+/g, " ").trim();
		if (queryText.indexOf("cla_role") !== -1) {
			return { rows: [{ count: 1 }] };
		}
		if (queryText.indexOf("COUNT(*)") !== -1) {
			return { rows: [{ count: 1 }] };
		}
		if (queryText.indexOf("SELECT id FROM school") !== -1) {
			return { rows: [{ id: 65 }] };
		}
		if (queryText.indexOf("INSERT INTO") !== -1) {
			return { rows: [{ id: 70 }] };
		}
		throw new Error("should never get here");
	};
	const params = getParams();
	expect(await userCreateBulk(params, ctx)).toEqual(null);
	expect(ctx.body).toEqual({ results: [{ success: true }, { success: true }] });
});
