import React from "react";
import { shallow } from "enzyme";
import ImageLightBox from "../index";
import Lightbox from "react-image-lightbox";

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
		defaultPhotoIndex: 3,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test(`Component renders correctly`, async () => {
	const item = shallow(<ImageLightBox {...props} />);
	expect(item.containsMatchingElement(<Lightbox />)).toBe(true);
});

test(`Component renders correctly When some props are not passed`, async () => {
	delete props.imageTitle;
	delete props.imageCaption;
	delete props.clickOutsideToClose;
	const item = shallow(<ImageLightBox {...props} />);
	expect(item.containsMatchingElement(<Lightbox />)).toBe(true);
});

/** Test Methods */
test(`Test updateState method`, async () => {
	const item = shallow(<ImageLightBox {...props} />);
	item.setProps({ defaultPhotoIndex: 13 });
	expect(item.state("photoIndex")).toBe(13);
});

/** Test props of Lightbox*/
test(`Test props of Lightbox`, async () => {
	const item = shallow(<ImageLightBox {...props} />);
	item.setProps({ defaultPhotoIndex: 3 });
	expect(item.find("PreventRightClick").children().props().mainSrc).toEqual("htttp://dummy/image4");
	expect(item.find("PreventRightClick").children().props().nextSrc).toEqual("htttp://dummy/image5");
	expect(item.find("PreventRightClick").children().props().prevSrc).toEqual("htttp://dummy/image3");
});

test(`Test onMovePrevRequest prop of Lightbox`, async () => {
	const item = shallow(<ImageLightBox {...props} />);
	item.setState({ photoIndex: 2 });
	item.find("PreventRightClick").children().props().onMovePrevRequest();
	expect(item.state("photoIndex")).toBe(1);
});

test(`Test onMoveNextRequest prop of Lightbox`, async () => {
	const item = shallow(<ImageLightBox {...props} />);
	item.setState({ photoIndex: 2 });
	item.find("PreventRightClick").children().props().onMoveNextRequest();
	expect(item.state("photoIndex")).toBe(3);
});

test(`Getting the Image Title from prop function`, async () => {
	props.imageTitle = () => {
		return "Page 1";
	};
	const item = shallow(<ImageLightBox {...props} />);
	const imageTitle = item.instance().handleImageTile();
	expect(imageTitle).toBe("Page 1");
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

test(`Test handleClose event`, async () => {
	const item = shallow(<ImageLightBox {...props} />);
	item.instance().handleClose();
	expect(mockFunction).toHaveBeenCalled();
});
