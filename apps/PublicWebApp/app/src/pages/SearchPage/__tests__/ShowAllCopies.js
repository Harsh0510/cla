// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import ShowAllCopies from "../ShowAllCopies";
import MockUser from "../../../mocks/MockUser";
import { MockcopiesData } from "../../../mocks/MockSearchResults";

let props, mockHideModal, doPagination;
function resetAll() {
	mockHideModal = jest.fn();
	doPagination = jest.fn();
	props = {
		show: true,
		hideModal: mockHideModal,
		pdf_isbn13: "4871836482365",
		withAuthConsumer_myUserDetails: MockUser[0],
		api: defaultApi,
	};
}

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

// Mock import
jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);
jest.mock("../../../common/withAuthConsumer", () => mockPassthruHoc);

async function defaultApi(endpoint, data) {
	if (endpoint === "/public/extract-search") {
		return {
			extracts: MockcopiesData.extracts,
			unfiltered_count: MockcopiesData.unfiltered_count,
			academic_year_end: MockcopiesData.academic_year_end,
		};
	}
	throw new Error("should never be here");
}

/**wait for async function */
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

beforeEach(resetAll);
afterEach(resetAll);

/** `Component render correctly` */
test(`Component render correctly`, async () => {
	const item = shallow(<ShowAllCopies {...props} />);
	expect(item.find("Modal").length).toBe(1);
});

/** `Hide component when show props false` */
test(`Hide component when show props false`, async () => {
	props.show = false;
	const item = shallow(<ShowAllCopies {...props} />);
	const isHide = item.find("Modal").props().show;
	expect(isHide).toBe(props.show);
});

/** `Component render with modal title` */
test(`Component render with modal title`, async () => {
	const item = shallow(<ShowAllCopies {...props} />);
	expect(item.find("ModalTitle").length).toBe(1);
	expect(item.find("ModalTitle").text()).toEqual(`Copies created at Measham C of E Primary School`);
});

/** `Component Render with copies data` */
test(`Component Render with copies data`, async () => {
	props.pdf_isbn13 = "9780007226788";
	const item = shallow(<ShowAllCopies {...props} />);
	await wait(20);
	expect(item.find("CopiesTable").length).toBe(1);
});

/** `When props changed component re-render` */
test(`When props changed component re-render`, async () => {
	props.pdf_isbn13 = "9780007226788";
	const item = shallow(<ShowAllCopies {...props} />);
	const spy = jest.spyOn(item.instance(), "fetchCopies");
	item.setProps({ pdf_isbn13: "4871836482365" });
	await wait(20);
	item.update();
	item.instance().forceUpdate();
	expect(spy).toHaveBeenCalled();
});

/** User select 2 page from pagination for the see copies modal */
test(`User select 2 page from pagination for the see copies modal `, async () => {
	props.pdf_isbn13 = "9780007226788";
	const item = shallow(<ShowAllCopies {...props} />);
	await wait(20);
	const spy = jest.spyOn(item.instance(), "fetchCopies");
	const mockDefaultField = item.state().offset;

	item.instance().doPagination(2, 5);
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().offset).not.toBe(mockDefaultField);

	const mockDefaultField1 = item.state().offset;
	item.instance().doPagination(0, 10);
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().offset).not.toBe(mockDefaultField1);
	expect(spy).toHaveBeenCalled();
});

/** User display rows from pagination for the see copies modal */
test(`User display rows from pagination for the see copies modal `, async () => {
	props.pdf_isbn13 = "9780007226788";
	const item = shallow(<ShowAllCopies {...props} />);
	const spy = jest.spyOn(item.instance(), "fetchCopies");
	await wait(20);
	const mockDefaultField = item.state().limit;
	item.instance().doPagination(2, 1);
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().limit).not.toBe(mockDefaultField);

	const mockDefaultField1 = item.state().limit;
	item.instance().doPagination(0, 2);
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().limit).not.toBe(mockDefaultField1);
	expect(spy).toHaveBeenCalled();
});

/** User sort the 'teacher' column */
test(`User sort the 'teacher' column`, async () => {
	props.pdf_isbn13 = "9780007226788";
	const item = shallow(<ShowAllCopies {...props} />);
	const spy = jest.spyOn(item.instance(), "fetchCopies");
	await wait(20);

	const mockDefaultField = item.state().sortField;
	item.instance().doSorting([{ columnName: "teacher", direction: "D" }]);
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().sortField).not.toBe(mockDefaultField);
	expect(item.state().sortField).toBe("teacher");
	expect(spy).toHaveBeenCalled();
});

/** User sort the unsorting column */
test(`User sort the unsorting column`, async () => {
	props.pdf_isbn13 = "9780007226788";
	const item = shallow(<ShowAllCopies {...props} />);
	const spy = jest.spyOn(item.instance(), "fetchCopies");
	await wait(20);

	const mockDefaultField = item.state().sortField;
	item.instance().doSorting([]);
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().sortField).toBe(mockDefaultField);
});

test(`When user clicks on see copies`, async () => {
	const item = shallow(<ShowAllCopies {...props} />);
	item.instance().doShowModal(true);
	await wait(10);
	expect(item.find("CopiesTable").length).toBe(1);
	expect(item.find("CopyCreationAccessDeniedPopup").length).toBe(1);
});

test(`When user clicks close button of modal`, async () => {
	const item = shallow(<ShowAllCopies {...props} />);
	item.instance().hideModal();
	await wait(10);
	expect(item.state().showModal).toBe(false);
	expect(item.find("CopyCreationAccessDeniedPopup").length).toBe(0);
});
