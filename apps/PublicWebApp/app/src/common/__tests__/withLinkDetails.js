import React from "react";
import { shallow, mount } from "enzyme";
import withLinkDetails from "../withLinkDetails";
import MockUser from "../../mocks/MockUser";
import styled from "styled-components";

/**Variables  */
let acceptedRoles, WrappedComponent, mockUserData, mockProps;
//mock for wrapperComponent
let mockWrappedComponent;

/**
 * mock react-router-dom
 */
jest.mock("react-router-dom", () => {
	return {
		withRouter: (callBack) => {
			return callBack(mockProps);
		},
	};
});

function resetAll() {
	mockUserData = MockUser[0];
	WrappedComponent = mockPassthruHoc;
	mockProps = {
		to: "testPath1",
		location: {
			pathname: "testPath1",
		},
		className: "testclass",
		children: "c1",
	};

	mockWrappedComponent = (props) => {
		return <div className={props.className} to={props.to} in_section={props.in_section} is_current={props.is_current} children={props.children} />;
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/**mock hoc function */
function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

/**Function render correctly */
test(`Function render correctly`, async () => {
	const item = shallow(withLinkDetails(mockWrappedComponent));
	const item1 = item.find("div").first();

	expect(item1.text()).toEqual("c1");
	expect(item1.props()).not.toBeNull();
	expect(item1.props().className).toEqual("testclass");
	expect(item1.props().to).toEqual("testPath1");
	expect(item1.props().in_section).toEqual(true);
	expect(item1.props().is_current).toEqual(true);
	expect(item1.props().children).toEqual("c1");
});

test(`Return a wrapper component when 'to' values as object`, async () => {
	mockProps.to = {
		pathname: "testPath1",
	};
	const item = shallow(withLinkDetails(mockWrappedComponent));
	const item1 = item.find("div").first();

	expect(item1.text()).toEqual("c1");
	expect(item1.props()).not.toBeNull();
	expect(item1.props().className).toEqual("testclass");
	expect(item1.props().to).toEqual({ pathname: "testPath1" });
	expect(item1.props().in_section).toEqual(true);
	expect(item1.props().is_current).toEqual(true);
	expect(item1.props().children).toEqual("c1");
});

test(`Return a wrapper component with is_Current as "" and in_section="" when 'to' and 'location.pathname' are diffenrent`, async () => {
	mockProps.to = {
		pathname: "adminpage",
	};
	const item = shallow(withLinkDetails(mockWrappedComponent));
	const item1 = item.find("div").first();

	expect(item1.text()).toEqual("c1");
	expect(item1.props()).not.toBeNull();
	expect(item1.props().className).toEqual("testclass");
	expect(item1.props().to).toEqual({ pathname: "adminpage" });
	expect(item1.props().in_section).toEqual("");
	expect(item1.props().is_current).toEqual("");
	expect(item1.props().children).toEqual("c1");
});
