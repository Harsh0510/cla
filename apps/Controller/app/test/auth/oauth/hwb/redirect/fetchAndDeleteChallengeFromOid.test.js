const fetch = require("../../../../../core/auth/oauth/hwb/redirect/fetchAndDeleteChallengeFromOid");

test("success", async () => {
	const result = await fetch(() => {
		return {
			rows: [
				{
					challenge: "ABC",
				},
			],
		};
	}, "XYZ");
	expect(result).toBe("ABC");
});

test("error", async () => {
	const result = await fetch(() => {
		return {
			rows: [],
		};
	}, "XYZ");
	expect(result).toBe(null);
});
