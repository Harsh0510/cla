import getPageOffsetObject from "../getPageOffsetObject";

let data, mock_result;

function resetAll() {
	data = {
		page_offset_roman: 0,
		page_offset_arabic: 0,
	};
	mock_result = {
		roman: 0,
		arabic: 0,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test(`when pass data={page_offset_roman: 0, page_offset_arabic: 0}, return page offset object as {roman: 0. arabic: 0}`, async () => {
	data = {
		page_offset_roman: 0,
		page_offset_arabic: 0,
	};
	mock_result = {
		roman: 0,
		arabic: 0,
	};
	const pageOffsetString = getPageOffsetObject(data);
	expect(pageOffsetString).toEqual(mock_result);
});

test(`when pass data={}, return page offset object as {roman: 0. arabic: 0}`, async () => {
	data = {};
	mock_result = {
		roman: 0,
		arabic: 0,
	};
	const pageOffsetString = getPageOffsetObject(data);
	expect(pageOffsetString).toEqual(mock_result);
});

test(`when pass data={page_offset_roman: 2, page_offset_arabic: 4}, return page offset object as {roman: 0. arabic: 0}`, async () => {
	data = {
		page_offset_roman: 2,
		page_offset_arabic: 4,
	};
	mock_result = {
		roman: 2,
		arabic: 4,
	};
	const pageOffsetString = getPageOffsetObject(data);
	expect(pageOffsetString).toEqual(mock_result);
});
