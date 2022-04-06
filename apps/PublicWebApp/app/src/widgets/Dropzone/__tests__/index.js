// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import CustomDropzone from "../index";

let props, rejects, e, file;

function resetAll() {
	props = {
		accept: ".XLS, .XLSX, .ODT, .ODS, .CSV",
		multiple: false,
		handleUpload: jest.fn(),
		showDragDropArea: true,
		invalidateFileUpload: jest.fn(),
	};
	rejects = {};
	e = {
		preventDefault: jest.fn(),
	};
	file = [createFile("file1.xls", 1111, "application/vnd.ms-excel")];
}

beforeEach(resetAll);
afterEach(resetAll);

const createFile = (name, size, type) => {
	const file = new File([], name, { type });
	Object.defineProperty(file, "size", {
		get() {
			return size;
		},
	});
	return file;
};

/** Component renders correctly */
test(`Component renders correctly`, async () => {
	const item = mount(<CustomDropzone {...props} />);
	expect(item.find("Container").length).toBe(1);
});

test(`Component renders correctly with hide Drag Area`, async () => {
	props.showDragDropArea = false;
	const item = mount(<CustomDropzone {...props} />);
	expect(item.find("Container").length).toBe(0);
});

test("Component call handleOnDrop", () => {
	const item = mount(<CustomDropzone {...props} />);
	const spy = jest.spyOn(item.instance(), "onDrop");
	item.instance().onDrop(file, rejects, e);
	expect(spy).toHaveBeenCalled();
});

test("Component call handleUpload", () => {
	const item = mount(<CustomDropzone {...props} />);
	const spy = jest.spyOn(item.instance().props, "handleUpload");
	item.instance().onDrop(file, rejects, e);
	expect(spy).toHaveBeenCalled();
});

test("User drop without any file select", () => {
	file = [];
	const item = mount(<CustomDropzone {...props} />);
	item.instance().onDrop(file, rejects, e);
	expect(item.state().files.length).toBe(0);
});

test("User close the file upload", () => {
	file = [];
	const item = mount(<CustomDropzone {...props} />);
	item.instance().onCancel();
	expect(item.state().files.length).toBe(0);
});

test(`User click on \'Bulk Unlock\'`, () => {
	const mockBulkUnlock = jest.fn();
	const item = mount(<CustomDropzone {...props} />);
	item.instance().dropzoneRef.open = mockBulkUnlock;
	item.find("Button").simulate("click");
	expect(mockBulkUnlock).toHaveBeenCalled();
});

test(`User click on \'Bulk Unlock\' when hide Drag Area`, async () => {
	props.showDragDropArea = false;
	const mockPreventDefault = jest.fn();
	const item = mount(<CustomDropzone {...props} />);
	item.find("Button").simulate("click", { preventDefault: mockPreventDefault });
	expect(mockPreventDefault).toHaveBeenCalled();
});

test(`User click on \'drag area\'`, () => {
	const mockPreventDefault = jest.fn();
	const item = mount(<CustomDropzone {...props} />);
	item.find("Container").simulate("click", { preventDefault: mockPreventDefault });
	expect(mockPreventDefault).toHaveBeenCalled();
});

test(`User drag file`, () => {
	const item = mount(<CustomDropzone {...props} />);
	const container = item.find("Container");
	item.setProps({ isDragActive: false });
	expect(container.text()).toEqual("Drag XLS, XLSX, ODT, TXT, ODS or CSV file here...");
});

test(`When file is valid`, () => {
	const item = mount(<CustomDropzone {...props} />);
	item.setProps({ isValid: true });
	const container = item.find("Container");
	expect(item.props().isValid).toBe(true);
});

test(`When file is not valid`, () => {
	const item = mount(<CustomDropzone {...props} />);
	item.setProps({ isValid: false });
	const container = item.find("Container");
	expect(item.props().isValid).toBe(false);
});

test(`When file isDragReject or isDragActive is true`, () => {
	const item = mount(<CustomDropzone {...props} />);
	item.setProps({ isDragReject: true, isDragActive: true });
	const container = item.find("Container");
	expect(item.props().isDragReject).toBe(true);
});

test("show alternate text and custome dropzone text", () => {
	props.buttonTitle = "Choose File";
	props.alternateText = "Alternatively you can select the button below to select a file from your computer and unlock that instead.";
	props.dragFieldText = "Custom Dragfield text";
	const item = mount(<CustomDropzone {...props} />);
	item.setProps({ errorMessage: "Invalid File Type" });
	expect(item.find("AlterTextDiv").length).toBe(1);
	expect(item.find("Container").text().indexOf("Custom Dragfield").length !== -1).toBe(true);
});
