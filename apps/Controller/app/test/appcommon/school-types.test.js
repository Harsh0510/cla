const schoolTypes = require("../../common/school-types");

let getMockResult;

function resetAll() {
	getMockResult = [
		{
			id: `academy`,
			name: `Academy`,
		},
		{
			id: `college`,
			name: `College`,
		},
		{
			id: `free-school`,
			name: `Free school`,
		},
		{
			id: `independent`,
			name: `Independent`,
		},
		{
			id: `la-maintained`,
			name: `LA maintained`,
		},
		{
			id: `special-school`,
			name: `Special school`,
		},
		{
			id: `welsh-school`,
			name: `Welsh school`,
		},
		{
			id: `state-fe`,
			name: `State FE`,
		},
		{
			id: `independent-fe`,
			name: `Independent FE`,
		},
		{
			id: `sixth-form`,
			name: `6th Form`,
		},
		{
			id: `general-fe`,
			name: `General FE`,
		},
		{
			id: `land-college`,
			name: `Land college`,
		},
		{
			id: "adult-learning",
			name: "Adult Learning / Council-run services",
		},
		{
			id: "art-college",
			name: "Art, design and performing arts college",
		},
		{
			id: `other`,
			name: `Other`,
		},
	];
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Get school-types array`, async () => {
	expect(schoolTypes).toEqual(getMockResult);
});

test(`Match school-types values`, async () => {
	for (let i = 0; i < schoolTypes.length; i++) {
		expect(schoolTypes[i].name).toEqual(getMockResult[i].name);
		expect(schoolTypes[i].id).toEqual(getMockResult[i].id);
	}
});
