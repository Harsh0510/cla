const EmailLockedRow = require("../../../core/auth/common/isEmailLocked");
const Context = require("../../common/Context");

let ctx;

function resetAll() {
	ctx = new Context();
}

/** Clear everything before and after each test */
beforeEach(resetAll);
afterEach(resetAll);

async function EmailLocked(data) {
	let err = null;
	try {
		ctx.body = await EmailLockedRow(ctx.querier, data);
	} catch (e) {
		err = e;
	}
	return err;
}

function getParams() {
	return {
		email: "gagan@gujarat.com",
	};
}

test("Successfully return true ", async () => {
	const params = getParams();
	ctx.querier = async function (query, values) {
		const parseQuery = query.replace(/[\s\t\n\r]+/g, " ");
		if (parseQuery.indexOf("SELECT (COUNT(id) >= 5) AS is_locked") !== -1) {
			return { rows: [{ is_locked: true }], rowCount: 1 };
		}
		throw new Error("should never get here");
	};
	expect(await EmailLocked(params.email)).toBeNull();
});

test("return false ", async () => {
	const params = getParams();
	ctx.querier = async function (query, values) {
		const parseQuery = query.replace(/[\s\t\n\r]+/g, " ");
		if (parseQuery.indexOf("SELECT (COUNT(id) >= 5) AS is_locked") !== -1) {
			return { rows: [{ is_locked: false }], rowCount: 1 };
		}
		throw new Error("should never get here");
	};
	expect(await EmailLocked(params.email)).toBeNull();
});
