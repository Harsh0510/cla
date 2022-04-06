import React from "react";
import AuthContext from "../AuthContext";

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = <AuthContext />;

	expect(item.hasOwnProperty("type")).toBe(true);
});
