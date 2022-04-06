const OLD_ENV = process.env;
const Context = require("../common/Context");

let ctx;
let mockAxiosCalls;
let mockResult;

function resetAll() {
	ctx = new Context();
	mockAxiosCalls = {};
	mockResult = {
		data: {
			books: [
				{
					isbn: "9780545010221",
					publisher: "Hodder",
					page_count: 100,
					title: "Some title here: First",
					authors: ["Lake Johnson, Mary", "John Smith"],
					publication_year: 2007,
					image: "https://dummyimage.com/600x400/c722c7/43499c&text=test",
					date_published: 2015,
				},
			],
		},
	};
}

/**
 * Clear everything before and after each test
 */
beforeEach(() => {
	jest.resetModules(); // most important - it clears the cache
	process.env = { ...OLD_ENV }; // make a copy
	resetAll();
});

afterEach(() => {
	process.env = OLD_ENV; // restore old env
	resetAll();
});

jest.mock("axios", () => {
	return function (params) {
		return mockResult;
	};
});

function getParams() {
	return {
		query: "test",
	};
}

test("Function renders correctly", async () => {
	const externalAssetRaw = require("../../core/search/external-assets");
	async function externalAsset(data) {
		let err = null;
		try {
			ctx.body = await externalAssetRaw(data, ctx);
		} catch (e) {
			err = e;
		}
		return err;
	}
	const data = getParams();
	expect(await externalAsset(data)).toBeNull();
});

test("Function renders correctly when CLA_ISBNDB_API_KEY is true ", async () => {
	process.env.CLA_ISBNDB_API_KEY = true;
	const externalAssetRaw = require("../../core/search/external-assets");
	async function externalAsset(data) {
		let err = null;
		try {
			ctx.body = await externalAssetRaw(data, ctx);
		} catch (e) {
			err = e;
		}
		return err;
	}
	const data = getParams();
	expect(await externalAsset(data)).toBeNull();
	expect(ctx.body).toEqual({
		results: [
			{
				isbn: "9780545010221",
				publisher: "Hodder",
				page_count: undefined,
				title: "Some title here: First",
				authors: ["Lake Johnson, Mary", "John Smith"],
				publication_year: null,
				dewey_class: undefined,
				image: "https://dummyimage.com/600x400/c722c7/43499c&text=test",
				publication_year: 2015,
			},
		],
	});
});

test("When valid isbn id provided ", async () => {
	process.env.CLA_ISBNDB_API_KEY = true;
	const externalAssetRaw = require("../../core/search/external-assets");
	async function externalAsset(data) {
		let err = null;
		try {
			ctx.body = await externalAssetRaw(data, ctx);
		} catch (e) {
			err = e;
		}
		return err;
	}
	const data = getParams();
	data.query = "9780545010221";
	expect(await externalAsset(data)).toBeNull();
	expect(ctx.body).toEqual({
		results: [
			{
				isbn: "9780545010221",
				publisher: "Hodder",
				page_count: undefined,
				title: "Some title here: First",
				authors: ["Lake Johnson, Mary", "John Smith"],
				publication_year: null,
				dewey_class: undefined,
				image: "https://dummyimage.com/600x400/c722c7/43499c&text=test",
				publication_year: 2015,
			},
		],
	});
});

test("When single book is found ", async () => {
	process.env.CLA_ISBNDB_API_KEY = true;
	mockResult = {
		data: {
			book: {
				isbn: "9780545010221",
				publisher: "Hodder",
				page_count: 100,
				title: "Some title here: First",
				authors: ["Lake Johnson, Mary", "John Smith"],
				publication_year: 2007,
				image: "https://dummyimage.com/600x400/c722c7/43499c&text=test",
			},
		},
	};
	const externalAssetRaw = require("../../core/search/external-assets");
	async function externalAsset(data) {
		let err = null;
		try {
			ctx.body = await externalAssetRaw(data, ctx);
		} catch (e) {
			err = e;
		}
		return err;
	}
	const data = getParams();
	data.query = "9780545010221";
	expect(await externalAsset(data)).toBeNull();
	expect(ctx.body).toEqual({
		results: [
			{
				isbn: "9780545010221",
				publisher: "Hodder",
				page_count: undefined,
				title: "Some title here: First",
				authors: ["Lake Johnson, Mary", "John Smith"],
				publication_year: null,
				dewey_class: undefined,
				image: "https://dummyimage.com/600x400/c722c7/43499c&text=test",
			},
		],
	});
});

test("When no book found", async () => {
	process.env.CLA_ISBNDB_API_KEY = true;
	const externalAssetRaw = require("../../core/search/external-assets");
	async function externalAsset(data) {
		let err = null;
		try {
			ctx.body = await externalAssetRaw(data, ctx);
		} catch (e) {
			err = e;
		}
		return err;
	}
	mockResult = [];
	const data = getParams();
	data.query = "9780545010221";
	expect(await externalAsset(data)).toBeNull();
	expect(ctx.body).toEqual({
		results: [],
	});
});
