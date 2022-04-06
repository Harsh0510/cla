const insertSessionData = require("../../../core/auth/common/insertSessionData");

test(`success`, async () => {
	expect(
		await insertSessionData(
			{
				sessionDbQuery(query) {
					if (query.indexOf("INSERT INTO") >= 0) {
						return {
							rows: [
								{
									token: "abc123",
								},
							],
						};
					}
					throw new Error("should not be here");
				},
			},
			12345,
			{}
		)
	).toBe("abc123");
});

test(`success (no data)`, async () => {
	expect(
		await insertSessionData(
			{
				sessionDbQuery(query) {
					if (query.indexOf("INSERT INTO") >= 0) {
						return {
							rows: [
								{
									token: "abc123",
								},
							],
						};
					}
					throw new Error("should not be here");
				},
			},
			12345
		)
	).toBe("abc123");
});

test(`success - and delete old sessions`, async () => {
	let clearedOldSessions = false;
	expect(
		await insertSessionData(
			{
				sessionDbQuery(query) {
					if (query.indexOf("INSERT INTO") >= 0) {
						return {
							rows: [
								{
									token: "30123456789",
								},
							],
						};
					} else if (query.indexOf("DELETE FROM") >= 0) {
						clearedOldSessions = true;
						return {
							rows: [],
						};
					}
					throw new Error("should not be here");
				},
			},
			12345,
			{}
		)
	).toBe("30123456789");
	expect(clearedOldSessions).toBe(true);
});
