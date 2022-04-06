import apiBaseOrigin from "../apiBaseOrigin";
let mockResult;

const OLD_ENV = process.env;
/**
 * Reset function
 */
function resetAll() {
	mockResult = {};
	jest.resetModules(); // most important - it clears the cache
	process.env = { ...OLD_ENV }; // make a copy
	(function () {
		"use strict";
		Object.defineProperty(window, "location", {
			value: {
				port: "16000",
				hostname: "http",
				protocol: "http:",
				host: "http",
			},
		});
	})();
}

beforeEach(resetAll);
afterEach(resetAll);

/* Test methods */

test(`Returns apiBaseOrigin url successfully if CLA_ENDPOINT_CONTROLLER is pass`, async () => {
	process.env.CLA_ENDPOINT_CONTROLLER = "CLA_ENDPOINT_CONTROLLER";
	const apiBaseOrigin = require("../apiBaseOrigin");
	expect(apiBaseOrigin).toEqual({ default: "http://CLA_ENDPOINT_CONTROLLER" });
});

test(`apiBaseOrigin method runs correctly`, async () => {
	expect(apiBaseOrigin).toEqual("http://api.localhost");
});

test(`Returns apiBaseOrigin url successfully when port is 16000`, async () => {
	global.window = Object.create(window);
	window.location.port = 16000;
	window.location.hostname = "http";
	window.location.protocol = "http";
	const apiBaseOrigin = require("../apiBaseOrigin");
	expect(apiBaseOrigin).toEqual({ default: "http//http:13000" });
});

test(`Returns apiBaseOrigin url successfully when window.location.host is public-web-app`, async () => {
	global.window = Object.create(window);
	window.location.port = 3000;
	window.location.host = "public-web-app";
	window.location.protocol = "http";
	const apiBaseOrigin = require("../apiBaseOrigin");
	expect(apiBaseOrigin).toEqual({ default: "http//production-controller" });
});

test(`Returns apiBaseOrigin url successfully when window.location.host is www.`, async () => {
	global.window = Object.create(window);
	window.location.port = 3000;
	window.location.host = "www.";
	window.location.protocol = "http";
	const apiBaseOrigin = require("../apiBaseOrigin");
	expect(apiBaseOrigin).toEqual({ default: "http//api." });
});
