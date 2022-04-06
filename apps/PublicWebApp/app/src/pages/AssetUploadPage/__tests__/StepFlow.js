import React from "react";
import { shallow } from "enzyme";
import StepFlow from "../StepFlow";

let props;

function resetAll() {
	props = {
		selectedStep: 1,
		steps: ["Tell us what you're copying from", "Search results", "Upload your own extract", "Confirm"],
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test("Component renders correctly", async () => {
	const item = shallow(<StepFlow {...props} />);
	expect(item.find("WizardSection").length).toBe(1);
	expect(item.find("StepUl").length).toBe(1);
	expect(item.find("StepItem").length).toBe(4);
});

test("Component renders correctly if selectedStep is not provided", async () => {
	delete props.selectedStep;
	const item = shallow(<StepFlow {...props} />);
	expect(item.find("WizardSection").length).toBe(1);
	expect(item.find("StepUl").length).toBe(1);
	expect(item.find("StepItem").length).toBe(4);
});

test("Component renders correctly if selectedStep is not provided", async () => {
	props.selectedStep = 2;
	const item = shallow(<StepFlow {...props} />);
	expect(item.find("WizardSection").length).toBe(1);
	expect(item.find("StepUl").length).toBe(1);
	expect(item.find("StepItem").length).toBe(4);
	expect(item.find("StepItem").at(1).props().selected).toBe(true);
});
