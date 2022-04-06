const generateExcelFile = require("../../common/generateExcelFile");

let is_json_to_sheet_Called = false;
let is_book_new_Called = false;
let is_book_append_sheet_Called = false;
let is_write_Called = false;
let mockData = [];

jest.mock("xlsx", () => {
	return {
		utils: {
			json_to_sheet: () => {
				is_json_to_sheet_Called = true;
			},
			book_new: () => {
				is_book_new_Called = true;
			},
			book_append_sheet: () => {
				is_book_append_sheet_Called = true;
			},
		},
		write: () => {
			is_write_Called = true;
			return `<buffer 0000000>`;
		},
	};
});

function resetAll() {
	is_json_to_sheet_Called = false;
	is_book_new_Called = false;
	is_book_append_sheet_Called = false;
	is_write_Called = false;
	mockData = [
		{ id: 1, name: "test" },
		{ id: 2, name: "test" },
	];
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Generate excel file`, async () => {
	let fileName = "test";
	const result = generateExcelFile(mockData, fileName, undefined);
	expect(result.fileName).toEqual("test");
	expect(result.attachFiledata).not.toBeNull();
});
