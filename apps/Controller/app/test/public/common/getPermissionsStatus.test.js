const { axios } = require("axios");
const getPermissionsStatusRaw = require("../../../core/public/common/getPermissionsStatus");
const context = require("../../common/Context");

let ctx, params;
let mockResult = null;

function resetAll() {
	ctx = new context();
	params = {
		isbn: "74008b4163eb4b7b94837d7db899f3f3",
	};
	mockResult = [{ reportType: "Not Found" }];
}

beforeEach(resetAll);
afterEach(resetAll);

jest.mock("axios", () => {
	return {
		get: () => {
			return {
				data: {
					usagesSummary: mockResult,
				},
			};
		},
	};
});

test("Returns Excluded if Excluded", async () => {
	mockResult = [{ reportType: "Excluded" }];
	expect(await getPermissionsStatusRaw(params.isbn)).toEqual("Excluded");
});
test("Response Covered if Permitted", async () => {
	mockResult = [{ reportType: "Permitted" }];
	expect(await getPermissionsStatusRaw(params.isbn)).toEqual("Covered");
});
test("Response Not Found if no Excluded or Permitted", async () => {
	mockResult = [{ reportType: "Not Found" }];
	expect(await getPermissionsStatusRaw(params.isbn)).toEqual("Not Found");
});

test("Not found when usagesSummary array not fetched", async () => {
	mockResult = null;
	expect(await getPermissionsStatusRaw(params.isbn)).toEqual("Not Found");
});
