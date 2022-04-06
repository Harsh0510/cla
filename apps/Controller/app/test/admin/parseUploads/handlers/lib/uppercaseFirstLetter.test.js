const uppercaseFirstLetter = require("../../../../../core/admin/parseUploads/handlers/lib/uppercaseFirstLetter");

let str;

function resetAll() {
	str = "string";
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Return string with uppercaseFirstLetter when string passed`, async () => {
	const item = uppercaseFirstLetter(str);
	expect(item).toEqual("String");
});

test(`Return number when number passed`, async () => {
	str = 123;
	const item = uppercaseFirstLetter(str);
	expect(item).toEqual(123);
});

test(`Return null when string not passed`, async () => {
	str = null;
	const item = uppercaseFirstLetter(str);
	expect(item).toEqual(null);
});
