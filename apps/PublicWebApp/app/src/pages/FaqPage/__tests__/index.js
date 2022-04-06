import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import FaqRaw from "../index";

jest.mock("../FaqList", () => {
	return [
		{
			title: <div>How do I get access to the Education Platform?</div>,
			description: (
				<div>
					<p>The Education Platform is provided at no additional cost to holders of the CLA Education Licence.</p>
					<p>
						Your school needs to be registered on the Platform, and each teacher or other user will also need to 
						<a href="/how-to-register" title="how to register" target="_blank">
							register
						</a>
						.
					</p>
				</div>
			),
		},
		{
			title: <div>How do I get Assets to the Education Platform?</div>,
			description: (
				<div>
					<p>The Education Platform is provided at no additional cost to holders of the CLA Education Licence.</p>
					<p>
						Your school needs to be registered on the Platform, and each teacher or other user will also need to 
						<a href="/how-to-register" title="how to register" target="_blank">
							register
						</a>
						.
					</p>
				</div>
			),
		},
	];
});

/** renders correctly with array only */
test("renders correctly", async () => {
	const item = shallow(<FaqRaw />);
	expect(item.state("faqArray").length).toBe(2);
	expect(item.find("HeadTitle").length).toBe(1);
});
