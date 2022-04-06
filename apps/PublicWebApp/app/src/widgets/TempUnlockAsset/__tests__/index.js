import React from "react";
import { shallow, mount } from "enzyme";
import TempUnlockAsset from "../index";

let props, mockFunction;

function resetAll() {
	mockFunction = jest.fn();
	props = {
		multiple: false,
		data: [
			{
				expiration_date: "2019-06-03T04:50:23.495Z",
				pdf_isbn13: "132456789",
				title: "Test title 1",
			},
			{
				expiration_date: "2019-06-03T04:50:23.495Z",
				pdf_isbn13: "78945613",
				title: "Test title 2",
			},
		],
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test("Component renders correctly when single item", async () => {
	const item = shallow(<TempUnlockAsset {...props} />);
	expect(item.find("PromptIcon").length).toBe(1);
	expect(item.find("UnlockLink").length).toBe(1);
	expect(item.find("ExpirationDate").length).toBe(1);
	expect(item.find("ExpirationDate").text()).toEqual("3 June 2019");
});

test("Component renders correctly when multiple items", async () => {
	props.multiple = true;
	const item = shallow(<TempUnlockAsset {...props} />);
	expect(item.find("PromptIcon").length).toBe(1);
	expect(item.find("AssetTitle").length).toBe(2);
});
