import getExtractPositionRaw from "../getExtractPosition";

let mockTop, mockLeft, mockWidth, mockHeight, wrapWidth, wrapHeight;

function resetAll() {
	(mockTop = 12), (mockLeft = 13), (mockWidth = 34), (mockHeight = 32), (wrapWidth = 44), (wrapHeight = 39);
}

beforeEach(resetAll);
afterEach(resetAll);

test(`when pass all attributes`, async () => {
	const pageOffsetString = getExtractPositionRaw(mockTop, mockLeft, mockWidth, mockHeight, wrapWidth, wrapHeight);
	expect(pageOffsetString).toEqual({ height: 82.05128205128206, left: 22.727272727272727, top: 17.94871794871795, width: 77.27272727272727 });
});

test(`when value of left & top attribute is less than zero`, async () => {
	mockLeft = -0.5;
	mockTop = -0.8;
	const pageOffsetString = getExtractPositionRaw(mockTop, mockLeft, mockWidth, mockHeight, wrapWidth, wrapHeight);
	expect(pageOffsetString).toEqual({ height: 82.05128205128206, left: 0, top: 0, width: 77.27272727272727 });
});
