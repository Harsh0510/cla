const insertNewHwbUser = require("../../../../../core/auth/oauth/hwb/redirect/insertNewHwbUser");

test("success - no email key violation", async () => {
	const result = await insertNewHwbUser(
		(query, binds) => {
			return {
				rows: [
					{
						id: 12345,
					},
				],
			};
		},
		{
			school_id: 5555,
			email: "foo@bar.com",
			title: "Mr",
			first_name: "John",
			last_name: "Connor",
			identifier: "XXXX",
		},
		null,
		"none"
	);
	expect(result).toBe(12345);
});

test("success - with email key violation", async () => {
	let triedWithRandomEmail = false;
	const result = await insertNewHwbUser(
		(query, binds) => {
			if (binds[1] === "foo@bar.com") {
				throw new Error("violates unique constraint email");
			} else if (binds[1].match(/^hwb_[0-9a-f]{32}@hwb.com/)) {
				triedWithRandomEmail = true;
				return {
					rows: [
						{
							id: 12345,
						},
					],
				};
			}
			throw new Error("should never get here");
		},
		{
			school_id: 5555,
			email: "foo@bar.com",
			title: "Mr",
			first_name: "John",
			last_name: "Connor",
			identifier: "XXXX",
		},
		{
			id: 98765,
			email: "another@user.here",
		},
		"fuzzy"
	);
	expect(result).toBe(12345);
	expect(triedWithRandomEmail).toBe(true);
});

test("error", async () => {
	let triedWithRandomEmail = false;
	let err;
	let result;
	try {
		result = await insertNewHwbUser(
			(query, binds) => {
				throw new Error("some error");
			},
			{
				school_id: 5555,
				email: "foo@bar.com",
				title: "Mr",
				first_name: "John",
				last_name: "Connor",
				identifier: "XXXX",
			},
			null,
			"none"
		);
	} catch (e) {
		err = e;
	}
	expect(result).toBeUndefined();
	expect(err).toEqual(new Error("some error"));
});
