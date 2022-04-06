const byId = require("../../common/byId");

let getMockObject, passMockObject;

function resetAll() {
	getMockObject = { "1": "United Kingdom", "2": "India", "3": "Canada" };
	passMockObject = [
		{
			id: "1",
			name: "United Kingdom",
		},
		{
			id: "2",
			name: "India",
		},
		{
			id: "3",
			name: "Canada",
		},
	];
}

beforeEach(resetAll);
afterEach(resetAll);

test(`return the object with key value pair`, async () => {
	const item = byId(passMockObject);
	expect(item).toEqual(getMockObject);
});
