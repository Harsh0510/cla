const OLD_ENV = process.env;
let mockPosts, mockQuery;

jest.mock("axios", () => {
	return {
		get: async (url) => {
			if (url.indexOf("/posts?") === 0) {
				return mockPosts;
			} else if (url.indexOf("/categories?") != -1) {
				return mockCategories;
			}
			return mockPosts;
		},
	};
});

function resetAll() {
	mockSelectResult = {
		rows: [
			{
				names: ["www.google.com"],
			},
		],
		rowCount: 1,
	};
	mockCategories = {
		data: [
			{ id: 16, name: "Authors and Publishers" },
			{ id: 8, name: "CLA Education Licence" },
			{ id: 13, name: "Copyright and Intellectual Property" },
			{ id: 14, name: "Edtech and Digital" },
			{ id: 11, name: "Education Platform" },
			{ id: 12, name: "Further Education" },
			{ id: 15, name: "Libraries" },
			{ id: 17, name: "Reading and Literacy" },
			{ id: 9, name: "Teaching Tips and Resources" },
			{ id: 1, name: "Uncategorised" },
		],
	};
	mockPosts = {
		data: [
			{
				id: 10,
				image_relative_url: `/g/400/200`,
				title: `My first post`,
				author_name: `John Smith`,
				date_created: "01/03/2020",
				relative_url: `/link/to/blog/10`,
				category_score: 50,
				categories: ["www.google.com"],
				link: "https://occclaepblog.azurewebsites.net/2020/06/17/teaching-english-history-classrooms/",
			},
			{
				id: 20,
				image_relative_url: `/g/500/700`,
				title: `Some other post title can go here`,
				author_name: `Mark Markson`,
				date_created: "02/03/2020",
				relative_url: `/link/to/blog/20`,
				category_score: 40,
				categories: ["www.google"],
				link: "https://occclaepblog.azurewebsites.net/2020/06/17/teaching-english-history-classrooms/",
			},
			{
				id: 30,
				image_relative_url: `/g/400/400`,
				title: `Here is a third title!`,
				author_name: `Rick Rickson`,
				date_created: "03/03/2020",
				relative_url: `/link/to/blog/30`,
				category_score: 30,
				categories: ["www"],
				link: "https://occclaepblog.azurewebsites.net/2020/06/17/teaching-english-history-classrooms/",
			},
		],
	};
	mockQuery = async (query) => {
		const text = query.replace(/[\s\t\n\r]+/g, " ").trim();
		if (text.indexOf("SELECT") !== -1) {
			return mockSelectResult;
		} else if (text.indexOf("INSERT INTO cached_latest_blog_post") === 0) {
			return true;
		} else if (text.indexOf("DELETE FROM cached_latest_blog_post") === 0) {
			return true;
		}
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

test(`Test blogUpsert from api`, async () => {
	process.env.EP_BLOG_URL = "https://occclaepblog.azurewebsites.net";
	const blogApiRaw = require("../../common/blogApi");
	const data = await blogApiRaw.blogUpsert(mockQuery);
	expect(data).toEqual(undefined);
});

test(`blogUpsertByCategoryNames returns if categoryNames are null`, async () => {
	process.env.EP_BLOG_URL = "https://occclaepblog.azurewebsites.net";
	const blogApiRaw = require("../../common/blogApi");
	const categoryNames = [""];
	const data = await blogApiRaw.blogUpsertByCategoryNames(mockQuery, categoryNames);
	expect(data).toEqual(undefined);
});

test(`Test blogUpsertByCategoryNames from api`, async () => {
	process.env.EP_BLOG_URL = "https://occclaepblog.azurewebsites.net";
	const blogApiRaw = require("../../common/blogApi");
	mockPosts = {
		data: [
			{
				id: 10,
				image_relative_url: `/g/400/200`,
				title: "",
				author_name: `John Smith`,
				date_created: "01/03/2020",
				relative_url: `/link/to/blog/10`,
				category_score: 50,
				categories: ["www.google.com"],
				link: "https://occclaepblog.azurewebsites.net/2020/06/17/teaching-english-history-classrooms/",
				jetpack_featured_media_url: "/wp-content/uploads/2020/06/autumn-tree-1382832-639x426-1.jpg",
				_embedded: {
					author: [{ name: "author_name" }],
				},
			},
		],
	};
	const categoryNames = ["www.google.com", "yahoo.com"];
	const data = await blogApiRaw.blogUpsertByCategoryNames(mockQuery, categoryNames);
	expect(data).toEqual(undefined);
});

test(`Test blogUpsertByCategoryNames from api when EP_BLOG_URL is not set`, async () => {
	process.env.EP_BLOG_URL = null;
	const blogApiRaw = require("../../common/blogApi");
	const categoryNames = ["www.google.com", "yahoo.com"];
	const data = await blogApiRaw.blogUpsertByCategoryNames(mockQuery, categoryNames);
	expect(data).toEqual(undefined);
});
