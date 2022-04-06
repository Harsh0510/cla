const byId = require("../byId");
import COUNTRYDATA from "../../mocks/MockCountry";

let mockObject;

function resetAll() {
	mockObject = { 1: "United Kingdom", 2: "India", 3: "Canada" };
}

beforeEach(resetAll);
afterEach(resetAll);

/** Object return with by Id */
test("Object return with Id", async () => {
	const item = byId(COUNTRYDATA.result);
	expect(item).toEqual(mockObject);
});
