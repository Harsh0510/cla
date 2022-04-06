import React from "react";
import { shallow, mount } from "enzyme";
import ReactivateActionModal from "../ReactivateActionModal";
import Modal from "../../../widgets/Modal";
let props, isShowReactivateConfirmModal, extractRreactivatedResponse, mockFunction;
const MESSAGE_COURSE_LIMIT_EXCEED = "The selected copies could not be reactivated because the following would exceed the class copy limit:";
const MESSAGE_SCHOOL_LIMIT_EXCEED = "The selected copies could not be reactivated because the following would exceed your institution copy limit:";
const MESSAGE_BOTH_LIMIT_EXCEED =
	"The selected copies could not be reactivated because the following would exceed your class or institution copy limit:";
const ADDED_TEXT =
	"This might be because you or a colleague have already exceeded the copy limit from the listed books for these classes this year. For more details please check the My Copies page or contact support@educationplatform.zendesk.com.";
const EXCEEDED_FOR_SCHOOL = "school";
const EXCEEDED_FOR_COURSE = "course";
const ResponseWithCourseError = {
	erroredExtract: [
		{
			exceededFor: EXCEEDED_FOR_COURSE,
		},
	],
};
beforeEach(resetAll);
afterEach(resetAll);
function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}
/** wait for async function */
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}
function resetAll() {
	mockFunction = jest.fn();
	props = {
		isShowReactivateConfirmModal: false,
		extractRreactivatedResponse: {},
		hideReactivateConfirmModel: mockFunction,
		onConfirmReactivateExtract: mockFunction,
		getSelectedExtractReactivateCount: mockFunction,
		resetExtractRreactivatedResponse: mockFunction,
		showReactivateSuccessMessage: false,
	};
}

test("Component renders correctly", async () => {
	const item = mount(<ReactivateActionModal {...props}></ReactivateActionModal>);
	expect(item.find("Modal").length).toBe(0);
});

test("User clicks on Reactivate copies button", async () => {
	const item = mount(<ReactivateActionModal {...props} isShowReactivateConfirmModal={true}></ReactivateActionModal>);
	expect(item.find("ConfirmModal").length).toBe(1);
});

test("User gets Reactivate extract error when course limit exceed", async () => {
	props.extractRreactivatedResponse = {
		reactivateCount: 0,
		leftToReview: 0,
		erroredExtract: [
			{
				exceededFor: EXCEEDED_FOR_COURSE,
				copyTitle: "Mock",
				pdf_isbn13: "Mock",
				oid: "Mock",
				course_oid: "Mock",
				pages: [1, 2, 3, 4],
			},
		],
	};
	const item = shallow(<ReactivateActionModal {...props}></ReactivateActionModal>);
	await wait(100);
	const subTitle = item.find("SubTitle");
	expect(subTitle.at(0).text()).toEqual(MESSAGE_COURSE_LIMIT_EXCEED);
	expect(subTitle.at(1).text()).toEqual(ADDED_TEXT);
});

test("User gets Reactivate extract error when institution limit exceed", async () => {
	props.extractRreactivatedResponse = {
		reactivateCount: 0,
		leftToReview: 0,
		erroredExtract: [
			{
				exceededFor: EXCEEDED_FOR_SCHOOL,
				copyTitle: "Mock",
				pdf_isbn13: "Mock",
				oid: "Mock",
				course_oid: "Mock",
				pages: [1, 2, 3, 4],
			},
		],
	};
	const item = shallow(<ReactivateActionModal {...props}></ReactivateActionModal>);
	await wait(100);
	const subTitle = item.find("SubTitle");
	expect(subTitle.at(0).text()).toEqual(MESSAGE_SCHOOL_LIMIT_EXCEED);
	expect(subTitle.at(1).text()).toEqual(ADDED_TEXT);
});

test("User gets Reactivate extract error when both limit exceed", async () => {
	props.extractRreactivatedResponse = {
		reactivateCount: 0,
		leftToReview: 0,
		erroredExtract: [
			{
				exceededFor: EXCEEDED_FOR_SCHOOL,
				copyTitle: "Mock",
				pdf_isbn13: "Mock",
				oid: "Mock",
				course_oid: "Mock",
				pages: [1, 2, 3, 4],
			},
			{
				exceededFor: EXCEEDED_FOR_COURSE,
				copyTitle: "Mock",
				pdf_isbn13: "Mock",
				oid: "Mock",
				course_oid: "Mock",
				pages: [1, 2, 3, 4],
			},
		],
	};
	const item = shallow(<ReactivateActionModal {...props}></ReactivateActionModal>);
	await wait(100);
	const subTitle = item.find("SubTitle");
	expect(subTitle.at(0).text()).toEqual(MESSAGE_BOTH_LIMIT_EXCEED);
	expect(subTitle.at(1).text()).toEqual(ADDED_TEXT);
});

test("When User successfully reactivate the extract", async () => {
	props.extractRreactivatedResponse = {
		reactivateCount: 1,
		leftToReview: 0,
		erroredExtract: [],
	};
	props.showReactivateSuccessMessage = true;
	const item = shallow(<ReactivateActionModal {...props}></ReactivateActionModal>);
	await wait(100);
	expect(item.find("Title").text()).toEqual("Congratulations!");
});

test("When User successfully reactivate the many extracts", async () => {
	props.extractRreactivatedResponse = {
		reactivateCount: 1,
		leftToReview: 1,
		erroredExtract: [],
	};
	props.showReactivateSuccessMessage = true;
	const item = shallow(<ReactivateActionModal {...props}></ReactivateActionModal>);
	await wait(100);
	expect(item.find("Title").text()).toEqual("Congratulations!");
});
