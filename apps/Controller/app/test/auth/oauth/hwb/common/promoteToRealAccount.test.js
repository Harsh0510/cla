const promoteToRealAccount = require("../../../../../core/auth/oauth/hwb/common/promoteToRealAccount");

test("All is fine", async () => {
	let q;
	let b;
	const querier = (query, binds) => {
		q = query.replace(/[\r\t\n\s]+/g, " ").trim();
		b = binds;
	};
	promoteToRealAccount(querier, 1234);
	expect(b).toEqual([1234]);
	expect(q.indexOf("UPDATE cla_user SET")).toBe(0);
});

test("Ensure modified_by_user_id and date_edited updated successfully in database", async () => {
	let q;
	let b;
	const querier = (query, binds) => {
		q = query.replace(/[\r\t\n\s]+/g, " ").trim();
		b = binds;
	};
	promoteToRealAccount(querier, 1234);
	expect(b).toEqual([1234]);
	expect(q.indexOf("UPDATE cla_user SET")).toBe(0);
	expect(q.indexOf("date_edited") !== -1).toBe(true);
	expect(q.indexOf("modified_by_user_id") !== -1).toBe(true);
});
