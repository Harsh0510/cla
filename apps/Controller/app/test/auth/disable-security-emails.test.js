const disableSecurityEmailsRaw = require("../../core/auth/disable-security-emails");
const Context = require("../common/Context");

let ctx;
let mockIsIncludeDateEdited;

function resetAll() {
	ctx = new Context();
	ctx.responseStatus = 200;
	ctx.body = null;
	mockIsIncludeDateEdited = false;
}

beforeEach(resetAll);
afterEach(resetAll);

async function disableSecurityEmails(data) {
	let err = null;
	try {
		ctx.body = await disableSecurityEmailsRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

describe("new style 36-char oid", () => {
	function getParams() {
		return {
			// 36 characters
			hashed: "123456781234567812345678123456781234",
		};
	}
	test("No token found", async () => {
		const params = getParams();
		ctx.doAppQuery = () => [];
		expect(await disableSecurityEmails(params)).toBeNull();
		expect(ctx.body).toEqual({ result: false });
	});
	test("Token found, not updated", async () => {
		const params = getParams();
		ctx.doAppQuery = (query) => {
			if (query.includes("DELETE FROM")) {
				return [
					{
						user_id: 56789,
					},
				];
			}
			return [];
		};
		expect(await disableSecurityEmails(params)).toBeNull();
		expect(ctx.body).toEqual({ result: false });
	});
	test("Token found, IS updated", async () => {
		const params = getParams();
		ctx.doAppQuery = (query) => {
			if (query.includes("DELETE FROM")) {
				return [
					{
						user_id: 56789,
					},
				];
			}
			return [{}];
		};
		expect(await disableSecurityEmails(params)).toBeNull();
		expect(ctx.body).toEqual({ result: true });
	});
});

describe("old style md5 hash", () => {
	function getParams() {
		return {
			// 32 characters
			hashed: "12345678123456781234567812345678",
		};
	}

	test("Successful disable security emails", async () => {
		const params = getParams();
		ctx.appDbQuery = async function () {
			return { rowCount: 1 };
		};
		expect(await disableSecurityEmails(params)).toBeNull();
		expect(ctx.body).toEqual({ result: true });
	});

	test("Ensure date_edited updated successfully in database", async () => {
		const params = getParams();
		ctx.appDbQuery = async function (query, binds) {
			query = query.trim().replace(/[\s\t\n\r]+/g, " ");
			if (query.indexOf("UPDATE cla_user SET") !== -1) {
				mockIsIncludeDateEdited = query.indexOf("date_edited") !== -1 ? true : false;
				return { rowCount: 1 };
			}
		};
		expect(await disableSecurityEmails(params)).toBeNull();
		expect(ctx.body).toEqual({ result: true });
		expect(mockIsIncludeDateEdited).toEqual(true);
	});
});
