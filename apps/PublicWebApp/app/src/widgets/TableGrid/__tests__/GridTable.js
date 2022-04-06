// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import GridTable from "../GridTable";

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

jest.mock("@devexpress/dx-react-grid-bootstrap4/dist/dx-react-grid-bootstrap4.css", () => mockPassthruHoc);

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = mount(<GridTable />);
	/** devexpress always return the Grid which is component in index.js file*/
	expect(item.find("div").length).toBe(1);
});

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = mount(<GridTable isContainImage="true" />);
	/** devexpress always return the Grid which is component in index.js file*/
	expect(item.find("div").length).toBe(1);
});
