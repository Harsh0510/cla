// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";
import React from "react";
import { shallow } from "enzyme";
import AssetPageNotAvailable from "../index";

let mockChildren, mockMaxHeight, mockFunction, mockHandleClick, mockHandleRef, mockFontSize, mockDataIndex;

/** Reset function */
function resetAll() {
	mockFunction = jest.fn();
	mockChildren = "https://dummyimage.com/1200x1000/ee0000/333.png&text=1";
	mockMaxHeight = "20px";
	mockHandleClick = mockFunction;
	mockHandleRef = mockFunction;
	mockFontSize = "20px";
	mockDataIndex = 2;
}

beforeEach(resetAll);
afterEach(resetAll);
/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(
		<AssetPageNotAvailable
			handleRef={mockHandleRef}
			handleClick={mockHandleClick}
			maxHeight={mockMaxHeight}
			children={mockChildren}
			dataIndex={mockDataIndex}
		/>
	);
	expect(item.find("PageNotAvailable").length).toBe(1);
	expect(item.find("p").length).toBe(1);
});
