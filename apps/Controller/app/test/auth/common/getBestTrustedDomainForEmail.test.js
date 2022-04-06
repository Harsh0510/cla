const isTrustedDomainRow = require("../../../core/auth/common/getBestTrustedDomainForEmail");
const Context = require("../../common/Context");

let ctx;

function resetAll() {
	ctx = new Context();
}

/** Clear everything before and after each test */
beforeEach(resetAll);
afterEach(resetAll);

async function isTrustedDomain(data) {
	let err = null;
	try {
		ctx.body = await isTrustedDomainRow(data, ctx.querier);
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

test("Successfully return result ", async () => {
	const params = getParams();
	ctx.querier = async function (query, values) {
		const parseQuery = query.replace(/[\s\t\n\r]+/g, " ");
		if (parseQuery.indexOf("FROM trusted_domain") !== -1) {
			return { rows: { domain: "email.com" }, rowCount: 1 };
		}
		throw new Error("should never get here");
	};
	expect(await isTrustedDomain(params.email)).toBeNull();
});

test("return null result ", async () => {
	const params = getParams();
	ctx.querier = async function (query, values) {
		const parseQuery = query.replace(/[\s\t\n\r]+/g, " ");
		if (parseQuery.indexOf("FROM trusted_domain") !== -1) {
			return { rows: { domain: "email.com" }, rowCount: 0 };
		}
		throw new Error("should never get here");
	};
	expect(await isTrustedDomain(params.email)).toBeNull();
});

// test("no email provided", async () => {
// 	const params = getParams();
// 	expect(await isTrusted(params)).toEqual(new Error("400 ::: Email not provided"));
// });
