const unlockImageUploadGetAllRaw = require("../../core/admin/unlock-image-upload-get-all");
const Context = require("../common/Context");

let ctx, unlockUploadImageResult;

let unlock_image_status = [
	{
		id: "pending",
		name: "Pending",
	},
	{
		id: "approved",
		name: "Approved",
	},
	{
		id: "rejected",
		name: "Rejected",
	},
	{
		id: "awaiting",
		name: "Awaiting",
	},
];

let statusByName = Object.create(null);
for (const status of unlock_image_status) {
	statusByName[status.id] = status.name;
}

function getValidRequest() {
	return {
		limit: 1,
		offset: 0,
		sort_field: "status",
		sort_direction: "A",
		query: "",
	};
}

function resetAll() {
	ctx = new Context();
	unlockUploadImageResult = [
		{
			id: 1,
			oid: "350c471e5fa73fc06125341caa7024ee9258",
			user_id: 605,
			date_created: "2020-03-30T12:00:55.914Z",
			status: "approved",
			date_closed: null,
			rejection_reason: null,
			pdf_isbn13: null,
			user_email_log: "brad.scott@cla.co.uk",
			school_name_log: "Custom House (CLA) School",
			url: "https://dummyimage.com/600x400/ff00ff/0000ff.jpg&text=undefined",
		},
	];
}

beforeEach(resetAll);
afterEach(resetAll);

async function unlockImageUploadGetAll(data) {
	let err = null;
	try {
		ctx.body = await unlockImageUploadGetAllRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Error when user is not a cla admin`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "teacher";
	expect(await unlockImageUploadGetAll(data)).toEqual(new Error("401 ::: Unauthorized"));
});

test(`Error when sort field is not specified`, async () => {
	const data = getValidRequest();
	delete data.sort_field;
	expect(await unlockImageUploadGetAll(data)).toEqual(new Error("400 ::: Sort field not found"));
});

test(`Error when sort field does not exist`, async () => {
	const data = getValidRequest();
	data.sort_field = "invalid_column";
	expect(await unlockImageUploadGetAll(data)).toEqual(new Error("400 ::: Sort field not found"));
});

test(`Error when sort direction is invalid`, async () => {
	const data = getValidRequest();
	data.sort_direction = "C";
	expect(await unlockImageUploadGetAll(data)).toEqual(new Error("400 ::: Invalid sort direction"));
});

test(`Error when query throws an error`, async () => {
	const data = getValidRequest();
	ctx.doAppQuery = (query) => {
		if (query.indexOf("ORDER") >= 0) {
			throw new Error("Error");
		} else {
			return { rows: [] };
		}
	};
	expect(await unlockImageUploadGetAll(data)).toEqual(new Error("400 ::: Unknown error"));
});

test(`Return data when request is well formed`, async () => {
	const data = getValidRequest();
	data.sort_direction = "D";
	ctx.doAppQuery = () => {
		return { rows: [{ _count_: 1 }], rowCount: 1 };
	};
	expect(await unlockImageUploadGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({ data: [{ _count_: 1, url: "https://dummyimage.com/600x400/ff00ff/0000ff.jpg&text=undefined" }], unfiltered_count: 1 });
});

test(`Invalid offset value as "123" provided`, async () => {
	const data = getValidRequest();
	data.limit = "123";
	expect(await unlockImageUploadGetAll(data, ctx)).toEqual(new Error(`400 ::: Limit invalid`));
	expect(ctx.body).toBeNull();
});

test(`Invalid offset value as -1 provided`, async () => {
	const data = getValidRequest();
	data.limit = -1;
	expect(await unlockImageUploadGetAll(data, ctx)).toEqual(new Error(`400 ::: Limit must be positive`));
	expect(ctx.body).toBeNull();
});

test(`Invalid offset value as 0 provided`, async () => {
	const data = getValidRequest();
	data.limit = 0;
	expect(await unlockImageUploadGetAll(data, ctx)).toEqual(new Error(`400 ::: Limit must be positive`));
	expect(ctx.body).toBeNull();
});

test(`Invalid offset value as "123" provided`, async () => {
	const data = getValidRequest();
	data.offset = "123";
	expect(await unlockImageUploadGetAll(data, ctx)).toEqual(new Error(`400 ::: Offset invalid`));
	expect(ctx.body).toBeNull();
});

test(`Invalid offset value as -1 provided`, async () => {
	const data = getValidRequest();
	data.offset = -1;
	expect(await unlockImageUploadGetAll(data, ctx)).toEqual(new Error(`400 ::: Offset must not be negative`));
	expect(ctx.body).toBeNull();
});

test(`return success result when no limit and offset provided with user cla-admin role`, async () => {
	const data = getValidRequest();
	ctx.appDbQuery = async function (query, values) {
		if (query.indexOf("COUNT(*)") !== -1) {
			return { rows: [{ _count_: 2 }] };
		}
		if (query.indexOf("ORDER BY") !== -1) {
			return {
				rows: unlockUploadImageResult,
			};
		}
	};
	delete data.limit;
	delete data.offset;
	expect(await unlockImageUploadGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({
		data: unlockUploadImageResult,
		unfiltered_count: 2,
	});
});

test(`Success when user pass query params null`, async () => {
	const data = getValidRequest();
	data.query = null;
	ctx.appDbQuery = async function (query, values) {
		if (query.indexOf("COUNT(*)") !== -1) {
			return { rows: [{ _count_: 2 }] };
		}
		if (query.indexOf("ORDER BY") !== -1) {
			return {
				rows: unlockUploadImageResult,
			};
		}
	};
	expect(await unlockImageUploadGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({
		data: unlockUploadImageResult,
		unfiltered_count: 2,
	});
});

test(`Error when user pass wrong query params`, async () => {
	const data = getValidRequest();
	data.query = 123;
	expect(await unlockImageUploadGetAll(data, ctx)).toEqual(new Error(`400 ::: Query invalid`));
});

test(`Success when user pass query params string`, async () => {
	const data = getValidRequest();
	data.query = "approved";
	ctx.appDbQuery = async function (query, values) {
		if (query.indexOf("COUNT(*)") !== -1) {
			return { rows: [{ _count_: 2 }] };
		}
		if (query.indexOf("ORDER BY") !== -1) {
			return {
				rows: unlockUploadImageResult,
			};
		}
	};
	expect(await unlockImageUploadGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({
		data: unlockUploadImageResult,
		unfiltered_count: 2,
	});
});

test(`Errror when all records count not found`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_id = 605;
	data.query = "approved";
	ctx.appDbQuery = async function (query, values) {
		if (query.indexOf("COUNT(*)") === -1) {
			expect(await unlockImageUploadGetAll(data, ctx)).toEqual(new Error(`400 ::: Unknown error`));
		}
	};
	ctx.doAppQuery = (query) => {
		throw new Error("Error");
	};
	expect(await unlockImageUploadGetAll(data)).toEqual(new Error("400 ::: Unknown error"));
});

// test(`Error when user pass invalid filter params`, async () => {
//	 const data = getValidRequest();
//	 data.filter = [];
//	 expect(await unlockImageUploadGetAll(data)).toEqual(new Error('400 ::: Invalid filter provided'));

//	 data.filter = "ABC";
//	 expect(await unlockImageUploadGetAll(data)).toEqual(new Error('400 ::: Invalid filter provided'));
//	 expect(ctx.body).toBeNull();
// });

// test(`Error when filter as Object`, async () => {
//	 const data = getValidRequest();
//	 const test = {};
//	 data.filter = Object.create(test);
//	 expect(await unlockImageUploadGetAll(data)).toEqual(new Error('400 ::: Unknown error'));
// });

// test(`Error when filter status as Array`, async () => {
//	 const data = getValidRequest();
//	 data.filter = { status: ['test'] };
//	 expect(await unlockImageUploadGetAll(data)).toEqual(new Error('400 ::: Invalid Status provided'));
// });

// test(`Error when To Many Filters Provided`, async () => {
//	 const data = getValidRequest();
//	 data.filter = { test: ['test'], test1: ['val1'], test2: ['val2'] };
//	 expect(await unlockImageUploadGetAll(data)).toEqual(new Error('400 ::: Too many filters provided'));
// });

// test(`Error when To Many Filters Provided`, async () => {
//	 const data = getValidRequest();
//	 // data.filter.status = [{approved:approved}];
//	 data.filter = { status: { approved: 'Approved' } };
// expect(await unlockImageUploadGetAll(data)).toBeNull();
// //expect(await unlockImageUploadGetAll(data)).toEqual(new Error('400 ::: Too many filters provided'));
// expect(ctx.body).toEqual({
//	 data: unlockUploadImageResult,
//	 unfiltered_count: 2
// });
// });
