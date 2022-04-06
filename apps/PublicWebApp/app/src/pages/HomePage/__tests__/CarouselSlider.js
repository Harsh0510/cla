// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import CarouselSlider from "../CarouselSlider";
import { shallow } from "enzyme";
import MockSlideData from "../../../mocks/MockSlideData";
let props;

function resetAll() {
	// mockFunction = jest.fn();
	props = {
		slideData: MockSlideData,
	};
}

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Component renders correctly`, async () => {
	const item = shallow(<CarouselSlider {...props} />);
	expect(item.find("SliderWrapper").length).toBe(1);
	expect(item.find("SlideImage").length).toBe(3);
});

test(`User see loader`, async () => {
	delete props.slideData;
	const item = shallow(<CarouselSlider {...props} />);
	expect(item.find("Loader").length).toBe(1);
});

test(`User is not redirected to a page when click on image`, async () => {
	delete props.slideData[0].link_url;
	const item = shallow(<CarouselSlider {...props} />);
	expect(item.find("SlideImage").length).toBe(3);
	expect(item.find("a").length).toBe(2);
});
