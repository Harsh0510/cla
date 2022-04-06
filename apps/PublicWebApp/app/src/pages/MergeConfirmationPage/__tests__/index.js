import "../../../mocks/matchMedia.mock";
import React from "react";
import { shallow } from "enzyme";
import MockApi from "../../../mocks/MockApi";
import MergeConfirmationPage from "../index";
import MessageBox from "../../../widgets/MessageBox";

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

// Mock import
jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);
jest.mock("../../../common/withAuthRequiredConsumer", () => mockPassthruHoc);

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

test("Component renders correctly", async () => {
	const item = shallow(
		<MergeConfirmationPage
			api={MockApi}
			withAuthConsumer_myUserDetails={{
				requires_merge_confirmation: {
					type: "fuzzy",
					verification_sent: false,
					target_value: "foo@bar.com",
				},
			}}
		/>
	);
	await wait(50);
	expect(item.text().includes("We have detected an account that might be you")).toBe(true);
});

test("Confirm merge accounts - success", async () => {
	let didInit = false;
	const api = async (endpoint, params) => {
		if (endpoint === "/auth/oauth/hwb/merge-account-init") {
			didInit = true;
			return;
		}
		return MockApi(endpoint, params);
	};
	const item = shallow(
		<MergeConfirmationPage
			api={api}
			withAuthConsumer_myUserDetails={{
				requires_merge_confirmation: {
					type: "fuzzy",
					verification_sent: false,
					target_value: "foo@bar.com",
				},
			}}
		/>
	);
	await wait(50);
	expect(item.state("success")).toBe(false);
	item.instance().doConfirmMergeAccounts({
		preventDefault() {},
	});
	await wait(50);
	expect(item.state("success")).toBe(true);
	expect(didInit).toBe(true);
});

test("Confirm merge accounts - failure", async () => {
	let didInit = false;
	const api = async (endpoint, params) => {
		if (endpoint === "/auth/oauth/hwb/merge-account-init") {
			didInit = true;
			throw "SOME ERROR HERE";
		}
		return MockApi(endpoint, params);
	};
	const item = shallow(
		<MergeConfirmationPage
			api={api}
			withAuthConsumer_myUserDetails={{
				requires_merge_confirmation: {
					type: "fuzzy",
					verification_sent: false,
					target_value: "foo@bar.com",
				},
			}}
		/>
	);
	await wait(50);
	expect(item.state("success")).toBe(false);
	item.instance().doConfirmMergeAccounts({
		preventDefault() {},
	});
	await wait(50);
	expect(didInit).toBe(true);
	expect(item.state("success")).toBe(false);
	expect(item.state("error")).toBe("SOME ERROR HERE");
	expect(item.containsMatchingElement(<MessageBox type="error" message="SOME ERROR HERE" />)).toBe(true);
});

test("Create new account - success", async () => {
	let didInit = false;
	let didReauth = false;
	const api = async (endpoint, params) => {
		if (endpoint === "/auth/oauth/hwb/promote-account") {
			didInit = true;
			return;
		}
		return MockApi(endpoint, params);
	};
	const item = shallow(
		<MergeConfirmationPage
			api={api}
			withAuthConsumer_myUserDetails={{
				requires_merge_confirmation: {
					type: "none",
					verification_sent: false,
				},
			}}
			withAuthConsumer_attemptReauth={() => {
				didReauth = true;
			}}
		/>
	);
	await wait(50);
	item.instance().doCreateNewAccount({
		preventDefault() {},
	});
	await wait(50);
	expect(didReauth).toBe(true);
	expect(!!item.state("error")).toBe(false);
});

test("Create new account - failure", async () => {
	let didInit = false;
	let didReauth = false;
	const api = async (endpoint, params) => {
		if (endpoint === "/auth/oauth/hwb/promote-account") {
			didInit = true;
			throw "ANOTHER ERROR";
		}
		return MockApi(endpoint, params);
	};
	const item = shallow(
		<MergeConfirmationPage
			api={api}
			withAuthConsumer_myUserDetails={{
				requires_merge_confirmation: {
					type: "none",
					verification_sent: false,
				},
			}}
			withAuthConsumer_attemptReauth={() => {
				didReauth = true;
			}}
		/>
	);
	await wait(50);
	item.instance().doCreateNewAccount({
		preventDefault() {},
	});
	await wait(50);
	expect(didReauth).toBe(false);
	expect(item.state("error")).toBe("ANOTHER ERROR");
});

test("User see message when a user is already exists but didn't verified the email", async () => {
	let didInit = false;
	const api = async (endpoint, params) => {
		if (endpoint === "/auth/oauth/hwb/merge-account-init") {
			didInit = true;
			return;
		}
		return MockApi(endpoint, params);
	};
	const item = shallow(
		<MergeConfirmationPage
			api={api}
			withAuthConsumer_myUserDetails={{
				requires_merge_confirmation: {
					type: "fuzzy",
					verification_sent: false,
					target_value: "foo@bar.com",
				},
			}}
		/>
	);
	await wait(50);
	item.instance().doConfirmMergeAccounts({
		preventDefault() {},
	});
	item.instance().doToggleOverrideTarget({
		preventDefault() {},
	});
	await wait(50);
	expect(item.find("MessageBox").props().message).toBe(
		"If your email address exists in the system we will send you a verification email. Please verify your email address by clicking on the verification link that has been sent to the provided email address."
	);
});

test("When verification email is resent", async () => {
	const api = async (endpoint, params) => {
		if (endpoint === "/auth/oauth/hwb/merge-account-resend-token") {
			return;
		}
		return MockApi(endpoint, params);
	};
	const item = shallow(
		<MergeConfirmationPage
			api={api}
			withAuthConsumer_myUserDetails={{
				requires_merge_confirmation: {
					type: "fuzzy",
					verification_sent: true,
					target_value: "foo@bar.com",
				},
			}}
		/>
	);
	await wait(50);
	item.instance().doResendMergeEmail({
		preventDefault() {},
	});
	await wait(50);
	expect(item.find("MessageBox").props().message).toBe("Verification email resent");
});

test("When user alresy exist", async () => {
	const item = shallow(
		<MergeConfirmationPage
			api={MockApi}
			withAuthConsumer_myUserDetails={{
				requires_merge_confirmation: {
					type: "email",
					verification_sent: false,
					target_value: "foo@bar.com",
				},
			}}
		/>
	);
	await wait(50);
	expect(item.find("PageContentLarge").childAt(0).text()).toEqual(
		"The email address, foo@bar.com, already exists in the Education Platform. Would you like to synchronise your Education Platform and Hwb accounts?Yes No"
	);
});

test("New", async () => {
	const item = shallow(
		<MergeConfirmationPage
			api={MockApi}
			withAuthConsumer_myUserDetails={{
				requires_merge_confirmation: {
					type: "abc",
					verification_sent: false,
					target_value: "foo@bar.com",
				},
			}}
		/>
	);
	await wait(50);
	expect(item.find("PageContentLarge").text()).toEqual("");
});

test("User don't see any message", async () => {
	const item = shallow(<MergeConfirmationPage api={MockApi} withAuthConsumer_myUserDetails={{}} />);
	await wait(50);
	expect(item.find("MessageBox").props().message).not.toEqual(null);
});

test("When invalid email address id provided", async () => {
	const item = shallow(
		<MergeConfirmationPage
			api={MockApi}
			withAuthConsumer_myUserDetails={{
				requires_merge_confirmation: {
					type: "none",
					verification_sent: false,
				},
			}}
		/>
	);
	await wait(50);
	item.instance().doConfirmMergeAccounts({
		preventDefault() {},
	});
	await wait(50);
	expect(item.state("error")).toEqual("Please enter a valid address");
});

test("When user move to another page", async () => {
	const item = shallow(
		<MergeConfirmationPage
			api={MockApi}
			withAuthConsumer_myUserDetails={{
				requires_merge_confirmation: {
					type: "fuzzy",
					verification_sent: false,
					target_value: "foo@bar.com",
				},
			}}
		/>
	);

	item.instance().componentWillUnmount();
	item.instance().doConfirmMergeAccounts({
		preventDefault() {},
	});
	await wait(50);
	expect(item.state("success")).toEqual(false);
});

test("Test doConfirmMergeAccounts method", async () => {
	let didInit = false;
	let didReauth = false;

	const api = async (endpoint, params) => {
		if (endpoint === "/auth/oauth/hwb/merge-account-init") {
			didInit = true;
			return;
		}
		return MockApi(endpoint, params);
	};
	const item = shallow(
		<MergeConfirmationPage
			api={api}
			withAuthConsumer_myUserDetails={{
				requires_merge_confirmation: {
					type: "none",
					verification_sent: false,
				},
			}}
			withAuthConsumer_attemptReauth={() => {
				didReauth = true;
			}}
		/>
	);
	await wait(50);
	item.instance().onEmailChange("foo", "foo@bar.com", true);
	item.setState({ overrideFormValid: { isValid: true } });
	await wait(50);
	item.instance().doConfirmMergeAccounts({
		preventDefault() {},
	});
	await wait(50);
	expect(item.state("success")).toEqual(true);
});
