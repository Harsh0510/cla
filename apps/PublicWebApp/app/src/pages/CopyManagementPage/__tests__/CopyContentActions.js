import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import CopyContentActions from "../CopyContentActions";
import MockUserData from "../../../mocks/MockUser";
let props, eventHandle;

// Mock import
function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);
jest.mock("../../../common/withAuthRequiredConsumer", () => mockPassthruHoc);

// wait for async function
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

function resetAll() {
	eventHandle = jest.fn();
	props = {
		data: {
			oid: "1234456",
			status: "editable",
			title: "title",
			work_isbn13: "9781444144215",
			course_oid: "!234567",
			pages: [1, 2, 3, 4],
			expired: false,
			did_create: true,
		},
		deactivateShare: eventHandle,
		onDoPrint: eventHandle,
		getCopiesData: eventHandle,
		onOpen: eventHandle,
		withAuthConsumer_myUserDetails: MockUserData,
	};
}

/** Default API */
async function defaultApi(endpoint, data) {
	// extract-status-update endpoint
	endpoint = endpoint.replace(/\s+/g, " ");
	if (endpoint === "/public/extract-status-update") {
		return true;
	}

	//extract-cancel endpoint
	if (endpoint === "/public/extract-cancel") {
		return;
	}

	// This will be caught by the promise in the component
	throw new Error("should never be here");
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test(`Component renders correctly`, async () => {
	props.flyOutIndex = 0;
	const item = shallow(<CopyContentActions {...props} api={defaultApi} />);
	expect(item.find("WrapExtractAction").length).toBe(1);
});

test(`Component renders when data expired`, async () => {
	props.data.expired = true;
	const item = shallow(<CopyContentActions {...props} api={defaultApi} />);
	expect(item.find("WrapExtractAction").length).toBe(0);
});

test(`When extract is editable user see Edit copy link and icon`, async () => {
	const item = shallow(<CopyContentActions {...props} api={defaultApi} />);
	expect(item.find("WrapExtractAction").length).toBe(1);
	expect(item.find("ExtractActionButton").length).toBe(4);
	expect(item.find("CopyEditLinkIcon").length).toBe(1);
	expect(item.find("CopyEditLink").length).toBe(1);
	expect(item.find("CopyEditLink").text()).toBe("Edit copy");
});

test(`When click on delete copy and cancle confirm popup`, async () => {
	const item = shallow(<CopyContentActions {...props} api={defaultApi} />);
	expect(item.find("WrapExtractAction").length).toBe(1);
	expect(item.find("ExtractActionButton").length).toBe(4);
	expect(item.find("DeleteIcon").length).toBe(1);
	expect(item.find("DeleteText").length).toBe(1);
	expect(item.find("DeleteText").text()).toBe("Delete copy");
	const deletebutton = item.find("ExtractActionButton").at(1);
	deletebutton.simulate("click");
	expect(item.state().isShowDeleteCopyPopUp).toBe(true);
	expect(item.find("ConfirmModal").length).toBe(1);
	item.instance().onCancelDeleteCopy();
	expect(item.state().isShowDeleteCopyPopUp).toBe(false);
});

test(`When user successfully delete copy`, async () => {
	const item = shallow(<CopyContentActions {...props} api={defaultApi} />);
	expect(item.find("WrapExtractAction").length).toBe(1);
	expect(item.find("ExtractActionButton").length).toBe(4);
	expect(item.find("DeleteIcon").length).toBe(1);
	expect(item.find("DeleteText").length).toBe(1);
	expect(item.find("DeleteText").text()).toBe("Delete copy");
	const deletebutton = item.find("ExtractActionButton").at(1);
	deletebutton.simulate("click");
	expect(item.state().isShowDeleteCopyPopUp).toBe(true);
	expect(item.find("ConfirmModal").length).toBe(1);
	item.instance().onConfrimDeleteCopy();
	await wait(10);
	expect(item.state().isShowDeleteCopyPopUp).toBe(false);
	expect(item.state().isShowDeletedMessage).toBe(true);
	expect(item.find("Modal").length).toBe(1);
	item.instance().hideModal();
	expect(item.state().isRedirect).toBe(true);
	expect(item.state().isShowDeleteCopyPopUp).toBe(false);
});

/** User click on print button */
test(`When User click on print button`, async () => {
	props.data.expired = false;
	const item = shallow(<CopyContentActions {...props} api={defaultApi} />);
	const btnPrint = item.find("ExtractActionButton").at(2);
	expect(item.find("ExtractActionButton").at(2).find("span").text()).toEqual("Print");
	btnPrint.simulate("click");
	await wait(20);
	item.update();
	expect(item.state().isShowActivateCopyPopUp).toBe(true);
	item.instance().onCancelActivateCopy();
	expect(item.state().isShowActivateCopyPopUp).toBe(false);
});

/** When User click on full screen button */
test(`When User click on full screen button`, async () => {
	const item = shallow(<CopyContentActions {...props} api={defaultApi} />);
	const btnFullscreen = item.find("ExtractActionButton").at(3);
	expect(item.find("ExtractActionButton").at(3).find("span").text()).toEqual("Fullscreen");
	btnFullscreen.simulate("click");
	await wait(20);
	item.update();
	expect(eventHandle).toBeCalled();
});

test(`When User activate copy`, async () => {
	props.data.expired = false;
	const item = shallow(<CopyContentActions {...props} api={defaultApi} />);
	const btnPrint = item.find("ExtractActionButton").at(2);
	expect(item.find("ExtractActionButton").at(2).find("span").text()).toEqual("Print");
	btnPrint.simulate("click");
	await wait(20);
	item.update();
	expect(item.state().isShowActivateCopyPopUp).toBe(true);
	item.instance().onConfrimActivateCopy();
	await wait(20);
	item.update();
	expect(item.state().isShowActivateCopyPopUp).toBe(false);
	expect(props.getCopiesData).toBeCalled();
});

test(`When cla User print copy`, async () => {
	props.data.expired = false;
	MockUserData.role = "cla-admin";
	const item = shallow(<CopyContentActions {...props} api={defaultApi} />);
	const btnPrint = item.find("ExtractActionButton").at(2);
	expect(item.find("ExtractActionButton").at(2).find("span").text()).toEqual("Print");
	btnPrint.simulate("click");
	await wait(20);
	item.update();
	expect(eventHandle).toBeCalled();
	expect(props.onDoPrint).toBeCalled();
});

test(`Test componentWillUnmount method`, async () => {
	const item = shallow(<CopyContentActions {...props} api={defaultApi} />);
	item.instance()._isMounted = true;
	item.instance().componentWillUnmount();

	await wait(50);
	item.instance().onConfrimActivateCopy();
	item.instance().onConfrimDeleteCopy();
	expect(item.instance()._isMounted).toBe(undefined);
});

test(`When user copy is active user not able to edit or delete copy`, async () => {
	props.data.expired = false;
	props.data.status = "active";
	const item = shallow(<CopyContentActions {...props} api={defaultApi} />);
	expect(item.find("WrapExtractAction").length).toBe(1);
	expect(item.find("WrapExtractAction").props().style).toEqual({ justifyContent: "flex-end" });
	expect(item.find("ExtractActionButton").length).toBe(2);
});

test(`When user deleted copy of different user than it will see the result from all copies`, async () => {
	props.data.did_create = false;
	const item = shallow(<CopyContentActions {...props} api={defaultApi} />);
	const url = item.instance().getUrlAfterCancelled();
	expect(url).toBe("/profile/my-copies?query=title&q_mine_only=0");
});

test(`When user deleted copy of it's own created copy it will see the result from all copies`, async () => {
	const item = shallow(<CopyContentActions {...props} api={defaultApi} />);
	const url = item.instance().getUrlAfterCancelled();
	expect(url).toBe("/profile/my-copies?query=title&q_mine_only=1");
});
