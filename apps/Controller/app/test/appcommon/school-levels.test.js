const schoolLevels = require("../../common/school-levels");

let getMockResult;

function resetAll() {
	getMockResult = [
		{
			id: `nursery`,
			name: `Nursery`,
		},
		{
			id: `first`,
			name: `First`,
		},
		{
			id: `primary`,
			name: `Primary`,
		},
		{
			id: `infant`,
			name: `Infant`,
		},
		{
			id: `junior`,
			name: `Junior`,
		},
		{
			id: `middle`,
			name: `Middle`,
		},
		{
			id: `secondary`,
			name: `Secondary`,
		},
		{
			id: `high`,
			name: `High`,
		},
		{
			id: `allthrough`,
			name: `All-through`,
		},
		{
			id: `post-16`,
			name: `Post 16`,
		},
		{
			id: `other`,
			name: `Other`,
		},
	];
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Get school-level array`, async () => {
	expect(schoolLevels).toEqual(getMockResult);
});

test(`Match school-level values`, async () => {
	for (let i = 0; i < schoolLevels.length; i++) {
		expect(schoolLevels[i].name).toEqual(getMockResult[i].name);
		expect(schoolLevels[i].id).toEqual(getMockResult[i].id);
	}
});
