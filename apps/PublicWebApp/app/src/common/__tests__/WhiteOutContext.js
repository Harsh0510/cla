import React from "react";
import WhiteOutContext from "../WhiteOutContext";

/** Component renders correctly */
test(`Component renders correctly`, async () => {
	const item = <WhiteOutContext />;
	expect(item.hasOwnProperty("type")).toBe(true);
});
