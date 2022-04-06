import React from "react";
import ApiContext from "../ApiProvider";
import ApiProvider from "../ApiProvider";

/**local object */
let children;
/** Reset function */
function resetAll() {
	children = "";
}

beforeEach(resetAll);
afterEach(resetAll);

/** wait function */
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

/** default api */
async function defaultApi(endpoint) {
	return null;
}

/** Function renders correctly */
test("Function renders correctly", async () => {
	const item = ApiProvider({ children: "" });
	expect(item.hasOwnProperty("type")).toBe(true);
});
