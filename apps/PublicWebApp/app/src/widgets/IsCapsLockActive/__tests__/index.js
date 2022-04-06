import React from "react";
import { shallow } from "enzyme";
import IsCapsLockActive from "../index";

let props;
let mockFunction;
let mockGetModifierState;
let mockModifierCapsLock;
let mockKey;

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);
jest.mock("../../../common/withAuthRequiredConsumer", () => mockPassthruHoc);

function resetAll() {
	mockFunction = jest.fn();
	mockModifierCapsLock = false;
	mockGetModifierState = () => {
		return mockModifierCapsLock;
	};
	mockKey = "CapsLock";
	props = {
		children: mockFunction,
		inputRef: {
			current: {
				addEventListener: mockFunction,
				removeEventListener: mockFunction,
				focus: mockFunction,
			},
		},
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test(`Component renders correctly`, async () => {
	const item = shallow(<IsCapsLockActive {...props} />);
	expect(item.state().isCapsLockActive).toBe(false);
});

test(`When user ativate caps lock`, async () => {
	mockModifierCapsLock = true;
	let e = {
		getModifierState: mockGetModifierState,
		preventDefault: jest.fn(),
		key: mockKey,
		code: mockKey,
	};
	const item = shallow(<IsCapsLockActive {...props} />);
	item.setState({ isCapsLockActive: false });
	item.instance().doKeyToggle(e);
	expect(item.state().isCapsLockActive).toBe(true);
});

test(`When user deactivated caps lock`, async () => {
	mockModifierCapsLock = false;
	let e = {
		getModifierState: mockGetModifierState,
		preventDefault: jest.fn(),
		key: mockKey,
		code: mockKey,
	};
	const item = shallow(<IsCapsLockActive {...props} />);
	item.instance().doKeyCheck(e);
	expect(item.state().isCapsLockActive).toBe(false);
});

test(`When user focus on password feild and caps lock is activate`, async () => {
	let e = {
		getModifierState: mockGetModifierState,
		preventDefault: jest.fn(),
		code: mockKey,
	};
	const input = document.createElement("input");
	document.body.appendChild(input);
	props.inputRef.current = input;
	input.focus();
	const item = shallow(<IsCapsLockActive {...props} />);
	item.setState({ isCapsLockActive: false });
	item.instance().doKeyToggle(e);
	item.instance().doFocus();
	expect(item.state().isCapsLockActive).toBe(true);
});

test(`When user go on other field from password feild and caps lock is activate`, async () => {
	const item = shallow(<IsCapsLockActive {...props} />);
	item.setState({ isCapsLockActive: true });
	item.instance().doFocusOut();
	expect(item.state().isCapsLockActive).toBe(true);
});

test(`Test componentWillUnmount method`, async () => {
	mockModifierCapsLock = true;

	const item = shallow(<IsCapsLockActive {...props} />);
	item.setState({ isCapsLockActive: false });
	item.instance().componentWillUnmount();
	expect(item.state().isCapsLockActive).toBe(false);
});

test(`Test componentWillUnmount method without inputRef`, async () => {
	mockModifierCapsLock = true;
	delete props.inputRef;
	const item = shallow(<IsCapsLockActive {...props} />);
	item.setState({ isCapsLockActive: false });
	item.instance().componentWillUnmount();
	expect(item.state().isCapsLockActive).toBe(false);
});

test(`Component renders correctly without inputRef`, async () => {
	mockModifierCapsLock = true;
	delete props.inputRef;
	const item = shallow(<IsCapsLockActive {...props} />);
	expect(item.state().isCapsLockActive).toBe(false);
});

test(`Component renders correctly when user Toggle tab key`, async () => {
	let e = {
		getModifierState: mockGetModifierState,
		preventDefault: jest.fn(),
	};
	const item = shallow(<IsCapsLockActive {...props} />);
	item.setState({ isCapsLockActive: false });
	item.instance().doKeyToggle(e);
	expect(item.state().isCapsLockActive).toBe(false);
});

test(`User focus on password feild without inputRef`, async () => {
	let e = {
		getModifierState: mockGetModifierState,
		preventDefault: jest.fn(),
		code: "CapsLock",
	};
	const item = shallow(<IsCapsLockActive {...props} />);
	item.setState({ isCapsLockActive: false });
	item.instance().doKeyToggle(e);
	item.instance().doFocus();
	expect(item.state().isCapsLockActive).toBe(true);
});

test(`When user go on other field from password feild`, async () => {
	const input = document.createElement("input");
	document.body.appendChild(input);
	props.inputRef.current = input;
	input.focus();
	const item = shallow(<IsCapsLockActive {...props} />);
	item.setState({ isCapsLockActive: true });
	item.instance().doFocusOut();
	expect(item.state().isCapsLockActive).toBe(true);
});

test(`Component renders correctly when user press tab key`, async () => {
	mockKey = "Tab";
	let e = {
		getModifierState: mockGetModifierState,
		preventDefault: jest.fn(),
		key: mockKey,
		code: mockKey,
	};
	const item = shallow(<IsCapsLockActive {...props} />);
	item.instance().doKeyCheck(e);
	expect(item.state().isCapsLockActive).toBe(false);
});
