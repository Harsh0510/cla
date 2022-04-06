// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import ShareLinksTableRaw from "../ShareLinksTableRaw";
import mockMyCopies from "../../../mocks/MockMyCopies";

let props, eventHandle;

const setStateForDeactivateLink = jest.fn();

jest.mock("../../../assets/images/key.png", () => {});
jest.mock("../../../assets/images/reset.png", () => {});

function resetAll() {
	eventHandle = jest.fn();
	props = {
		copyOid: "1234",
		data: mockMyCopies.result[2],
		shareLinksLength: 0,
		latestCreatedShareLinks: Object.create(null),
		setStateForDeactivateLink,
		flyOutIndex: 1,
		itemIndex: 2,
		onCloseFlyOut: eventHandle,
		resetAccessCode: eventHandle,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test("Renders correctly", () => {
	const item = shallow(<ShareLinksTableRaw {...props} />);
	expect(item.find("ShareRow").length).toBe(1);
});

test("test Access code row Renders with correct background color", () => {
	const item = shallow(<ShareLinksTableRaw {...props} />);
	expect(item.find("ShareRow").props().backGroundColor).toEqual("white");

	item.setProps({ itemIndex: 3 });
	expect(item.find("ShareRow").props().backGroundColor).toEqual("#ccc");
});

test("When user clicks on reset code", () => {
	props.data.enable_extract_share_access_code = true;
	const item = shallow(<ShareLinksTableRaw {...props} />);
	item.setState({ isShowReveal: false });
	expect(item.find("ResetSection").length).toBe(1);

	item.instance().handleResetAccessCode();
	expect(eventHandle).toHaveBeenCalled();
});

test("Reveal code section renders correctly", () => {
	props.data.enable_extract_share_access_code = true;
	const item = shallow(<ShareLinksTableRaw {...props} />);
	expect(item.find("RevealSection").length).toBe(1);
});

test("When user clicks on reveal code", () => {
	props.data.enable_extract_share_access_code = true;
	const item = shallow(<ShareLinksTableRaw {...props} />);
	expect(item.find("RevealSection").length).toBe(1);

	item.instance().handleReveal();
	expect(item.find("ResetSection").length).toBe(1);
});

test("Show popup / hide popup", () => {
	const item = shallow(<ShareLinksTableRaw {...props} />);
	item.instance().hidePopUpInfo();
	expect(item.state().isShowPopUpInfo).toBe(false);
	item.instance().showPopUpInfo();
	expect(item.state().isShowPopUpInfo).toBe(true);
	item.instance().updateStatus();
	expect(item.state().isShowPopUpInfo).toBe(false);
});

test("When sharelink exist", () => {
	props.latestCreatedShareLinks[props.data.oid] = true;
	props.shareLinksLength = 2;
	const item = shallow(<ShareLinksTableRaw {...props} />);
	expect(item.find("DateTitle").find("Icon").length).toBe(1);
});

test("On Click Deactivate Button", () => {
	const item = shallow(<ShareLinksTableRaw {...props} />);
	item.find("DeactivateButton").simulate("click");
	expect(setStateForDeactivateLink).toBeCalled();
});

test("When shareLinksLength and latestCreatedShareLinks is not passed", () => {
	delete props.shareLinksLength;
	delete props.latestCreatedShareLinks;
	const item = shallow(<ShareLinksTableRaw {...props} />);
	expect(item.find("DateTitle").find("i").length).toBe(0);
});

test(`When flyOutIndex is not 1`, () => {
	const item = shallow(<ShareLinksTableRaw {...props} />);
	item.setProps({ flyOutIndex: 2 });
	item.find("DeactivateButton").simulate("click");
	item.instance().showPopUpInfo();
	expect(props.onCloseFlyOut).not.toHaveBeenCalled();
});
