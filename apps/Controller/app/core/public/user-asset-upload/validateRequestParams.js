const AppFile = require("#tvf-app").File;
const ensure = require("#tvf-ensure");
const examBoards = require("../../../common/examBoards");

module.exports = (ctx, params) => {
	ctx.assert(params.asset instanceof AppFile, 400, "Asset not provided");
	ensure.nonEmptyStr(ctx, params.publisher, "Publisher");
	ensure.nonEmptyStr(ctx, params.title, "Title");
	ensure.nonEmptyStr(ctx, params.upload_name, "Upload name");
	ensure.validIsbn13(ctx, params.isbn, "ISBN");

	if (params.is_created_copy) {
		ensure.positiveInteger(ctx, params.students_in_course, "Students in Course");
		if (params.exam_board && !examBoards.byName[params.exam_board]) {
			ctx.throw(400, "Exam Board not found");
		}
	}

	if (typeof params.publication_date !== "undefined") {
		// unix timestamp in seconds
		ctx.assert(typeof params.publication_date === "number", 400, "Invalid publication date provided");
		ctx.assert(Number.isInteger(params.publication_date), 400, "Invalid publication_date");
	}

	ensure.positiveInteger(ctx, params.page_count, "Page count");

	if (typeof params.dewey_class !== "undefined") {
		ensure.nonEmptyStr(ctx, params.dewey_class, "Dewey class");
	}

	if (typeof params.image !== "undefined") {
		ensure.nonEmptyStr(ctx, params.image, "Image");
		ctx.assert(params.image.match(/^https?:\/\//), 400, "Image not a URL");
	}

	if (params.course_oid) {
		ensure.validIdentifier(ctx, params.course_oid, "Course OID");
	}

	if (typeof params.is_copying_full_chapter !== "undefined") {
		ctx.assert(typeof params.is_copying_full_chapter === "boolean", 400, "Copying full chapter must be a boolean");
	}

	ctx.assert(Array.isArray(params.pages), 400, "Pages not provided");
	ctx.assert(params.pages.length > 0, 400, "No pages provided");
	ctx.assert(params.pages.length <= 1000, 400, "Too many pages provided");

	const uniquePages = Object.create(null);
	for (const pg of params.pages) {
		ensure.nonNegativeInteger(ctx, pg, "Page");
		ctx.assert(pg < 10000, 400, "Page " + pg + " too high");
		ctx.assert(!uniquePages[pg], 400, "Duplicate page '" + pg + "' provided - pages must not be repeated");

		if (pg > params.page_count) {
			if (params.pages.length === 1) {
				ctx.assert(false, 400, "Page '" + pg + "' exceeds page count of book (" + params.page_count + ")");
			} else {
				ctx.assert(
					false,
					400,
					"Page range (" +
						params.page_range +
						") exceeds page count of book (" +
						params.page_count +
						"). Please double check if the page range and count are correct."
				);
			}
		}

		uniquePages[pg] = true;
	}

	ctx.assert(Array.isArray(params.authors), 400, "Authors not provided");
	ctx.assert(params.authors.length > 0, 400, "No authors provided");
	ctx.assert(params.authors.length <= 20, 400, "Too many authors provided");

	const uniqueAuthors = Object.create(null);
	for (const author of params.authors) {
		ensure.nonEmptyStr(ctx, author, "Author");
		uniqueAuthors[author] = true;
	}

	ctx.assert(Object.keys(uniqueAuthors).length > 0, 400, "Authors not provided");
};
