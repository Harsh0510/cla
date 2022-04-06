const examBoards = require("../../common/examBoards");

let mockResult;

function resetAll() {
	mockResult = {
		list: ["EdExcel", "AQA", "CCEA", "CIE", "ICAAE", "OCR", "WJEC", "SQA"],
		byName: {
			EdExcel: true,
			AQA: true,
			CCEA: true,
			CIE: true,
			ICAAE: true,
			OCR: true,
			WJEC: true,
			SQA: true,
		},
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Return the exambord in object value`, async () => {
	expect(examBoards).toEqual(mockResult);
});

test(`Return the exambord with list key`, async () => {
	expect(examBoards.list).toEqual(mockResult.list);
});

test(`Return the exambord with byName key`, async () => {
	expect(examBoards.byName).toEqual(mockResult.byName);
});

test(`Get the length of the key`, async () => {
	expect(Object.keys(examBoards).length).toBe(2);
});

test(`Match the examboard array`, async () => {
	for (let i = 0; i < examBoards.list.length; i++) {
		expect(mockResult.list[i]).toBe(examBoards.list[i]);
	}
});
