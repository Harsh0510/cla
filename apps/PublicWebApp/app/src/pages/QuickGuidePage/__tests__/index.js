// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import About from "../index";

/** Component renders correctly */

/** Component renders with header title */
test("Component renders with header title", async () => {
	const item = shallow(<About />);
	const mainTitle = item.find("MainTitle").dive();
	expect(mainTitle.find("MainTitleText h1").text()).toEqual("Our quick guide to the main points of the Education Platform terms of use");
});

/** Component renders with ListWithCheckBox option*/
test("Component renders with ListWithCheckBox option", async () => {
	const item = shallow(<About />);
	const listWithCheckBox = item.find("ListWithCheckBox").at(0).dive();
	expect(listWithCheckBox.find("span").at(0).text()).toEqual(
		"Before making any copies, an institution must demonstrate ownership of a book by scanning the barcode to unlock it. CLA reserve the right to verify that an institution owns a book."
	);
});
