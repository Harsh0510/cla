const upsertWondeUsers = require("../../../../../core/admin/async_task/wonde/syncUserData/upsertWondeUsers");

const c = (str) => str.trim().replace(/[\s\t\n\r]+/g, " ");

let mockQueries = [];
let querier;
let subQuerier;
let mockIsIncludeDateEdited;

const resetAll = () => {
	mockQueries = [];
	subQuerier = () => ({
		rows: [],
		rowCount: 0,
	});
	querier = (text, binds) => {
		text = c(text);
		mockQueries.push([text, binds]);
		return subQuerier(text, binds);
	};
	mockIsIncludeDateEdited = false;
};

beforeEach(resetAll);
afterEach(resetAll);

test("inserts correctly", async () => {
	subQuerier = (text, binds) => {
		if (text.indexOf("INSERT INTO") >= 0) {
			return {
				rows: [
					{
						id: 123,
						school_id: binds[3],
						email: binds[0],
						activation_token: "XXX",
						title: binds[4],
						last_name: binds[2],
					},
				],
				rowCount: 1,
			};
		}
		return {
			rows: [],
			rowCount: 0,
		};
	};
	const result = await upsertWondeUsers(querier, 5, [
		{
			id: "abc",
			mis_id: "def",
			upi: "ghi",
			email: "aaa@bbb.ccc",
			first_name: "Bob",
			last_name: "Jones",
			title: "Mr",
		},
		{
			id: "abc2",
			mis_id: "def2",
			upi: "ghi2",
			email: "ddd@eee.fff",
			first_name: "Bob2",
			last_name: "Jones2",
			title: "Ms",
		},
	]);
	expect(result).toEqual([
		{
			id: 123,
			school_id: 5,
			email: "aaa@bbb.ccc",
			activation_token: "XXX",
			title: "Mr",
			last_name: "Jones",
			did_register: true,
		},
		{
			id: 123,
			school_id: 5,
			email: "ddd@eee.fff",
			activation_token: "XXX",
			title: "Ms",
			last_name: "Jones2",
			did_register: true,
		},
	]);
});

test("updates correctly - registers", async () => {
	subQuerier = (text, binds) => {
		if (text.indexOf("UPDATE cla_user") >= 0) {
			return {
				rows: [
					{
						id: 456,
						school_id: binds[3],
						email: binds[0],
						activation_token: "XXX",
						title: binds[4],
						last_name: binds[2],
					},
				],
				rowCount: 1,
			};
		}
		if (text.indexOf("SELECT id, status FROM cla_user WHERE wonde_identifier = ") >= 0) {
			return {
				rows: [
					{
						id: 456,
						status: "pending",
					},
				],
				rowCount: 1,
			};
		}
		return {
			rows: [],
			rowCount: 0,
		};
	};
	const result = await upsertWondeUsers(querier, 5, [
		{
			id: "abc",
			mis_id: "def",
			upi: "ghi",
			email: "aaa@bbb.ccc",
			first_name: "Bob",
			last_name: "Jones",
			title: "Mr",
		},
		{
			id: "abc2",
			mis_id: "def2",
			upi: "ghi2",
			email: "ddd@eee.fff",
			first_name: "Bob2",
			last_name: "Jones2",
			title: "Ms",
		},
	]);
	expect(result).toEqual([
		{
			id: 456,
			school_id: 5,
			email: "aaa@bbb.ccc",
			activation_token: "XXX",
			title: "Mr",
			last_name: "Jones",
			did_register: true,
		},
		{
			id: 456,
			school_id: 5,
			email: "ddd@eee.fff",
			activation_token: "XXX",
			title: "Ms",
			last_name: "Jones2",
			did_register: true,
		},
	]);
});

test("updates correctly - does not register", async () => {
	subQuerier = (text, binds) => {
		if (text.indexOf("UPDATE cla_user") >= 0) {
			return {
				rows: [
					{
						id: 456,
						school_id: binds[3],
						email: binds[0],
						activation_token: "XXX",
						title: binds[4],
						last_name: binds[2],
					},
				],
				rowCount: 1,
			};
		}
		if (text.indexOf("SELECT id, status FROM cla_user WHERE wonde_identifier = ") >= 0) {
			return {
				rows: [
					{
						id: 456,
						status: "registered",
					},
				],
				rowCount: 1,
			};
		}
		return {
			rows: [],
			rowCount: 0,
		};
	};
	const result = await upsertWondeUsers(querier, 5, [
		{
			id: "abc",
			mis_id: "def",
			upi: "ghi",
			email: "aaa@bbb.ccc",
			first_name: "Bob",
			last_name: "Jones",
			title: "Mr",
		},
		{
			id: "abc2",
			mis_id: "def2",
			upi: "ghi2",
			email: "ddd@eee.fff",
			first_name: "Bob2",
			last_name: "Jones2",
			title: "Ms",
		},
	]);
	expect(result).toEqual([
		{
			id: 456,
			school_id: 5,
			email: "aaa@bbb.ccc",
			activation_token: "XXX",
			title: "Mr",
			last_name: "Jones",
			did_register: false,
		},
		{
			id: 456,
			school_id: 5,
			email: "ddd@eee.fff",
			activation_token: "XXX",
			title: "Ms",
			last_name: "Jones2",
			did_register: false,
		},
	]);
});

test("Ensure date_edited updated successfully in database", async () => {
	subQuerier = (text, binds) => {
		if (text.indexOf("UPDATE cla_user") >= 0) {
			mockIsIncludeDateEdited = text.indexOf("date_edited") !== -1 ? true : false;
			return {
				rows: [
					{
						id: 456,
						school_id: binds[3],
						email: binds[0],
						activation_token: "XXX",
						title: binds[4],
						last_name: binds[2],
					},
				],
				rowCount: 1,
			};
		}
		return {
			rows: [{}],
			rowCount: 0,
		};
	};
	const result = await upsertWondeUsers(querier, 5, [
		{
			id: "abc",
			mis_id: "def",
			upi: "ghi",
			email: "aaa@bbb.ccc",
			first_name: "Bob",
			last_name: "Jones",
			title: "Mr",
		},
		{
			id: "abc2",
			mis_id: "def2",
			upi: "ghi2",
			email: "ddd@eee.fff",
			first_name: "Bob2",
			last_name: "Jones2",
			title: "Ms",
		},
	]);
	expect(result).toEqual([
		{
			id: 456,
			school_id: 5,
			email: "aaa@bbb.ccc",
			activation_token: "XXX",
			title: "Mr",
			last_name: "Jones",
			did_register: true,
		},
		{
			id: 456,
			school_id: 5,
			email: "ddd@eee.fff",
			activation_token: "XXX",
			title: "Ms",
			last_name: "Jones2",
			did_register: true,
		},
	]);
	expect(mockIsIncludeDateEdited).toBe(true);
});
