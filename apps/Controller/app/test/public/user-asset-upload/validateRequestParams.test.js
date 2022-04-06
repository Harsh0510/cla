const AppFile = require("tvf-app").File;

const validateRequestParamsRaw = require("../../../core/public/user-asset-upload/validateRequestParams");

const getParams = (params) =>
	Object.assign(
		{
			asset: new AppFile("abc.pdf"),
			publisher: "publisher xx",
			title: "title xx",
			isbn: "9780747532743",
			publication_date: 123123123123,
			page_count: 150,
			pages: [5, 10],
			authors: ["John Smith", "Emily Dickens"],
			upload_name: "upload name",
			is_copying_full_chapter: false,
			copy_ratio: 0.01,
		},
		params
	);

const ctx = {
	assert(test, status, message) {
		if (!test) {
			this.throw(status, message);
		}
	},
	throw(status, message) {
		const e = new Error(message);
		e.status = status;
		e.expose = status >= 400 && status < 500;
		throw e;
	},
};

const f = (params) => validateRequestParamsRaw(ctx, getParams(params || {}));

test("runs", () => {
	expect(f()).toBeUndefined();
	expect(
		validateRequestParamsRaw(ctx, {
			asset: new AppFile("abc.pdf"),
			publisher: "publisher xx",
			title: "title xx",
			isbn: "9780747532743",
			page_count: 150,
			pages: [5, 10],
			authors: ["John Smith", "Emily Dickens"],
			dewey_class: "dewey_class",
			image: "https://dummyimage.com/600x400/c722c7/43499c&text=test",
			upload_name: "upload name",
			is_copying_full_chapter: false,
			copy_ratio: 0.01,
		})
	).toBeUndefined();

	expect(() => f({ asset: "abc" })).toThrowError("Asset not provided");
	expect(() => f({ publisher: [] })).toThrowError("Publisher invalid");
	expect(() => f({ title: null })).toThrowError("Title not provided");
	expect(() => f({ isbn: "123123" })).toThrowError("ISBN not valid");
	expect(() => f({ publication_date: true })).toThrowError("Invalid publication date provided");
	expect(() => f({ page_count: -1 })).toThrowError("Page count must be positive");
	expect(() => f({ course_oid: "xxx" })).toThrowError("Course OID not valid");
	expect(() => f({ pages: null })).toThrowError("Pages not provided");
	expect(() => f({ pages: [] })).toThrowError("No pages provided");
	expect(() => f({ pages: [...Array(1200).keys()] })).toThrowError("Too many pages provided");
	expect(() => f({ pages: [-435] })).toThrowError("Page must not be negative");
	expect(() => f({ pages: [50, 60, 50] })).toThrowError("Duplicate page '50' provided - pages must not be repeated");
	expect(() => f({ pages: [9999] })).toThrowError("Page '9999' exceeds page count of book (150)");
	expect(() => f({ pages: [1, 2, 3, 4, 5], page_count: 2, page_range: "1-5" })).toThrowError(
		"Page range (1-5) exceeds page count of book (2). Please double check if the page range and count are correct."
	);
	expect(() => f({ authors: null })).toThrowError("Authors not provided");
	expect(() => f({ authors: [] })).toThrowError("No authors provided");
	expect(() => f({ authors: Array(100).fill("abc def") })).toThrowError("Too many authors provided");
	expect(() => f({ authors: ["Bob Smith", null] })).toThrowError("Author not provided");
	expect(() => f({ is_copying_full_chapter: "test" })).toThrowError("Copying full chapter must be a boolean");
	expect(() => f({ upload_name: null })).toThrowError("Upload name not provided");
	expect(() => f({ is_created_copy: true })).toThrowError("Students in Course invalid");
	expect(() => f({ is_created_copy: true, students_in_course: 10, exam_board: "not found" })).toThrowError("Exam Board not found");
});
