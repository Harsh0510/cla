const validateExtractRaw = require("../../../core/public/common/validateExtract");
const context = require("../../common/Context");
let ctx, params;

function resetAll() {
	ctx = new context();
	params = {
		course_oid: "60b6ae2e2111611f03332044d6b14c73bd4a",
		work_isbn13: "9781444144215",
		students_in_course: 1,
		extract_title: "test",
		pages: [1, 2],
		exam_board: "EdExcel",
	};
}

async function validateExtract(data) {
	let err = null;
	try {
		ctx.body = await validateExtractRaw(ctx, params);
	} catch (e) {
		err = e;
	}
	return err;
}

function getParams() {
	return params;
}

beforeEach(resetAll);
afterEach(resetAll);

test("Error when use pass invalid course id", async () => {
	let params = getParams();
	delete params["course_oid"];
	expect(await validateExtract(params)).toEqual(new Error("400 ::: Course not provided"));
});

test("Error when use pass negative course id", async () => {
	let params = getParams();
	params["course_oid"] = -1;
	expect(await validateExtract(params)).toEqual(new Error("400 ::: Course invalid"));
});

test("Error when use pass invalid work isbn13 number", async () => {
	let params = getParams();
	delete params["work_isbn13"];
	expect(await validateExtract(params)).toEqual(new Error("400 ::: ISBN not provided"));
});

test("Error when use pass wrong work isbn13 number", async () => {
	let params = getParams();
	params["work_isbn13"] = "60b6ae2e2111611f03332044d6b14c73bd4a";
	expect(await validateExtract(params)).toEqual(new Error("400 ::: ISBN is not valid"));
});

test("Error when use pass invalid students in course", async () => {
	let params = getParams();
	delete params["students_in_course"];
	expect(await validateExtract(params)).toEqual(new Error("400 ::: Students in Course invalid"));
});

test("Error when user provide wrong exam board", async () => {
	let params = getParams();
	params["exam_board"] = "test";
	expect(await validateExtract(params)).toEqual(new Error("400 ::: Exam Board not found"));
});

test("Error when user don't pass extract title", async () => {
	let params = getParams();
	delete params["extract_title"];
	expect(await validateExtract(params)).toEqual(new Error("400 ::: Extract Title not provided"));
});

test("Error when user don't pass pages", async () => {
	let params = getParams();
	delete params["pages"];
	expect(await validateExtract(params)).toEqual(new Error("400 ::: Pages not provided"));
});

test("Error when user don't pass pages in array", async () => {
	let params = getParams();
	params["pages"] = [];
	expect(await validateExtract(params)).toEqual(new Error("400 ::: No pages provided"));
});

test("Error when user  pass negative page id in pages array", async () => {
	let params = getParams();
	params["pages"] = [-1, 2];
	expect(await validateExtract(params)).toEqual(new Error("400 ::: Page number must be positive"));
});

test("Error when user  pass duplicate page id in pages array", async () => {
	let params = getParams();
	params["pages"] = [1, 1];
	expect(await validateExtract(params)).toEqual(new Error("400 ::: Duplicate page '1' provided"));
});
