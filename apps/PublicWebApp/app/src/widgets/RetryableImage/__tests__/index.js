// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import RetryableImage from "../index";

let mockOnEventListenerCalled, mockFunction;

/**mock for image */
jest.mock("../../../assets/images/cla_logo.png", () => jest.fn());
jest.mock("../../../common/reactCreateRef", () => {
	return function () {
		return {
			current: {
				addEventListener: (eventName, callback) => {
					mockOnEventListenerCalled(eventName, callback);
				},
			},
		};
	};
});

/** local objects */
let mockSrc, mockTitle, mockAltText, onOpen;

/**wait for async function */
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

/** Reset function */
function resetAll() {
	mockFunction = jest.fn();
	mockOnEventListenerCalled = () => {};
	mockSrc = "https://dummyimage.com/1200x1000/ee0000/333.png&text=1";
	mockTitle = "image1";
	mockAltText = "image 1";
	onOpen = mockFunction;
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly with mount*/
test("Component renders correctly with mount", async () => {
	const item = mount(<RetryableImage src={mockSrc} title={mockTitle} alt={mockAltText} />);
	expect(item.find("img").length).toBe(1);
});

/** Render addEventListener method have been called */
test("Render addEventListener method have been called", async () => {
	mockOnEventListenerCalled = jest.fn();
	mockSrc = "chrome//test/settings/12133.png";
	const item = shallow(<RetryableImage src={mockSrc} title={mockTitle} alt={mockAltText} />);
	expect(mockOnEventListenerCalled).toBeCalled();
});

/** retriveimage attempt firsttime */
test("retriveimage attempt firsttime", async () => {
	let src, retriveimage_src;
	mockOnEventListenerCalled = jest.fn();
	mockSrc = "chrome//test/settings/12133.png";
	const item = shallow(<RetryableImage src={mockSrc} title={mockTitle} alt={mockAltText} />);
	expect(mockOnEventListenerCalled).toBeCalled();
	src = item.state().src;
	await item.instance().retriveimage();
	retriveimage_src = item.state().src;
	// await wait(100);
	expect(src).not.toEqual(retriveimage_src);
	expect(item.state().attempt_count).toEqual(1);
});

/** retriveimage attempt firsttime more than 3 times*/
test("retriveimage attempt firsttime more than 3 times", async () => {
	let src, retriveimage_src;
	mockOnEventListenerCalled = jest.fn();
	mockSrc = "chrome//test/settings/12133.png";
	const item = shallow(<RetryableImage src={mockSrc} title={mockTitle} alt={mockAltText} />);
	expect(mockOnEventListenerCalled).toBeCalled();

	//Update state value and set the attempt count as 3
	item.setState({
		attempt_count: 3,
		src: item.props().src + Date.now(),
		orig_src: item.props().src,
	});

	//atempt 4
	src = item.state().src;
	await item.instance().retriveimage();
	retriveimage_src = item.state().src;
	expect(src).toEqual(retriveimage_src);
	expect(item.state().attempt_count).toEqual(3);
});

/** Render addEventListener method have been called */
test("Render addEventListener method have been called when change the props", async () => {
	mockOnEventListenerCalled = jest.fn();
	mockSrc = "chrome//test/settings/12133.png";
	let mockSrc_New = "chrome//test/settings/12134.png";
	const item = shallow(<RetryableImage src={mockSrc} title={mockTitle} alt={mockAltText} />);
	expect(mockOnEventListenerCalled).toBeCalled();
	item.setProps({ src: mockSrc_New });
	expect(mockOnEventListenerCalled).toBeCalled();
});

/** Called retriveimage method have been called when image error event occur */
test("Called retriveimage method have been called when image error event occur", async () => {
	let mockSrc_New = "chrome//test/settings/12134.png";
	let providedEventName;
	let providedCallback;
	mockSrc = "chrome//test/settings/12133.png";
	mockOnEventListenerCalled = (eventName, callback) => {
		providedEventName = eventName;
		providedCallback = callback;
	};
	const item = shallow(<RetryableImage src={mockSrc} title={mockTitle} alt={mockAltText} />);
	expect(providedEventName).toBe("error");
	expect(typeof providedCallback).toBe("function");
	providedCallback();
	await wait(1500);
	item.update();
	expect(item.state().src.indexOf("_cla_cache_buster_=") !== -1).toBe(true);
	expect(item.state().attempt_count).toBe(1);
	//Props value changes for render componentDidUpdate event
	item.setProps({ src: mockSrc_New });
	expect(providedEventName).toBe("error");
	expect(typeof providedCallback).toBe("function");
	providedCallback();
	await wait(2500);
	item.update();
	expect(item.state().src.indexOf("_cla_cache_buster_=") !== -1).toBe(true);
	expect(item.state().attempt_count).toBe(2);
});

test(`Test onClick Event of Image`, async () => {
	const item = shallow(<RetryableImage src={mockSrc} title={mockTitle} alt={mockAltText} />);
	item.setProps({ onOpen: mockFunction });
	const image = item.find("PageImage");
	image.simulate("click");
	expect(mockFunction).toHaveBeenCalled();
});

test(`Test handleOnOpen Function`, async () => {
	const item = shallow(<RetryableImage src={mockSrc} title={mockTitle} alt={mockAltText} />);
	item.instance().handleOnOpen();
	expect(item.props("onOpen")).not.toEqual("function");
	expect(mockFunction).not.toHaveBeenCalled();
});
