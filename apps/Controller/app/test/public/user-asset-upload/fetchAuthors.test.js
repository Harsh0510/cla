const fetchAuthorsRaw = require("../../../core/public/user-asset-upload/fetchAuthors");

let querier;
let currUserId;

function resetAll() {
	querier = async (values, binds) => {
		binds = binds.slice(1); // skip over user id
		const ret = [];
		for (let i = 0, len = binds.length; i < len; i += 2) {
			ret.push({
				firstName: binds[i],
				lastName: binds[i + 1],
			});
		}
		return {
			rows: ret,
			rowCount: ret.length,
		};
	};
	currUserId = 12345;
}

beforeEach(resetAll);
afterEach(resetAll);

const fetchAuthors = (authors) => fetchAuthorsRaw(querier, currUserId, authors);

test("no authors", async () => {
	const ret = await fetchAuthors([]);
	expect(ret).toEqual([]);
});

test("with authors", async () => {
	const ret = await fetchAuthors([
		"John Smith",
		["Emily", "Roberts"],
		{
			firstName: "Jane",
			lastName: "Doe",
		},
		"Skip-authors-with-no-last-name",
		["Skip authors with no last name"],
		{
			firstName: "Skip authors with no last name",
		},
		["First", "Middle", "Last"],
		"Another R. Dude",
	]);
	expect(ret).toEqual([
		{
			firstName: "John",
			lastName: "Smith",
		},
		{
			firstName: "Emily",
			lastName: "Roberts",
		},
		{
			firstName: "Jane",
			lastName: "Doe",
		},
		{
			firstName: "First",
			lastName: "Last",
		},
		{
			firstName: "Another",
			lastName: "Dude",
		},
	]);
});
