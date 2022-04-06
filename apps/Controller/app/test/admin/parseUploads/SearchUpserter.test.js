const SearchUpserter = require("../../../core/admin/parseUploads/SearchUpserter");

test("setting upsert endpoint works", async () => {
	const su = new SearchUpserter();
	su.setUpsertEndpoint("foo");
	expect(su.endpoint).toBe("foo");
});

test("setting axios works", async () => {
	const su = new SearchUpserter();
	su.setAxios("some axios");
	expect(su.axios).toBe("some axios");
});

test("performing an axios request works when product pass as blank", async () => {
	const su = new SearchUpserter();
	const axios = {};
	axios.post = (_) => new Promise((resolve, reject) => resolve("done"));
	su.setAxios(axios);
	const result = await su.upsert([]);
	expect(result).toBe("done");
});

test("performing an axios request works when pass all params", async () => {
	const su = new SearchUpserter();
	const axios = {};
	axios.post = (_) => new Promise((resolve, reject) => resolve("done"));
	su.setAxios(axios);
	const result = await su.upsert([], 1, true);
	expect(result).toBe("done");
});
