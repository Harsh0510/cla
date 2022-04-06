import React from "react";
import ContactSupportLink from "../index";
import { shallow } from "enzyme";

let props;

function resetAll() {
	props = {
		linkText: "",
	};
}

beforeEach(resetAll);
afterEach(resetAll);

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

test("User see contact support link", async () => {
	const linkText = "contact support";
	const item = shallow(<ContactSupportLink />);
	expect(item.find("BlueLink").length).toBe(1);
	expect(item.find("BlueLink").text()).toBe(linkText);
});

test("User see request support link", async () => {
	const linkText = "request support";
	props.linkText = linkText;
	const item = shallow(<ContactSupportLink {...props} />);
	expect(item.find("BlueLink").length).toBe(1);
	expect(item.find("BlueLink").text()).toBe(linkText);
});
