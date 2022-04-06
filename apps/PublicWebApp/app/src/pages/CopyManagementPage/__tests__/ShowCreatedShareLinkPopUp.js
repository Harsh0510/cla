import React from "react";
import { shallow } from "enzyme";
import ShowCreatedShareLinkPopUp from "../ShowCreatedShareLinkPopUp";
import MockMyCopies from "../../../mocks/MockMyCopies";

let props;

function resetAll() {
	props = {
		shareLink: MockMyCopies.result[2],
		show: false,
		hideModal: true,
		workDetails: {
			title: "title",
		},
		copiesData: [MockMyCopies.result[0]],
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test("renders correctly", () => {
	const item = shallow(<ShowCreatedShareLinkPopUp {...props} />);
	expect(item.find("Modal").length).toBe(1);
	expect(item.instance()._isMounted).toBe(true);
});

test("Test access code section renders correctly", () => {
	props.shareLink.enable_extract_share_access_code = true;
	const item = shallow(<ShowCreatedShareLinkPopUp {...props} />);
	expect(item.find("AccessCodeSection").length).toBe(1);
});

test("When link is copied", () => {
	const item = shallow(<ShowCreatedShareLinkPopUp {...props} />);
	item.instance().componentWillUnmount();
	item.instance().showCopiedText();
	expect(item.state().isCopied).toBe(true);
	item.instance().updateStatus();
	expect(item.state().isCopied).toBe(true);
});

test("When link is not copied", () => {
	const item = shallow(<ShowCreatedShareLinkPopUp {...props} />);
	item.instance().showCopiedText();
	expect(item.state().isCopied).toBe(true);
	item.instance().updateStatus();
	expect(item.state().isCopied).toBe(false);
});
