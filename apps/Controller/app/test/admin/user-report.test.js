const userReportRaw = require("../../core/admin/user-report.js");
const Context = require("../common/Context");

let ctx;

const defaultAppQuery = (query) => {
	if (query.includes("_count_")) {
		return [{ _count_: "0" }];
	}
	return [];
};

const getDefaultSessionData = () => ({
	user_id: 5,
	user_role: "teacher",
	school_id: 123,
});

function resetAll() {
	ctx = new Context();
	ctx.sessionData = getDefaultSessionData();
	ctx.doAppQuery = defaultAppQuery;
}

beforeEach(resetAll);
afterEach(resetAll);

const ident = (x) => x.repeat(36);

describe("getFiltersRoute", () => {
	async function run(data) {
		let err = null;
		try {
			ctx.body = await userReportRaw.getFiltersRoute(data || {}, ctx);
		} catch (e) {
			err = e;
		}
		return err;
	}
	test("executes without error", async () => {
		ctx.doAppQuery = (query) => {
			if (query.includes("FROM course WHERE")) {
				return [{ id: "ABC", title: "DEF" }];
			}
			return defaultAppQuery(query);
		};
		const res = await run();
		expect(res).toBe(null);
		expect(ctx.body).toEqual({
			result: [
				{
					id: "class",
					title: "Class",
					data: [{ id: "ABC", title: "DEF" }],
				},
			],
		});
	});
	test("errors if not logged in", async () => {
		ctx.sessionData = null;
		const res = await run();
		expect(res).toEqual(new Error("401 ::: Unauthorized"));
	});
	test("errors if logged in as CLA admin but school not provided", async () => {
		ctx.sessionData = {
			user_id: 5,
			user_role: "cla-admin",
			school_id: 0,
		};
		const res = await run();
		expect(res).toEqual(new Error("400 ::: Institution invalid"));
	});
});

describe("getContentItemsRoute", () => {
	async function run(data) {
		let err = null;
		try {
			ctx.body = await userReportRaw.getContentItemsRoute(data || {}, ctx);
		} catch (e) {
			err = e;
		}
		return err;
	}
	test("executes without error", async () => {
		const res = await run();
		expect(res).toBe(null);
		expect(ctx.body).toEqual({
			data: [],
			unfiltered_count: 0,
		});
	});
	test("executes with empty class filter", async () => {
		let contains = false;
		ctx.doAppQuery = (query) => {
			if (query.includes(`course.oid IN (`)) {
				contains = true;
			}
			return defaultAppQuery(query);
		};
		const res = await run({
			class: [],
		});
		expect(res).toBe(null);
		expect(ctx.body).toEqual({
			data: [],
			unfiltered_count: 0,
		});
		expect(contains).toBe(false);
	});
	test("executes with class filter", async () => {
		let contains = false;
		ctx.doAppQuery = (query) => {
			if (query.includes(`course.oid IN ('${ident("a")}', '${ident("b")}', '${ident("c")}')`)) {
				contains = true;
			}
			return defaultAppQuery(query);
		};
		const res = await run({
			class: [ident("a"), ident("b"), ident("c")],
		});
		expect(res).toBe(null);
		expect(ctx.body).toEqual({
			data: [],
			unfiltered_count: 0,
		});
		expect(contains).toBe(true);
	});
	test("executes with offset and limit", async () => {
		let contains = false;
		ctx.doAppQuery = (query) => {
			if (query.includes("OFFSET 5") && query.includes("LIMIT 15")) {
				contains = true;
			}
			return defaultAppQuery(query);
		};
		const res = await run({
			class: [ident("a"), ident("b"), ident("c")],
			offset: 5,
			limit: 15,
		});
		expect(res).toBe(null);
		expect(ctx.body).toEqual({
			data: [],
			unfiltered_count: 0,
		});
		expect(contains).toBe(true);
	});
});

describe("getCopiesRoute", () => {
	async function run(data) {
		let err = null;
		try {
			ctx.body = await userReportRaw.getCopiesRoute(data || {}, ctx);
		} catch (e) {
			err = e;
		}
		return err;
	}
	test("executes without error", async () => {
		const res = await run();
		expect(res).toBe(null);
		expect(ctx.body).toEqual({
			data: [],
			unfiltered_count: 0,
		});
	});
	test("executes with empty sort parameter", async () => {
		let contains = false;
		ctx.doAppQuery = (query) => {
			if (query.includes(`COUNT(extract_access.id) ASC`)) {
				contains = true;
			}
			return defaultAppQuery(query);
		};
		const res = await run({
			sort: null,
		});
		expect(res).toBe(null);
		expect(contains).toBe(false);
		expect(ctx.body).toEqual({
			data: [],
			unfiltered_count: 0,
		});
	});
	test("executes with invalid non-string sort field parameter", async () => {
		let contains = false;
		ctx.doAppQuery = (query) => {
			if (query.includes(`COUNT(extract_access.id) ASC`)) {
				contains = true;
			}
			return defaultAppQuery(query);
		};
		const res = await run({
			sort: {
				field: [],
			},
		});
		expect(res).toBe(null);
		expect(contains).toBe(false);
		expect(ctx.body).toEqual({
			data: [],
			unfiltered_count: 0,
		});
	});
	test("executes with sort field and sort direction", async () => {
		let contains = false;
		ctx.doAppQuery = (query) => {
			if (query.includes(`COUNT(extract_access.id) ASC`)) {
				contains = true;
			}
			return defaultAppQuery(query);
		};
		const res = await run({
			sort: {
				field: "number_of_student_views",
				direction: "ASC",
			},
		});
		expect(res).toBe(null);
		expect(contains).toBe(true);
		expect(ctx.body).toEqual({
			data: [],
			unfiltered_count: 0,
		});
	});
	test("executes with limit and offset", async () => {
		let contains = false;
		ctx.doAppQuery = (query) => {
			if (query.includes("OFFSET 6") && query.includes("LIMIT 15")) {
				contains = true;
			}
			return defaultAppQuery(query);
		};
		const res = await run({
			sort: {
				field: "number_of_student_views",
				direction: "ASC",
			},
			limit: 15,
			offset: 6,
		});
		expect(res).toBe(null);
		expect(contains).toBe(true);
		expect(ctx.body).toEqual({
			data: [],
			unfiltered_count: 0,
		});
	});
});

describe("getAllRoute", () => {
	async function run(data) {
		let err = null;
		try {
			ctx.body = await userReportRaw.getAllRoute(data || {}, ctx);
		} catch (e) {
			err = e;
		}
		return err;
	}
	const getEmptyResult = () => ({
		unlockedTitles: 0,
		copiedTitles: 0,
		copiesTotal: 0,
		studentViews: 0,
	});
	test("executes without error", async () => {
		ctx.doAppQuery = (query) => {
			if (query.includes("AS assets") && query.includes("AS extracts")) {
				return [
					{
						assets: "0",
						extracts: "0",
					},
				];
			}
			return defaultAppQuery(query);
		};
		const res = await run();
		expect(res).toBe(null);
		expect(ctx.body).toEqual(getEmptyResult());
	});
});
