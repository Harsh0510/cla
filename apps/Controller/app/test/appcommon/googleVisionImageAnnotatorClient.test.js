const OLD_ENV = process.env;
let mockOpts;
// jest.mock("@google-cloud/vision");
/**
 * Reset function - called before each test.
 */

function resetAll() {
	mockOpts = {
		creds: {
			client_email: "abc@gamil.com",
			private_key: "123",
		},
		project_id: 123,
	};
}
beforeEach(() => {
	jest.resetModules(); // most important - it clears the cache
	process.env = { ...OLD_ENV }; // make a copy
	resetAll();
});

afterAll(() => {
	process.env = OLD_ENV; // restore old env
	resetAll();
});

test(`success when pass opts`, async () => {
	jest.mock("@google-cloud/vision", () => {
		return {
			ImageAnnotatorClient: class {
				constructor(data) {
					this.opts = {
						creds: {
							client_email: "abc@gamil.com",
							private_key: "123",
						},
						project_id: 123,
					};
				}
			},
		};
	});
	const client = require(`../../common/googleVisionImageAnnotatorClient`);
	new client.constructor(mockOpts);
	expect(client.opts.creds.client_email).toBe("abc@gamil.com");
	expect(client.opts.creds.private_key).toBe("123");
	expect(client.opts.project_id).toBe(123);
});

test(`success when pass CLA_GOOGLE_CLOUD_CREDS`, async () => {
	jest.mock("@google-cloud/vision", () => {
		return {
			ImageAnnotatorClient: class {
				constructor(mockOpts) {
					this.opts = mockOpts;
				}
			},
		};
	});
	process.env.CLA_GOOGLE_CLOUD_CREDS = JSON.stringify({ client_email: "abc@gmail.com", private_key: "abc" });
	const client = require(`../../common/googleVisionImageAnnotatorClient`);
	expect(client.opts.credentials.client_email).toBe("abc@gmail.com");
	expect(client.opts.credentials.private_key).toBe("abc");
});

test(`success when pass CLA_GOOGLE_CLOUD_PROJECT_ID`, async () => {
	jest.mock("@google-cloud/vision", () => {
		return {
			ImageAnnotatorClient: class {
				constructor(mockOpts) {
					this.opts = mockOpts;
				}
			},
		};
	});
	process.env.CLA_GOOGLE_CLOUD_PROJECT_ID = "     123";
	const client = require(`../../common/googleVisionImageAnnotatorClient`);
	expect(client.opts.projectId).toBe("123");
});
