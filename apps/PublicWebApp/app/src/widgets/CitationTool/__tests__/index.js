import React from "react";
import { shallow } from "enzyme";
import CitationTool from "../index";
import MockBookCover from "../../../mocks/MockBookCover";

let props;

// wait for async function
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

function resetAll() {
	props = { resultData: MockBookCover[0] };
}

jest.mock("../../../common/customSetTimeout", () => {
	return function (method, time) {
		setTimeout(method, 10);
		return true;
	};
});

beforeEach(resetAll);
afterEach(resetAll);

test("When user see create citation link", async () => {
	const item = shallow(<CitationTool {...props} />);
	expect(item.find("CreateCitationLink").length).toBe(1);
	expect(item.find("CreateCitationLink").text()).toEqual("Create Citation");
	expect(item.state("isShowCitationPopup")).toEqual(false);
});

test("User clicks on create citation link and see the popup", async () => {
	const item = shallow(<CitationTool {...props} />);
	item.instance().onCopy("test", true);
	expect(item.state("showDidCopyIndicator")).toEqual(true);
	await wait(50);
	expect(item.state("showDidCopyIndicator")).toEqual(false);
	item.instance().doShowCitationPopup();
	expect(item.state("isShowCitationPopup")).toEqual(true);
	expect(item.find("Modal").length).toBe(1);
	expect(item.find("Modal").props().show).toEqual(true);
	expect(item.find("ModalHeader").text()).toEqual("Citation Created!");
});

test("User clicks on create citation link sevaral times", async () => {
	const item = shallow(<CitationTool {...props} />);
	item.instance().onCopy("test", true);
	expect(item.state("showDidCopyIndicator")).toEqual(true);
	await wait(50);
	expect(item.state("showDidCopyIndicator")).toEqual(false);
	item.instance().onCopy("test", true);
	expect(item.state("showDidCopyIndicator")).toEqual(true);
	await wait(50);
	expect(item.state("showDidCopyIndicator")).toEqual(false);
});

test("User clicks on create citation link and see the popup and close popup on clicking close", async () => {
	const item = shallow(<CitationTool {...props} />);
	item.instance().doShowCitationPopup();
	expect(item.state("isShowCitationPopup")).toEqual(true);
	item.instance().doHideCitationPopup();
	expect(item.state("isShowCitationPopup")).toEqual(false);
	expect(item.find("Modal").length).toBe(0);
});

test("Component unmount", async () => {
	const item = shallow(<CitationTool {...props} />);
	item.instance().doShowCitationPopup();
	expect(item.state("isShowCitationPopup")).toEqual(true);
	expect(item.find("Modal").length).toBe(1);
	item.instance().onCopy("test", false);
	await wait(50);
	item.instance().onCopy("test", true);
	item.instance().componentWillUnmount();
	expect(item.find("Modal").length).toBe(1);
});
