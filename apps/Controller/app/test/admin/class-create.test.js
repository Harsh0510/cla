let mockUploadSingleClassResult;
let mockGetValidationMessagesForClassResult;
let mockSessionData;

jest.mock("../../core/admin/lib/classCreate", () => {
	return {
		uploadSingleClass() {
			return mockUploadSingleClassResult;
		},
		getValidationMessagesForClass() {
			return mockGetValidationMessagesForClassResult;
		},
	};
});

const classUpdate = require("../../core/admin/class-create");

const getMockCtx = () => {
	return {
		getSessionData() {
			return mockSessionData;
		},
		throw(httpCode, message) {
			const e = new Error();
			e.assert = true;
			e.httpCode = httpCode;
			e.message = message;
			throw e;
		},
		assert(expr, httpCode, message) {
			if (!expr) {
				this.throw(httpCode, message);
			}
		},
		ensureLoggedIn() {
			return true;
		},
		appDbQuery() {},
	};
};

function resetAll() {
	mockGetValidationMessagesForClassResult = ["a", "b", "c"];
	mockUploadSingleClassResult = { id: 1 };
	mockSessionData = {
		user_id: 4,
		user_role: "cla-admin",
		school_id: 0,
		allowed_extract_ratio: 0.05,
		academic_year_end: [8, 15],
		user_email: "userloginemail@email.com",
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test("error for unrecognised user role", async () => {
	mockSessionData.user_role = "foo";
	let err;
	try {
		await classUpdate({}, getMockCtx());
	} catch (e) {
		err = e;
	}
	expect(err.assert).toBe(true);
	expect(err.httpCode).toBe(401);
	expect(err.message).toBe("Unauthorized");
});

test("error when cla admin doesn't provide school id", async () => {
	mockSessionData.user_role = "cla-admin";
	let err;
	try {
		await classUpdate(
			{
				school_id: "hello",
			},
			getMockCtx()
		);
	} catch (e) {
		err = e;
	}
	expect(err.assert).toBe(true);
	expect(err.httpCode).toBe(400);
	expect(err.message).toBe("Institution invalid");
});

test("error when class validation fails", async () => {
	mockSessionData.user_role = "cla-admin";
	let err;
	try {
		await classUpdate(
			{
				school_id: 5,
			},
			getMockCtx()
		);
	} catch (e) {
		err = e;
	}
	expect(err.assert).toBe(true);
	expect(err.httpCode).toBe(400);
	expect(err.message).toBe("a; b; c");
});

test("Success", async () => {
	mockSessionData.user_role = "cla-admin";
	let err = null;
	let result;
	mockGetValidationMessagesForClassResult = [];
	try {
		result = await classUpdate(
			{
				school_id: 5,
				title: "test",
				year_group: 2,
				number_of_students: 25,
				exam_board: "AQA",
				key_stage: "KS1",
			},
			getMockCtx()
		);
	} catch (e) {
		err = e;
	}
	expect(err).toBeNull();
	expect(result).toEqual({ id: 1, success: true });
});

test("Success when user is school-admin", async () => {
	mockSessionData.user_role = "school-admin";
	let err = null;
	let result;
	mockSessionData.user_role;
	mockGetValidationMessagesForClassResult = [];
	try {
		result = await classUpdate(
			{
				title: "test",
				year_group: 2,
				number_of_students: 25,
				exam_board: "AQA",
				key_stage: "KS1",
			},
			getMockCtx()
		);
	} catch (e) {
		err = e;
	}
	expect(err).toBeNull();
	expect(result).toEqual({ id: 1, success: true });
});
