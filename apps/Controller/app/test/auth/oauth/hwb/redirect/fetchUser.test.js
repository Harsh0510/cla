const fetchUser = require("../../../../../core/auth/oauth/hwb/redirect/fetchUser");

test("fetchUserByHwbId", async () => {
	const result = await fetchUser.fetchUserByHwbId(() => {
		return {
			rows: [
				{
					foo: "bar",
				},
			],
		};
	}, 1234);
	expect(result).toEqual({
		foo: "bar",
	});
});

test("fetchUserById", async () => {
	const result = await fetchUser.fetchUserById(() => {
		return {
			rows: [
				{
					foo: "bar",
				},
			],
		};
	}, 1234);
	expect(result).toEqual({
		foo: "bar",
	});
});

describe("fetchMatchingUser", () => {
	test("by email", async () => {
		let index = 0;
		const result = await fetchUser.fetchMatchingUser(
			() => {
				index++;
				if (index === 1) {
					return {
						rows: [
							{
								foo: "bar",
							},
						],
					};
				}
				return {
					rows: [],
				};
			},
			{
				email: "foo@bar.com",
				first_name: "Sarah",
				last_name: "Connor",
				identifier: "AAAAA",
				title: "Ms",
				school_id: 9999,
			}
		);
		expect(result).toEqual([
			{
				foo: "bar",
			},
			"email",
		]);
	});
	test("by fuzzy", async () => {
		let index = 0;
		const result = await fetchUser.fetchMatchingUser(
			(query, binds) => {
				index++;
				if (index === 2) {
					return {
						rows: [
							{
								foo: "bar",
							},
						],
					};
				}
				return {
					rows: [],
				};
			},
			{
				email: "foo@bar.com",
				first_name: "Sarah",
				last_name: "Connor",
				identifier: "AAAAA",
				title: "Ms",
				school_id: 9999,
			}
		);
		expect(result).toEqual([
			{
				foo: "bar",
			},
			"fuzzy",
		]);
	});
	test("no match", async () => {
		const result = await fetchUser.fetchMatchingUser(
			(query, binds) => {
				return {
					rows: [],
				};
			},
			{
				email: "foo@bar.com",
				first_name: "Sarah",
				last_name: "Connor",
				identifier: "AAAAA",
				title: "Ms",
				school_id: 9999,
			}
		);
		expect(result).toEqual([null, "none"]);
	});
});
