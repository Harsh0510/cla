// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import GenerateCopyRightImage from "../index";

let mockData, url, mockstrokeText, mockfill, mockfillText, mockWidth;

HTMLCanvasElement.prototype.getContext = () => {
	return {
		fillStyle: "",
		font: "",
		strokeText: mockstrokeText,
		fill: mockfill,
		fillText: mockfillText,
		measureText: function () {
			return { width: mockWidth };
		},
	};
};

HTMLCanvasElement.prototype.toDataURL = () => {
	return url;
};

/**
 * Reset function
 */
function resetAll() {
	mockData = "Test School. 6 February 2019";
	url = "https://dummyimage.com";
	mockstrokeText = jest.fn();
	mockfill = jest.fn();
	mockfillText = jest.fn();
	mockWidth = 72.04219055175781;
}

beforeEach(resetAll);
afterEach(resetAll);

/** function return correctly */
test("function return correctly", async () => {
	const item = shallow(<GenerateCopyRightImage data={mockData} />);
	expect(item.debug()).toEqual(url);
});

/**  Called stroketex, fill, and strok function when render function*/
test("component called canvas function", async () => {
	mockWidth = 1200;
	const item = shallow(<GenerateCopyRightImage data={mockData} />);
	expect(mockstrokeText).toHaveBeenCalled();
	expect(mockfillText).toHaveBeenCalled();
});

/** if no element find in body */
test("Generate the new canvas element", async () => {
	document.getElementById("canvas").remove();
	const item = shallow(<GenerateCopyRightImage data={mockData} />);
	let canvasEl = document.getElementById("canvas");
	let res = !canvasEl ? true : false;
	expect(res).toBe(false);
});
