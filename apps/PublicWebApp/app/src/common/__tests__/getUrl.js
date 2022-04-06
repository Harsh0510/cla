import getUrl from "../getUrl";

let suffix,
	mockWinodwOrigin = null;

jest.mock("../customWindowOrigin", () => {
	return function () {
		return mockWinodwOrigin;
	};
});

function resetAll() {
	suffix = "/1256-book-title";
}

beforeEach(resetAll);
afterEach(resetAll);

/** Get the encode url without pass suffix  */
test(`Get the encode url without pass suffix`, async () => {
	const item = getUrl();
	expect(item).toBe("http://localhost");
});

/** Get the encode url with suffix value */
test(`Get the encode url with suffix value`, async () => {
	const item = getUrl(suffix);
	expect(item).toBe("http://localhost" + suffix);
});

// /** Get the encode url with port value*/
// test(`Get the encode url with port value`, async () => {
// 	global.window = Object.create(window);
// 	Object.defineProperty(window, 'location', {
// 		value: {
// 			port: 19000,
// 			writable: true
// 		},
// 	});
// 	window.location.port = 19000;
// 	const item = getUrl(suffix);
// 	expect(item).toBe("http://localhost" + suffix);
// });
