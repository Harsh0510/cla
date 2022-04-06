// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import CarouselAddEdit from "../CarouselAddEdit";

let MOCKCAROUSELFORMDATA = [
	{
		name: "id",
		value: "1",
	},
	{
		name: "name",
		value: "abc",
	},
	{
		name: "enabled",
		value: true,
	},
	{
		name: "sort_order",
		value: "12",
	},
	{
		name: "image_url",
		value: "image url",
	},
	{
		name: "image_alt_text",
		value: "image alt text",
	},
	{
		name: "link_url",
		value: "link url",
	},
];

let fields, message, ACTION_NEW, ACTION_EDIT, CONFIRM_DIALOG_DELETE, CONFIRM_DIALOG_NONE, mockFormData, inputFieldValue, inputFieldName, props;

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

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
		id: "",
		date_created: "",
		date_edited: "",
		name: "",
		image_url: "",
		sort_order: "",
		image_alt_text: "",
		enabled: false,
		link_url: "",
	}),
		(message = ""),
		(ACTION_NEW = "new");
	ACTION_EDIT = "edit";
	CONFIRM_DIALOG_DELETE = "delete";
	CONFIRM_DIALOG_NONE = "";
	mockFormData = [];
	props = {
		key: fields.id || "__NEW__",
		handleSubmit: jest.fn(),
		cancelAddEdit: jest.fn(),
		message: null,
		fields: fields,
		action: ACTION_EDIT,
		deleteCarousel: jest.fn(),
		handleNameInputField: jest.fn(),
	};
	inputFieldValue = "panel name";
	inputFieldName = "name";
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Component renders correctly ", async () => {
	const item = mount(<CarouselAddEdit {...props} />);

	expect(item.find("FormWrapAddEdit").length).toBe(1);
});

/** User clicks add panel button from above the listing page, It should display the create-panel button in form*/
test("User clicks add panel from above the listing page, It should display the create-panel button in form", async () => {
	props.action = ACTION_NEW;
	const item = mount(<CarouselAddEdit {...props} />);

	expect(item.find('button[name="create-panel"]').length).toBe(1);
});

/** User click on edit icon from the listing page, It should display the update-class button in form*/
test("User click on edit icon from the listing page, It should display the update-class button in form", async () => {
	fields = {
		id: "1",
		date_created: "15/1/2015",
		date_edited: "15/1/2015",
		name: "test",
		image_url: "test",
		image_alt_text: "test",
		enabled: true,
		sort_order: "1",
		link_url: "test",
	};

	const item = mount(<CarouselAddEdit {...props} />);

	expect(item.find('button[name="update-panel"]').length).toBe(1);
});

/** User click on delete button and it should be display the confirmation dialog box */
test("User click on delete button and it should be display the confirmation dialog box ", async () => {
	fields = {
		id: "1",
		date_created: "15/1/2015",
		date_edited: "15/1/2015",
		name: "test",
		image_url: "test",
		image_alt_text: "test",
		enabled: true,
		sort_order: "1",
		link_url: "test",
	};

	const item = mount(<CarouselAddEdit {...props} />);

	item.setState({ show_confirm_dialog: CONFIRM_DIALOG_NONE });
	item.instance().doShowConfirmDelete({ preventDefault: jest.fn() });

	expect(item.state().show_confirm_dialog).toEqual(CONFIRM_DIALOG_DELETE);
});

/** User click on no button from delete dailog box */
test("User click on no button from delete dailog box", async () => {
	fields = {
		id: "1",
		date_created: "15/1/2015",
		date_edited: "15/1/2015",
		name: "test",
		image_url: "test",
		image_alt_text: "test",
		enabled: true,
		sort_order: "1",
		link_url: "test",
	};

	const item = mount(<CarouselAddEdit {...props} />);

	item.setState({ show_confirm_dialog: CONFIRM_DIALOG_DELETE });

	item.instance().doDismissRejectDialog({ preventDefault: jest.fn() });

	expect(item.state().show_confirm_dialog).toEqual(CONFIRM_DIALOG_NONE);
});

/** User click on yes button from delete dailog box */
test("User click on yes button from delete dailog box ", async () => {
	fields = {
		id: "1",
		date_created: "15/1/2015",
		date_edited: "15/1/2015",
		name: "test",
		image_url: "test",
		image_alt_text: "test",
		enabled: true,
		sort_order: "1",
		link_url: "test",
	};

	const item = mount(<CarouselAddEdit {...props} />);

	item.setState({ show_confirm_dialog: CONFIRM_DIALOG_NONE });
	//item.instance().doShowConfirmDelete({ preventDefault: jest.fn()});
	item.instance().doDeletePanel({ preventDefault: jest.fn() });

	//expect(item.state().show_confirm_dialog).toEqual(CONFIRM_DIALOG_DELETE);
	expect(props.deleteCarousel).toHaveBeenCalled();
});

/** User click submit for create a new panel */
test("User click on submit for create a new panel", async () => {
	const mockCall = jest.fn();
	mockFormData = MOCKCAROUSELFORMDATA;
	props.action = ACTION_NEW;
	const item = mount(<CarouselAddEdit {...props} />);

	const form = item.find("form");

	form.simulate("submit", {
		preventDefault: mockCall,
		target: [mockFormData],
		relatedTarget: { value: "create-panel" },
	});

	expect(props.handleSubmit).toBeCalled();
});

/** User click on submit for update panel details */
test("User click on submit for update panel details", async () => {
	const mockCall = jest.fn();
	mockFormData = MOCKCAROUSELFORMDATA;

	const item = mount(<CarouselAddEdit {...props} />);

	const form = item.find("form");

	form.simulate("submit", {
		preventDefault: mockCall,
		target: [mockFormData],
		relatedTarget: { value: "update-panel" },
	});

	expect(props.handleSubmit).toBeCalled();
});

/** User click on submit for delete panel details */
test("User click on submit for delete panel details", async () => {
	const mockCall = jest.fn();
	mockFormData = MOCKCAROUSELFORMDATA;

	const item = mount(<CarouselAddEdit {...props} />);

	const form = item.find("form");

	form.simulate("submit", {
		preventDefault: mockCall,
		target: [mockFormData],
		relatedTarget: { value: "delete-panel" },
	});

	expect(props.handleSubmit).toBeCalled();
});

/** User click on submit Get success/update/error message*/
test("User click on submit get message", async () => {
	const mockCall = jest.fn();
	mockFormData = MOCKCAROUSELFORMDATA;
	message = "";
	fields = {
		id: "1",
		date_created: "15/1/2015",
		date_edited: "15/1/2015",
		name: "test",
		image_url: "test",
		image_alt_text: "test",
		enabled: true,
		sort_order: "1",
		link_url: "test",
	};

	const item = mount(<CarouselAddEdit {...props} />);

	const form = item.find("form");

	form.simulate("submit", {
		preventDefault: mockCall,
		target: [mockFormData],
		relatedTarget: { value: "create-panel" },
	});
	item.setProps({ message: "Successfull Updated" });

	expect(item.find("FormMessage").length).toEqual(1);
});

/** Pass name as " test   name  and occurs error"*/
test('Pass name as " test   name " and occurs error', async () => {
	const mockCall = jest.fn();
	const item = shallow(<CarouselAddEdit {...props} />);

	const nameinput = item.find('[name="name"]');
	nameinput.simulate("change", { target: { name: "name", value: " test   name " } });

	item.update();

	expect(item.state().name_field_error).not.toBe(null);

	nameinput.simulate("change", { target: { name: "name", value: "test name" } });

	item.update();

	expect(item.state().nameisValid).toBe(true);
});

/** User modify name value */
test("User modify name value", async () => {
	mockFormData = MOCKCAROUSELFORMDATA;

	const item = shallow(<CarouselAddEdit {...props} />);

	await wait(100);
	item.update();
	item.instance().doNameInputFieldChange(inputFieldName, inputFieldValue, true);

	expect(props.handleNameInputField).toHaveBeenCalled();
});

/** User modify enabled value */
test("User modify enabled value", async () => {
	mockFormData = MOCKCAROUSELFORMDATA;
	inputFieldName = "enabled";
	inputFieldValue = false;

	const item = shallow(<CarouselAddEdit {...props} />);

	await wait(100);
	item.update();
	item.instance().doCheckInputFieldChange(inputFieldName, inputFieldValue, true);

	expect(props.handleNameInputField).toHaveBeenCalled();
});

/** User enter invalid sort_order value **/
test("User enter invalid sort_order value", async () => {
	const item = mount(<CarouselAddEdit {...props} />);

	const sort_order = item.find('input[name="sort_order"]');

	sort_order.simulate("change", {
		target: {
			name: "sort_order",
			value: "ddgg",
		},
	});

	expect(item.state().number_field_error).toEqual("The sort order must be a numeric value");
});

/** User enter valid float numeric sort_order value **/
test("User enter valid float numeric sort_order value", async () => {
	const item = mount(<CarouselAddEdit {...props} />);

	const sort_order = item.find('input[name="sort_order"]');

	sort_order.simulate("change", {
		target: {
			name: "sort_order",
			value: "1.0",
		},
	});

	expect(item.state().number_field_error).toEqual(null);
});
