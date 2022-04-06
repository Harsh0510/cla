import examBoards from "../examBoards";

let mockExamBoards;

function resetAll() {
	mockExamBoards = {
		EdExcel: true,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Return true when pass 'examBoards' with array value */
test(`Return true when pass 'examBoards' with array value`, async () => {
	const item = Array.isArray(examBoards) ? true : false;
	expect(item).toBe(true);
});

/** Return false when pass 'examBoards' as object */
test(`Return false when pass 'examBoards' as object`, async () => {
	const item = Array.isArray(mockExamBoards) ? true : false;
	expect(item).toBe(false);
});

/** Count 'examBoards' array length */
test(`Count 'examBoards' array length`, async () => {
	const item = examBoards;
	expect(item.length).toBe(8);
});

/** Match 'examBoards' array value  */
test(`Match 'examBoards' array value`, async () => {
	const item = examBoards;
	expect(item[0]).toBe("EdExcel");
	expect(item[1]).toBe("AQA");
	expect(item[2]).toBe("CCEA");
	expect(item[3]).toBe("CIE");
	expect(item[4]).toBe("ICAAE");
	expect(item[5]).toBe("OCR");
	expect(item[6]).toBe("WJEC");
	expect(item[7]).toBe("SQA");
});
