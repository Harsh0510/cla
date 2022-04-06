import React from "react";
import { shallow, mount } from "enzyme";
import Slider from "../Slider";
import MockSliderItems from "../../../mocks/MockSliderItems";

let props;

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

// Mock import
jest.mock("react-resize-detector/build/withPolyfill", () => {
	return { withResizeDetector: mockPassthruHoc };
});

function resetAll() {
	props = {
		numHighlighted: 2,
		maxOnScreen: 10,
		targetTranslate: -2,
		totalItems: 14,
		transition: null,
		items: MockSliderItems,
		width: 850.0625,
		copyExcludedPagesMap: { 2: true, 12: true, 26: true, 35: true, 36: true, 49: true, 60: true, 73: true, 74: true },
		handleCheckBoxEvent: jest.fn(),
		page_offset_roman: 0,
		page_offset_arabic: 0,
	};
}

// wait for async function
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Component renders successfully`, async () => {
	const item = shallow(<Slider {...props} />);
	expect(item.find("SliderImagesDiv").length).toBe(16);
});

test(`When a dummy image is passed in props`, async () => {
	props.items = [
		{ dummy: true, key: 1000000 },
		{
			src: "https://occclastagestorage.blob.core.windows.net/pagepreviews/9780008189556/1.png",
			selected: false,
			index: 2,
			key: 2,
		},
		{
			src: "https://occclastagestorage.blob.core.windows.net/pagepreviews/9780008189556/2.png",
			selected: false,
			index: 3,
			key: 3,
		},
	];
	const item = shallow(<Slider {...props} />);
	expect(item.find("SliderImagesDiv").length).toBe(2);
	expect(item.find("Dummy").length).toBe(1);
});

test(`When a dummy image is passed in props`, async () => {
	props.items = [
		{
			src: null,
			selected: false,
			index: 4,
			key: 4,
		},
		{
			src: "https://occclastagestorage.blob.core.windows.net/pagepreviews/9780008189556/2.png",
			selected: false,
			index: 5,
			key: 5,
		},
	];
	const item = shallow(<Slider {...props} />);

	expect(item.find("AssetPageNotAvailable").length).toBe(1);
});

test(`When width is smaller than 370`, async () => {
	props.width = 320;
	props.maxOnScreen = 2;

	const item = shallow(<Slider {...props} />);
	expect(item.find("SliderImagesDiv").length).toBe(16);
});

test("User clicks on checkbox", async () => {
	props.items = [
		{
			src: "https://occclastagestorage.blob.core.windows.net/pagepreviews/9780008189556/2.png",
			selected: false,
			index: 4,
			key: 4,
		},
		{
			src: "https://occclastagestorage.blob.core.windows.net/pagepreviews/9780008189556/2.png",
			selected: false,
			index: 5,
			key: 5,
		},
	];
	const event = { preventDefault: jest.fn(), target: { value: 2 } };
	const item = shallow(<Slider {...props} />);
	const checkbox = item.find("SliderImagesDiv").first().children().find("CustomControlInput");
	checkbox.simulate("change", event);
	await wait(30);
	item.update();
	item.instance().forceUpdate();
	expect(props.handleCheckBoxEvent).toHaveBeenCalled();
});
