const getLookupRaw = require("../../../core/auth/common/getLookup");
const Context = require("../../common/Context");

let ctx;

let mockReader;
let reader;
let mockDate;

jest.mock("maxmind", () => {
	return {
		open: () => {
			return mockReader;
		},
	};
});

function resetAll() {
	ctx = new Context();

	mockReader = null;
	mockDate = new Date();
	global.Date.now = jest.fn(() => mockDate);
}

beforeEach(resetAll);
afterEach(resetAll);

async function getLookup(data) {
	let err = null;
	try {
		ctx.body = await getLookupRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Error when unable to open db`, async () => {
	mockReader = null;
	const item = await getLookup();
	expect(item).toEqual(new Error("could not open maxmind db"));
});

test(`Returns lookup Successfully`, async () => {
	mockReader = {
		Reader: {
			metadata: {
				binaryFormatMajorVersion: 2,
				binaryFormatMinorVersion: 0,
				buildEpoch: "2019-04-29T14:07:53.000Z",
				databaseType: "GeoLite2-Country",
				description: { en: "GeoLite2 Country database" },
				ipVersion: 6,
				languages: ["de", "en", "es", "fr", "ja", "pt-BR", "ru", "zh-CN"],
				nodeByteSize: 6,
				nodeCount: 614704,
				recordSize: 24,
				searchTreeSize: 3688224,
				treeDepth: 128,
			},
		},
	};
	const item = await getLookup();
	expect(item).toBe(null);
	expect(ctx.body).not.toBe(null);
});

test(`Returns lookup Successfully when db is already opened`, async () => {
	const result = new Date();
	result.setDate(result.getDate() + 2);
	mockDate = result;
	const item = await getLookup();
	expect(item).toBe(null);
	expect(ctx.body).not.toBe(null);
});
