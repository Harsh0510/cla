process.env.NODE_ENV = "production";

const isProduction = require("../../common/isProduction");

test("result returns correctly", async () => {
	const item = isProduction;
	expect(item).toBe(true);
});
