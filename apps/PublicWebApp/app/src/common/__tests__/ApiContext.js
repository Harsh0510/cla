import React from "react";
import ApiContext from "../ApiContext";

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = <ApiContext />;

	expect(item.hasOwnProperty("type")).toBe(true);
});
