const territories = require("../../common/territories");

let getMockResult;

function resetAll() {
	getMockResult = [
		{
			id: "england",
			name: "England",
		},
		{
			id: "guernsey",
			name: "Guernsey",
		},
		{
			id: "jersey",
			name: "Jersey",
		},
		{
			id: `isle-of-man`,
			name: `Isle of Man`,
		},
		{
			id: `northern-ireland`,
			name: `Northern Ireland`,
		},
		{
			id: `scotland`,
			name: `Scotland`,
		},
		{
			id: `wales`,
			name: `Wales`,
		},
	];
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Get territories array`, async () => {
	expect(territories).toEqual(getMockResult);
});

test(`Match territories values`, async () => {
	for (let i = 0; i < territories.length; i++) {
		expect(territories[i].name).toEqual(getMockResult[i].name);
		expect(territories[i].id).toEqual(getMockResult[i].id);
	}
});
