import React from "react";
import { shallow, mount } from "enzyme";
import { HeadTitle, PageTitle } from "../index";
import MockHeadTitle from "../../../mocks/MockHeadTitle";

/** Component renders correctly */
test("Component renders correctly", async () => {
	const title = MockHeadTitle.home;
	const item = mount(<HeadTitle title={title} />);
	expect(item.find("HelmetWrapper").length).toBe(1);
});

/** When there is no title in page */
test("When there is no title in page", async () => {
	const title = "";
	const item = mount(<HeadTitle title={title} suffix={"suff"} />);
	expect(item.find("title").length).toBe(0);
});
