const genPasswordHash = require("../../../core/auth/common/genPasswordHash");

let password;

function goodObject() {
	return {
		activation_token: "61616161616161616161616161616161",
		algo: "sha256",
		hash: "9bdf54a1388420d369393e8e4a315700e8afc17abe843ccde7da5be18b842dbe",
		salt: "61616161616161616161616161616161",
	};
}

jest.mock("crypto", () => ({
	randomBytes: jest
		.fn((recordId, callback) => {
			callback(undefined, {
				status: 200,
			});
		})
		.mockReturnValue(new Buffer.from("a".repeat(32))),
	createHmac: jest.fn(() => {
		return {
			update: jest.fn(() => {
				return Promise.resolve();
			}),
			digest: jest.fn(() => {
				return "9bdf54a1388420d369393e8e4a315700e8afc17abe843ccde7da5be18b842dbe";
			}),
		};
	}),
}));

jest.mock("util", () => ({
	promisify: () =>
		jest.fn(() => {
			return Promise.resolve(new Buffer.from("a".repeat(32)));
		}),
}));

function resetAll() {
	password = "abc@12345#A";
}

beforeEach(resetAll);
afterEach(resetAll);

test("Success when algo is 'sha256'", async () => {
	const data = goodObject();
	const result = await genPasswordHash(password);
	expect(result.algo).toEqual(data.algo);
});

test("function returns with object value", async () => {
	const data = goodObject();
	const result = await genPasswordHash(password);
	expect(result).toEqual(data);
});
