const ensure = require("#tvf-ensure");
const examBoards = require("../../../common/examBoards");
const { ensureCanCopy } = require("../../auth/common/canCopy");

module.exports = async function (ctx, params) {
	ensure.validIdentifier(ctx, params.course_oid, "Course");
	ensure.validAssetIdentifier(ctx, params.work_isbn13, "ISBN");
	ensure.positiveInteger(ctx, params.students_in_course, "Students in Course");
	if (params.exam_board && !examBoards.byName[params.exam_board]) {
		ctx.throw(400, "Exam Board not found");
	}
	ensure.nonEmptyStr(ctx, params.extract_title, "Extract Title");
	ctx.assert(Array.isArray(params.pages), 400, "Pages not provided");
	ctx.assert(params.pages.length > 0, 400, "No pages provided");

	const pagesMap = Object.create(null);
	for (const page of params.pages) {
		ensure.positiveInteger(ctx, page, "Page number");
		ctx.assert(!pagesMap[page], 400, "Duplicate page '" + page + "' provided");
		pagesMap[page] = true;
	}

	await ensureCanCopy(ctx);
};
