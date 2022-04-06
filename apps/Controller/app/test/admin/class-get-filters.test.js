const classGetFiltersRaw = require("../../core/admin/class-get-filters");
const Context = require("../common/Context");

let ctx, data;
/**
 * Reset function - called before each test.
 */
function resetAll() {
	ctx = new Context();
	data = { filter_schools: null };
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

const resultForSchoolAdmin = {
	result: [
		{
			id: "exam_board",
			title: "Exam Board",
			data: [
				{
					id: "EdExcel",
					title: "EdExcel",
				},
				{
					id: "AQA",
					title: "AQA",
				},
				{
					id: "CCEA",
					title: "CCEA",
				},
				{
					id: "CIE",
					title: "CIE",
				},
				{
					id: "ICAAE",
					title: "ICAAE",
				},
				{
					id: "OCR",
					title: "OCR",
				},
				{
					id: "WJEC",
					title: "WJEC",
				},
				{
					id: "SQA",
					title: "SQA",
				},
			],
		},
		{
			id: "key_stage",
			title: "Key Stage",
			data: [
				{
					id: "Foundation Stage",
					title: "Foundation Stage",
				},
				{
					id: "KS1",
					title: "KS1",
				},
				{
					id: "KS2",
					title: "KS2",
				},
				{
					id: "KS3",
					title: "KS3",
				},
				{
					id: "KS4",
					title: "KS4",
				},
				{
					id: "KS5",
					title: "KS5",
				},
			],
		},
	],
};

const resultForClaAdmin = {
	result: [
		{
			id: "exam_board",
			title: "Exam Board",
			data: [
				{
					id: "EdExcel",
					title: "EdExcel",
				},
				{
					id: "AQA",
					title: "AQA",
				},
				{
					id: "CCEA",
					title: "CCEA",
				},
				{
					id: "CIE",
					title: "CIE",
				},
				{
					id: "ICAAE",
					title: "ICAAE",
				},
				{
					id: "OCR",
					title: "OCR",
				},
				{
					id: "WJEC",
					title: "WJEC",
				},
				{
					id: "SQA",
					title: "SQA",
				},
			],
		},
		{
			id: "key_stage",
			title: "Key Stage",
			data: [
				{
					id: "Foundation Stage",
					title: "Foundation Stage",
				},
				{
					id: "KS1",
					title: "KS1",
				},
				{
					id: "KS2",
					title: "KS2",
				},
				{
					id: "KS3",
					title: "KS3",
				},
				{
					id: "KS4",
					title: "KS4",
				},
				{
					id: "KS5",
					title: "KS5",
				},
			],
		},
		{
			id: "schools",
			title: "institutions",
			data: [
				{
					id: 1,
					title: "foo school",
				},
			],
		},
	],
};

const resultForTeacher = {
	result: [
		{
			id: "exam_board",
			title: "Exam Board",
			data: [
				{ id: "EdExcel", title: "EdExcel" },
				{ id: "AQA", title: "AQA" },
				{ id: "CCEA", title: "CCEA" },
				{ id: "CIE", title: "CIE" },
				{ id: "ICAAE", title: "ICAAE" },
				{ id: "OCR", title: "OCR" },
				{ id: "WJEC", title: "WJEC" },
				{ id: "SQA", title: "SQA" },
			],
		},
		{
			id: "key_stage",
			title: "Key Stage",
			data: [
				{ id: "Foundation Stage", title: "Foundation Stage" },
				{ id: "KS1", title: "KS1" },
				{ id: "KS2", title: "KS2" },
				{ id: "KS3", title: "KS3" },
				{ id: "KS4", title: "KS4" },
				{ id: "KS5", title: "KS5" },
			],
		},
	],
};

async function classGetFilters(data) {
	let err = null;
	try {
		ctx.body = await classGetFiltersRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function getValidRequest() {
	return {};
}

test(`Error when user not logged in`, async () => {
	ctx.sessionData = null;
	expect(await classGetFilters(data)).toEqual(new Error("401 ::: Unauthorized"));
});

test(`An unexpected error has occurred`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	data.filter_schools = [1, 2, 3];
	ctx.doAppQuery = (query, values) => {
		if (query.includes("name AS title")) {
			throw new Error("Unknow error");
		}
	};
	expect(await classGetFilters(data)).toEqual(new Error("500 ::: An unexpected error has occurred"));
});

test(`Success when user role as school-admin`, async () => {
	ctx.sessionData.user_role = "school-admin";
	data.filter_schools = [1];
	ctx.doAppQuery = (query, values) => {
		if (query.includes("name AS title")) {
			return { rows: [{ id: 1, title: "foo school" }] };
		}
	};
	expect(await classGetFilters(data)).toBeNull();
	expect(ctx.body).toMatchObject(resultForSchoolAdmin);
});

test(`Success when user role as cla-admin`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	data.filter_schools = [1];
	ctx.doAppQuery = (query, values) => {
		if (query.includes("name AS title")) {
			return { rows: [{ id: 1, title: "foo school" }] };
		}
	};
	expect(await classGetFilters(data)).toBeNull();
	expect(ctx.body).toMatchObject(resultForClaAdmin);
});

test(`Success when user roale as teacher`, async () => {
	ctx.sessionData.user_role = "teacher";
	data.filter_schools = [1];
	ctx.doAppQuery = (query, values) => {
		if (query.includes("name AS title")) {
			return { rows: [{ id: 1, title: "foo school" }] };
		}
	};
	expect(await classGetFilters(data)).toBeNull();
	expect(ctx.body).toMatchObject(resultForTeacher);
});
