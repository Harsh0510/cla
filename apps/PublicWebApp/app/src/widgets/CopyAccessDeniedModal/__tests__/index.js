import React from "react";
import CopyAccessDeniedModal from "../index";
import { shallow } from "enzyme";

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

jest.mock("react-router-dom", () => ({ withRouter: (a) => a }));

jest.mock("../../../common/withAuthConsumer", () => mockPassthruHoc);

let props;

function resetAll() {
	props = {
		location: {
			state: { redirected_from_extract_page: false },
		},
		withAuthConsumer_myUserDetails: {
			can_copy: true,
			has_trial_extract_access: true,
		},
	};
}

beforeEach(resetAll);
afterEach(resetAll);

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

test("Do not display modal when user having copy permission", async () => {
	const item = shallow(<CopyAccessDeniedModal {...props} />);
	expect(item.debug()).toBe("");
});

test("Show modal when user do not have copy permission", async () => {
	let Nprops = {
		...props,
		location: { state: { redirected_from_extract_page: true } },
		withAuthConsumer_myUserDetails: {
			can_copy: false,
			has_trial_extract_access: true,
		},
	};
	const item = shallow(<CopyAccessDeniedModal {...Nprops} />);
	expect(item.find("div").length).toBe(1);
});

test("on modal close closes popup", async () => {
	const item = shallow(<CopyAccessDeniedModal {...props} />);
	item.instance().onModalClose();
	await wait(200);
	expect(item.state().modal_was_closed).toBe(true);
});

test("display modal when user has just logged in and modal has not been closed once", async () => {
	let Nprops = {
		...props,
		location: { state: { redirected_from_extract_page: false } },
		withAuthConsumer_myUserDetails: {
			can_copy: false,
			has_trial_extract_access: true,
		},
	};
	const item = shallow(<CopyAccessDeniedModal {...Nprops} />);
	item.setState({
		just_logged_in: true,
		modal_was_closed: false,
	});
	await wait(200);
	expect(item.find("div").length).toBe(1);
});
