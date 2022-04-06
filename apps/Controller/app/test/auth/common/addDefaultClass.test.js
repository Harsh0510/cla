const addDefaultClassRaw = require(`../../../core/auth/common/addDefaultClass`);
const Context = require("../../common/Context");

let mockCounter = 1;
let mockDefaultClass = "Test";

function getParams() {
	return {
		id: 7850,
		is_token_expired: false,
		title: "Mr",
		last_name: "Test",
		default_class_year_group: "New",
		default_class_exam_board: "AQA",
		school_id: 26124,
		registered_with_approved_domain: true,
	};
}

let mockDefaultClassName;

function resetAll() {
	ctx = new Context();
	mockCounter = 1;
	mockDefaultClass = "Test";
	ctx.appDbQuery = async (query, data) => {
		const queryText = query.replace(/[\s\t\n\r]+/g, " ").trim();
		if (queryText.includes("INSERT INTO course")) {
			if (mockCounter === -1) {
				throw new Error("Unknow Error");
			}
			if (mockCounter === 1) {
				return;
			}
			if (mockCounter > 1) {
				if (data[0] === mockDefaultClass) {
					return;
				}
			}
			throw new Error(`duplicate key value violates unique constraint "XXX"`);
		}
		throw "Should never come here";
	};
}

beforeEach(resetAll);
afterEach(resetAll);

async function addDefaultClass(data) {
	let err = null;
	try {
		ctx.body = await addDefaultClassRaw(ctx, data);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Return false when unknowerror`, async () => {
	mockCounter = -1;
	const data = getParams();
	expect(await addDefaultClass(data)).toEqual(new Error("Unknow Error"));
	expect(ctx.body).toBeNull();
});

test(`Return true when default class exists`, async () => {
	mockCounter = 1;
	const data = getParams();
	expect(await addDefaultClass(data)).toBeNull();
});

test(`Default Enter the Class`, async () => {
	const data = getParams();
	mockCounter = 1;
	mockDefaultClass = `${data.title} ${data.last_name}'s Default class`;
	expect(await addDefaultClass(data)).toBeNull();
});

test(`When default class alreday exists with same class count as 1`, async () => {
	const data = getParams();
	mockCounter = 2;
	mockDefaultClass = `${data.title} ${data.last_name}'s Default class (2)`;
	expect(await addDefaultClass(data)).toBeNull();
});

test(`When default_class_year_group and default_class_exam_board are null`, async () => {
	const data = getParams();
	data.default_class_year_group = null;
	data.default_class_exam_board = null;
	mockCounter = 2;
	mockDefaultClass = `${data.title} ${data.last_name}'s Default class (2)`;
	expect(await addDefaultClass(data)).toBeNull();
});
