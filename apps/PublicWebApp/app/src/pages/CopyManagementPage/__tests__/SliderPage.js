import React from "react";
import { shallow } from "enzyme";
import SliderPage from "../SliderPage";

let props, mockHighlightsData;

// wait for async function
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

function resetAll() {
	(mockHighlightsData = [
		{
			colour: "#FFFF00",
			date_created: "2020-11-09T13:07:48.788Z",
			height: 30,
			oid: "0dad626ae3c3d1461ea3f546169f6ebae1e2",
			page: 1,
			position_x: 7.5,
			position_y: 7.5,
			width: 30,
		},
		{
			colour: "#FFFF00",
			date_created: "2020-11-09T13:07:48.788Z",
			height: 30,
			oid: "0dad626ae3c3d1461ea3f546169f6ebae1e2",
			page: 1,
			position_x: 7.5,
			position_y: 7.5,
			width: 30,
		},
	]),
		(props = {
			key: 1,
			pageNumber: 1,
			currentIndex: 1,
			pageImageUrl: "testyurl.png",
			copyRightTextImage: "Test Book. Publish 2019.",
			is_watermarked: false,
			highlights: mockHighlightsData,
		});
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<SliderPage {...props} />);
	expect(item.find("CustomControl").length).toBe(1);
});

/** Check right click prevent component present or not*/
test("Check right click prevent component present or not", async () => {
	const item = shallow(<SliderPage {...props} />);
	expect(item.find("PreventRightClick").length).toBe(1);
});

/** Check RetryableImage component present or not*/
test("Check RetryableImage component present or not", async () => {
	const item = shallow(<SliderPage {...props} />);
	expect(item.find("RetryableImage").length).toBe(1);
});

test("User seen the watermark image with copyright text", async () => {
	props.is_watermarked = true;
	const item = shallow(<SliderPage {...props} />);
	expect(item.find("RetryableImage").length).toBe(1);
});

test("When specific extract page didnot have any highlights", async () => {
	props.highlights = [];
	const item = shallow(<SliderPage {...props} />);
	expect(item.find("RetryableImage").length).toBe(1);
});

test("Check AseetPageNotAvailable component present or not", async () => {
	props.pageImageUrl = null;
	const item = shallow(<SliderPage {...props} />);
	expect(item.find("AseetPageNotAvailable").length).toBe(0);
});
