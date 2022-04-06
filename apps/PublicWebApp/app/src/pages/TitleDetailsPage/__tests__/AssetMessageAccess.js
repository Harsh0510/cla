// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import AssetMessageAccess from "../AssetMessageAccess";

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

// Mock import
jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);
jest.mock("../../../common/withAuthConsumer", () => mockPassthruHoc);

let props;

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

function resetAll() {
	props = {
		isMobile: false,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test("Component renders correctly using mobile", async () => {
	props.isMobile = true;
	const item = shallow(<AssetMessageAccess {...props} />);
	expect(item.find("MobRow").length).toBe(1);
	expect(item.find("MobTextIconWrap").length).toBe(1);
});

test("Component renders correctly using desktop", async () => {
	props.isMobile = false;
	const item = shallow(<AssetMessageAccess {...props} />);
	expect(item.find("LockBook").length).toBe(1);
});

test("Return null when user can copy", async () => {
	props.isMobile = false;
	const item = shallow(<AssetMessageAccess {...props} />);
	expect(item.find("MobRow").length).toBe(0);
	expect(item.find("MobTextIconWrap").length).toBe(0);
});

test("When user has verified but can not approve using mobile", async () => {
	props = {
		isMobile: true,
	};
	const item = shallow(<AssetMessageAccess {...props} />);
	expect(item.find("MobRow").length).toBe(1);
	expect(item.find("MobTextIconWrap").length).toBe(1);
	expect(item.find("UserAssetAccessMessage").length).toBe(1);
	expect(item.find("CopyEditLinkButton").length).toBe(0);
});

test("When user has verified but can not approve using desktop", async () => {
	props = {
		isMobile: false,
	};
	const item = shallow(<AssetMessageAccess {...props} />);
	expect(item.find("LockBook").length).toBe(1);
	expect(item.find("UserAssetAccessMessage").length).toBe(1);
	expect(item.find("CopyEditLinkButton").length).toBe(0);
});

test("When props not  pass", async () => {
	const item = shallow(<AssetMessageAccess />);
	expect(item.find("LockBook").length).toBe(1);
	expect(item.find("UserAssetAccessMessage").length).toBe(1);
	expect(item.find("CopyEditLinkButton").length).toBe(0);
});
