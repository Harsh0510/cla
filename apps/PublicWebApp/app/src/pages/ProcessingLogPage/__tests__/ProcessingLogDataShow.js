// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import ProcessingLogDataShow from "../ProcessingLogDataShow";

let props, fields, message, ACTION_NEW, ACTION_EDIT, mockFormData;

/** Mock function for pass mock form data */
jest.mock("../../../common/CustomFormData", () => {
	return function () {
		const ret = [];
		for (const key in mockFormData) {
			if (mockFormData.hasOwnProperty(key)) {
				ret.push(key, mockFormData[key]);
			}
		}
		return ret;
	};
});

/** wait for async function */
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

/** resetAll for reset the values */
function resetAll() {
	(fields = {
		id: 1,
		date_created: "15/1/2015 12:24:20",
		stage: "stage",
		sub_stage: "sub_stage",
		asset_identifier: "asset_identifier",
		high_priority: false,
		success: true,
		content: "content content ",
	}),
		(message = ""),
		(ACTION_NEW = "new");
	ACTION_EDIT = "edit";
	mockFormData = [];
	props = {
		key: fields.id || "__NEW__",
		handleSubmit: jest.fn(),
		cancelAddEdit: jest.fn(),
		message: null,
		fields: fields,
		action: ACTION_EDIT,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test("Component renders correctly ", async () => {
	const item = mount(<ProcessingLogDataShow {...props} />);

	expect(item.find("FormWrapAddEdit").length).toBe(1);
});

test("Component renders correctly when no fields passed ", async () => {
	props.fields = {};
	const item = mount(<ProcessingLogDataShow {...props} />);
	expect(item.find("FormWrapAddEdit").length).toBe(1);
	expect(item.find("input").find('[name="id"]').props().value).toBe("");
	expect(item.find("input").find('[name="date_created"]').props().value).toBe("");
	expect(item.find("input").find('[name="stage"]').props().value).toBe("");
	expect(item.find("input").find('[name="sub_stage"]').props().value).toBe("");
	expect(item.find("input").find('[name="asset_identifier"]').props().value).toBe("");
	expect(item.find("textarea").find('[name="content"]').props().value).toBe("");
});
