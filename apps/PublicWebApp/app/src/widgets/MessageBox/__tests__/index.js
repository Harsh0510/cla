// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import MessageBox from "../index";
import MockMessageType from "../../../mocks/MockMessageType";

const ERROR_MESSAGE = "Please enter a valid email address.";

/**Component renders correctly */
test("Component renders correctly", async () => {
	const item = mount(<MessageBox type={MockMessageType.error} title="title" message={ERROR_MESSAGE} displayIcon={false} />);

	expect(item.find("ErrorMessage").length).toBe(1);
	expect(item.find("span").length).toBe(0);
});

/**When Message Type is warning */
test("When Message Type is warning", async () => {
	const item = mount(<MessageBox type={MockMessageType.warning} title="" message={ERROR_MESSAGE} />);

	expect(item.prop("type")).toEqual("warning");
});

/**When Message Type is success */
test("When Message Type is success", async () => {
	const item = mount(<MessageBox type={MockMessageType.success} title="" message={ERROR_MESSAGE} />);

	expect(item.prop("type")).toEqual("success");
});

/** When Message Type is not set then display default message */
test("When Message Type is not set then display default message", async () => {
	const item = mount(<MessageBox type={"other"} title="" message={ERROR_MESSAGE} />);

	expect(item.prop("type")).toEqual("other");
});

/**When Message Type is confirmed */
test("When Message Type is confirmed", async () => {
	const item = mount(<MessageBox type={MockMessageType.confirmed} title="" message={ERROR_MESSAGE} />);

	expect(item.prop("type")).toEqual("confirmed");
});
