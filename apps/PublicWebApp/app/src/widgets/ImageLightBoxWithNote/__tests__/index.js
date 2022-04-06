import React from "react";
import { shallow } from "enzyme";
import ImageLightBox from "../index";
// import Lightbox from "react-image-lightbox";

let props, mockFunction;

jest.mock("react-image-lightbox", () => jest.fn());

function resetAll() {
	mockFunction = jest.fn();
	props = {
		imageTitle: null,
		imageCaption: null,
		images: ["htttp://dummy/image1", "htttp://dummy/image2", "htttp://dummy/image3", "htttp://dummy/image4", "htttp://dummy/image5"],
		clickOutsideToClose: true,
		onClose: mockFunction,
		photoIndex: 3,
		onMoveNextRequest: mockFunction,
		onMovePrevRequest: mockFunction,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test(`Component renders correctly`, async () => {
	const item = shallow(<ImageLightBox {...props} />);
	expect(item.find("ReactImageLightbox").length).toBe(1);
});

test(`Component renders correctly When some props are not passed`, async () => {
	delete props.imageTitle;
	delete props.imageCaption;
	delete props.clickOutsideToClose;
	const item = shallow(<ImageLightBox {...props} />);
	expect(item.find("ReactImageLightbox").length).toBe(1);
});

/** Test props of Lightbox*/
test(`Test props of Lightbox`, async () => {
	const item = shallow(<ImageLightBox {...props} />);
	item.setProps({ photoIndex: 3 });
	expect(item.find("ReactImageLightbox").length).toBe(1);
	expect(item.find("ReactImageLightbox").props().nextSrc).toEqual("htttp://dummy/image5");
	expect(item.find("ReactImageLightbox").props().prevSrc).toEqual("htttp://dummy/image3");
});

// test(`Test onMovePrevRequest prop of Lightbox`, async () => {
// 	const item = shallow(<ImageLightBox {...props} />);
// 	item.setState({ photoIndex: 2 });
// 	item.find("ReactImageLightBox").props().onMovePrevRequest();
// 	expect(mockFunction).toHaveBeenCalled();
// });

// test(`Test onMoveNextRequest prop of Lightbox`, async () => {
// 	const item = shallow(<ImageLightBox {...props} />);
// 	item.setState({ photoIndex: 2 });
// 	item.find("ReactImageLightBox").children().props().onMoveNextRequest();
// 	expect(mockFunction).toHaveBeenCalled();
// });

test(`Getting the Image Title from prop function`, async () => {
	props.imageTitle = () => {
		return "Page 1";
	};
	const item = shallow(<ImageLightBox {...props} />);
	const imageTitle = item.instance().handleImageTile();
	expect(imageTitle).toBe("Page 1");
});

test(`Test on close event`, async () => {
	const item = shallow(<ImageLightBox {...props} />);
	item.instance().handleClose();
	expect(mockFunction).toHaveBeenCalled();
});

test(`Test on close event`, async () => {
	delete props.onClose;
	const item = shallow(<ImageLightBox {...props} />);
	item.instance().handleClose();
	expect(mockFunction).not.toHaveBeenCalled();
});
test(`Getting the Image Title from prop string value`, async () => {
	props.imageTitle = "Page 1";
	const item = shallow(<ImageLightBox {...props} />);
	const imageTitle = item.instance().handleImageTile();
	expect(imageTitle).toBe("Page 1");
});

test(`Getting the Image Title as Null when not pass from props`, async () => {
	const item = shallow(<ImageLightBox {...props} />);
	const imageTitle = item.instance().handleImageTile();
	expect(imageTitle).toBe(null);
});

test("when user move previous", async () => {
	const item = shallow(<ImageLightBox {...props} />);
	const prevIndex = 12;
	item.instance().onMovePrevRequest(prevIndex);
	expect(mockFunction).toHaveBeenCalled();
});

test("when user move next", async () => {
	const item = shallow(<ImageLightBox {...props} />);
	const nextIndex = 14;
	item.instance().onMoveNextRequest(nextIndex);
	expect(mockFunction).toHaveBeenCalled();
});

test("when user rotate on right", async () => {
	const item = shallow(<ImageLightBox {...props} />);
	item.instance().onRotateRight();
	expect(item.state("rotateDegree")).toEqual(90);
});

test("when user rotate on left", async () => {
	const item = shallow(<ImageLightBox {...props} />);
	item.instance().onRotateLeft();
	expect(item.state("rotateDegree")).toEqual(-90);
});

test("when user rotate 360 degree on left", async () => {
	const item = shallow(<ImageLightBox {...props} />);
	item.setState({ rotateDegree: -270 });
	item.instance().onRotateLeft();
	expect(item.state("rotateDegree")).toEqual(0);
});

test("when user rotate 360 degree on right", async () => {
	const item = shallow(<ImageLightBox {...props} />);
	item.setState({ rotateDegree: 270 });
	item.instance().onRotateRight();
	expect(item.state("rotateDegree")).toEqual(0);
});
