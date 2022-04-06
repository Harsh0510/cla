/** Required to simulate window.matchMedia */
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import DefaultIssueReportComponent from "../DefaultIssueReportComponent";

let props, mockFunction;

/**
 * Reset function
 */
function resetAll() {
	mockFunction = jest.fn();
	props = {
		issues: {
			array: ["issue 1", "issue 2"],
		},
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** wait for async function */
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

/** Component renders Correctly */
test(`Component renders Successfully`, async () => {
	const item = shallow(<DefaultIssueReportComponent {...props} />);
	expect(item.find("div").length).toBe(1);
	expect(item.find("ul").length).toBe(1);
});

test(`Component renders Successfully when no issues found`, async () => {
	props.issues = {
		array: [],
	};
	const item = shallow(<DefaultIssueReportComponent {...props} />);
	expect(item.find("div").length).toBe(0);
	expect(item.find("ul").length).toBe(0);
});
