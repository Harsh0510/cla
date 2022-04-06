// Required to simulate window.matchMedia
import "./../../mocks/matchMedia.mock";
import React from "react";
import { shallow } from "enzyme";
import withPageSize from "../withPageSize";

/**mock hoc */
function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

let WrappedComponent, props;

function resetAll() {
	WrappedComponent = mockPassthruHoc;
	props = {
		match: { path: "/", url: "/", isExact: true, params: {} },
		location: { pathname: "/", search: "", hash: "", key: "9hkpr5" },
		history: { length: 7, action: "POP", location: { pathname: "/", search: "", hash: "", key: "9hkpr5" } },
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/* Component renders correctly */
test("Component renders correctly", async () => {
	const WithPageSize = withPageSize(WrappedComponent);
	const item = shallow(<WithPageSize breakpoint={30} {...props} />);
	expect(item.find("mockPassthruHoc").length).toBe(1);
});

/* Called componentWillUnmount */
test("Called componentWillUnmount", async () => {
	const WithPageSize = withPageSize(WrappedComponent);
	const item = shallow(<WithPageSize breakpoint={30} {...props} />);
	const spy = jest.spyOn(item.instance(), "componentWillUnmount");
	item.unmount();
	expect(spy).toHaveBeenCalled();
});

/* Test methods */
test("isDesktop method works correctly", async () => {
	const WithPageSize = withPageSize(WrappedComponent);
	const item = shallow(<WithPageSize breakpoint={30} {...props} />);
	item.instance().isDesktop({ matches: true });
	expect(item.state("breakpoint")).toBe(30);
});

test("isTablet method works correctly", async () => {
	const WithPageSize = withPageSize(WrappedComponent);
	const item = shallow(<WithPageSize breakpoint={30} {...props} />);
	item.instance().isTablet({ matches: true });
	expect(item.state("breakpoint")).toBe(20);
});

test("isMobile method works correctly", async () => {
	const WithPageSize = withPageSize(WrappedComponent);
	const item = shallow(<WithPageSize breakpoint={30} {...props} />);
	item.instance().isMobile({ matches: true });
	expect(item.state("breakpoint")).toBe(10);
});
