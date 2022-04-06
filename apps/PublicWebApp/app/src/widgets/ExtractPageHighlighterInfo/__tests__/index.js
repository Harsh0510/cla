import React from "react";
import { shallow } from "enzyme";
import ExtractPageHighlighterInfo from "../index";
let props,
	mockPageIndex = null;

/**
 * Reset function
 */
function resetAll() {
	mockPageIndex = 1;
	props = {
		highlighterInfo: [
			{
				extract_id: 722,
				first_highlight_name: "Mr. Admin",
				first_highlight_date: "2020-11-09 13:07:48.788519+00",
				page: mockPageIndex,
			},
		],
		rotateDegree: 0,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders Correctly */
test(`Component renders Successfully`, async () => {
	const item = shallow(<ExtractPageHighlighterInfo {...props} />);
	expect(item.find("div").length).toBe(1);
});

test(`When extract page didnot have any highlight`, async () => {
	props.highlighterInfo = [];
	const item = shallow(<ExtractPageHighlighterInfo {...props} />);
	expect(item.find("div").length).toBe(0);
});

test(`When all highlight of specific extract is removed`, async () => {
	props.highlighterInfo = [
		{
			extract_id: 722,
			first_highlight_name: "",
			first_highlight_date: "2020-11-09 13:07:48.788519+00",
			page: mockPageIndex,
		},
	];
	const item = shallow(<ExtractPageHighlighterInfo {...props} />);
	expect(item.find("div").length).toBe(0);
});

test(`When highlight rotate 90 degree left`, async () => {
	props.rotateDegree = -90;
	const item = shallow(<ExtractPageHighlighterInfo {...props} />);
	expect(item.find("div").length).toBe(1);
	expect(item.find("div").props().style).toEqual({
		bottom: "2%",
		color: "#000000",
		fontSize: "0.5em",
		left: "2%",
		position: "absolute",
		right: "2%",
		textAlign: "center",
		textOrientation: "mixed",
		textShadow: "0 0 2px rgba(255, 255, 255, 0.5)",
		transform: "rotate(180deg)",
		userSelect: "none",
		writingMode: "lr-tb",
	});
});

test(`When highlight rotate 90 degree right`, async () => {
	props.rotateDegree = 90;
	const item = shallow(<ExtractPageHighlighterInfo {...props} />);
	expect(item.find("div").length).toBe(1);
	expect(item.find("div").props().style).toEqual({
		color: "#000000",
		fontSize: "0.5em",
		left: "2%",
		position: "absolute",
		right: "2%",
		textAlign: "center",
		textOrientation: "mixed",
		textShadow: "0 0 2px rgba(255, 255, 255, 0.5)",
		top: "2%",
		transform: "rotate(0deg)",
		userSelect: "none",
		writingMode: "lr-tb",
	});
});

test(`When highlight rotate 180 degree right`, async () => {
	props.rotateDegree = 180;
	const item = shallow(<ExtractPageHighlighterInfo {...props} />);
	expect(item.find("div").length).toBe(1);
	expect(item.find("div").props().style).toEqual({
		bottom: "2%",
		color: "#000000",
		fontSize: "0.5em",
		position: "absolute",
		right: "2%",
		textAlign: "center",
		textOrientation: "mixed",
		textShadow: "0 0 2px rgba(255, 255, 255, 0.5)",
		top: "2%",
		transform: "rotate(0deg)",
		userSelect: "none",
		writingMode: "tb-rl",
	});
});

test(`When highlight rotate 180 degree left`, async () => {
	props.rotateDegree = -180;
	const item = shallow(<ExtractPageHighlighterInfo {...props} />);
	expect(item.find("div").length).toBe(1);
	expect(item.find("div").props().style).toEqual({
		bottom: "2%",
		color: "#000000",
		fontSize: "0.5em",
		position: "absolute",
		right: "2%",
		textAlign: "center",
		textOrientation: "mixed",
		textShadow: "0 0 2px rgba(255, 255, 255, 0.5)",
		top: "2%",
		transform: "rotate(0deg)",
		userSelect: "none",
		writingMode: "tb-rl",
	});
});
