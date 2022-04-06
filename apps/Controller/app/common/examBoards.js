const examBoards = ["EdExcel", "AQA", "CCEA", "CIE", "ICAAE", "OCR", "WJEC", "SQA"];

const examBoardsByName = Object.create(null);
for (const examBoard of examBoards) {
	examBoardsByName[examBoard] = true;
}

module.exports = {
	list: examBoards,
	byName: examBoardsByName,
};
