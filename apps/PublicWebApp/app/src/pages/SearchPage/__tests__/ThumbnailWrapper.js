// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";
import React from "react";
import { shallow, mount } from "enzyme";
import ThumbnailWrapper from "../ThumbnailWrapper";
import MockSearchResults from "../../../mocks/MockSearchResults";

let props, isCalledSetDefaultCoverImage;

jest.mock("../../../common/setDefaultCoverImage.js", () => {
	return () => {
		isCalledSetDefaultCoverImage = true;
	};
});

/**
 * Reset function
 */
function resetAll() {
	props = {
		asset: MockSearchResults.results[0],
	};
	isCalledSetDefaultCoverImage = false;
}

beforeEach(resetAll);
afterEach(resetAll);

test("Render the component correctly for unlocked books", async () => {
	props.asset.is_unlocked = true;
	const item = shallow(<ThumbnailWrapper {...props} />);
	expect(item.find("ThumbnailContainer").length).toBe(1);
	expect(item.find("Thumbnail").length).toBe(1);
	expect(item.find("ThumbnailOverlay").length).toBe(0);
	expect(item.find("LockIcon").length).toBe(0);
});

test("Render the component correctly for locked books", async () => {
	props.asset.is_unlocked = false;
	props.isMobile = false;
	const item = shallow(<ThumbnailWrapper {...props} />);
	expect(item.find("ThumbnailContainer").length).toBe(1);
	expect(item.find("Thumbnail").length).toBe(1);
	expect(item.find("ThumbnailOverlay").length).toBe(1);
	expect(item.find("LockIcon").length).toBe(1);
});

test("Pass asset as null", async () => {
	props.asset = null;
	const item = shallow(<ThumbnailWrapper {...props} />);
	expect(item.debug()).toBe("");
});

test("Pass asset title as null", async () => {
	props.asset.title = null;
	props.asset.is_unlocked = true;
	const item = shallow(<ThumbnailWrapper {...props} />);
	expect(item.find("ThumbnailContainer").length).toBe(1);
	expect(item.find("Thumbnail").props().alt).toBe("");
	expect(item.find("Thumbnail").length).toBe(1);
	expect(item.find("ThumbnailOverlay").length).toBe(0);
	expect(item.find("LockIcon").length).toBe(0);
});

test("When asset does not have cover image ", async () => {
	props.asset.is_unlocked = true;
	const item = shallow(<ThumbnailWrapper {...props} />);
	item.find("Thumbnail").simulate("error");
	expect(isCalledSetDefaultCoverImage).toBeTruthy();
});
