// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import UnlockWorkPage from "../index";
import MockWorks from "../../../mocks/MockWorks";
import Presentation from "../Presentation";
import FlyOutModal from "../../../widgets/FlyOutModal";
import MockApi from "../../../mocks/MockApi";
import MockUsersData from "../../../mocks/MockUser";
import MockTempUnlockAsset from "../../../mocks/MockTempUnlockAsset";

const MockPassData = {
	quaggaInitError: null,
	isbn: null,
	canvasDomImage: null,
};
let mockMediaDevices = true;
let mockEANIsValid = true;
let location;
let history;
let mockResultFlyOutIndex;
let mockResultscreenFlyOutIndex;
let mockResultFlyOutUpdate;
let MockUserData;
let mockResultUserUnlockedAttempt;
let mockResultTempUnlockAsset;

let mockQuerySelector = (selector) => document.querySelector(selector);
let mockCreateElement = (tagName) => document.createElement(tagName);

// Mock import
jest.mock("../../../common/withApiConsumer", () => {
	const withApiConsumer = require("../../../mocks/withApiConsumer");
	return withApiConsumer;
});
jest.mock("../../../common/withAuthRequiredConsumer", () => {
	const withAuthRequiredConsumer = require("../../../mocks/withAuthRequiredConsumer");
	return withAuthRequiredConsumer;
});

jest.mock("../../../common/eanIsValid", () => {
	return function () {
		return mockEANIsValid;
	};
});

let mockTimeOutSec = 100;

jest.mock("../../../common/customSetTimeout", () => {
	return function (method, time) {
		setTimeout(method, mockTimeOutSec);
	};
});

jest.mock("../../../common/detectCamAvailability", () => {
	return function (cb) {
		cb(true);
	};
});

jest.mock("../../../common/FlyOutHandler", () => {
	return class {
		constructor(instance, api, screen) {
			this._instance = instance;
			this._api = api;
			this._screen = screen;
		}
		getSeen() {
			this._api("/public/first-time-user-experience-get-mine-seen", { screen: this._screen }).then((result) => {
				this._instance.setState({
					flyOutIndex: result.result,
				});
			});
		}
		onClose(cb, redirectURL) {
			const nextIndex = this._instance.state.flyOutIndex + 1;
			this._api("/public/first-time-user-experience-update", { screen: this._screen, index: nextIndex }).then((result) => {
				if (result.result) {
					this._instance.setState({
						flyOutIndex: nextIndex,
					});
				}
				if (typeof cb === "function") {
					cb();
				}
				if (redirectURL && typeof redirectURL === "string") {
					//const url = getUrl(redirectURL);
					//window.location.href = url;
				}
			});
		}

		getSeenHome() {
			this._api("/public/first-time-user-experience-get-mine-seen", { screen: "home" }).then((result) => {
				this._instance.setState({
					screenFlyOutIndex: result.result,
				});
			});
		}

		onCloseNotification(cb, redirectURL) {
			const nextIndex = this._instance.state.flyOutIndexNotification + 1;
			this.setSeenNotification(nextIndex).then(() => {
				if (typeof cb === "function") {
					cb();
				}
				if (redirectURL && typeof redirectURL === "string") {
					this._instance.props.history.push(redirectURL);
				}
			});
		}
		getSeenNotification() {
			this._api("/public/first-time-user-experience-get-mine-seen", { screen: "notification" }).then((result) => {
				if (!this._active) {
					return;
				}
				this._instance.setState({
					flyOutIndexNotification: parseInt(result.result, 10),
				});
			});
		}
		destroy() {
			this._active = false;
		}
		stop() {
			return;
		}
		getSeenFlyOutIndex(screen) {
			this._api("/public/first-time-user-experience-get-mine-seen", { screen: screen }).then((result) => {
				if (!this._active) {
					return;
				}
				this._instance.setState({
					screenFlyOutIndex: parseInt(result.result, 10),
				});
			});
		}
	};
});

jest.mock("../../../common/googleEvent", () => {
	return jest.fn();
});

// const unlockedISBN = '4871836482365';
// const lockedISBN = '9870836489178';

let mockUserData = {
	data: {
		first_name: "Test",
		last_name: "Surname",
		role: "teacher",
		school: "Test School",
	},
};

// Mock data for a single work
const mockData = MockWorks[0];

jest.mock("../../../common/CustomNavigator", () => {
	return function () {
		return mockMediaDevices; //try to true and false
	};
});

jest.mock("../../../common/CustomQuerySelector", () => {
	return (selector) => mockQuerySelector(selector);
});

jest.mock("../../../common/CustomCreateElement", () => {
	return (tagName) => mockCreateElement(tagName);
});

jest.mock("../../../common/CustomNavigatorMediaDevices", () => {
	return function () {
		return {
			mediaDevices: {
				getUserMedia: (object) => {
					return new Promise((res, rej) => {
						res(<video autoplay="true" preload="auto" src="" muted="true" playsinline="true"></video>);
					});
				},
			},
		};
	};
});

jest.mock("quagga", () => {
	return {
		init(obj, cb) {
			setTimeout(() => {
				cb(MockPassData.quaggaInitError);
			}, 20);
		},
		start() {
			if (MockPassData.canvasDomImage) {
				setTimeout(() => {
					this.canvas.dom.image = MockPassData.canvasDomImage;
					this.onProcessedCb(null);

					setTimeout(() => {
						this.onDetectedCb({
							codeResult: {
								code: MockPassData.isbn, //isbn,
							},
						});
					}, 200);
				}, 50);
			}
		},
		stop() {},
		onProcessed(cb) {
			this.onProcessedCb = cb;
		},
		onDetected(cb) {
			this.onDetectedCb = cb;
		},
		offDetected() {},
		canvas: {
			dom: {
				image: false, //MockPassData.canvasDomImage,
			},
		},
	};
});

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

async function defaultApi(endpoint, data) {
	// "UserPage" only queries this endpoint
	if (endpoint === "/public/get-temp-unlocked-assets") {
		return mockResultTempUnlockAsset;
	} else if (endpoint === "/public/first-time-user-experience-get-mine-seen") {
		return mockResultFlyOutIndex;
	} else if (endpoint === "/public/first-time-user-experience-update") {
		return mockResultFlyOutUpdate;
	}

	// This will be caught by the promise in the component
	throw new Error("should never be here");
}

/**
 * Reset function
 */
function resetAll() {
	mockMediaDevices = true;
	MockPassData.quaggaInitError = null;
	MockPassData.isbn = null;
	MockPassData.canvasDomImage = true;
	mockTimeOutSec = 100;
	mockEANIsValid = true;
	mockResultFlyOutIndex = { result: -1 };
	mockResultscreenFlyOutIndex = { result: -1 };
	mockResultFlyOutUpdate = { result: true };
	MockUserData = MockUsersData[2];
	mockResultUserUnlockedAttempt = { result: false };
	mockResultTempUnlockAsset = MockTempUnlockAsset;
	location = {
		search: {
			isbn: null,
		},
	};
	history = {
		push: jest.fn(),
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test("Component renders correctly", async () => {
	const item = shallow(
		<UnlockWorkPage location={location} match={{ params: { isbn: "string" } }} withAuthConsumer_myUserDetails={mockUserData.data} api={defaultApi} />
	)
		.dive()
		.dive();

	expect(item.containsMatchingElement(<Presentation />)).toBe(true);
});

test("Set Notification Count", async () => {
	const item = shallow(
		<UnlockWorkPage location={location} match={{ params: { isbn: "string" } }} withAuthConsumer_myUserDetails={mockUserData.data} api={defaultApi} />
	)
		.dive()
		.dive();

	expect(item.containsMatchingElement(<Presentation />)).toBe(true);
	item.instance().setNotificationCount(2);
	expect(item.state("notificationCount")).toEqual(2);
});

test("Update the Homescreen Index when first time open unlock page", async () => {
	mockResultUserUnlockedAttempt = { result: true };
	const item = shallow(
		<UnlockWorkPage location={location} match={{ params: { isbn: "string" } }} withAuthConsumer_myUserDetails={MockUserData} api={defaultApi} />
	)
		.dive()
		.dive();
	item.setState({ screenFlyOutIndex: -1 });
	item.instance().updateHomeScreenIndex();

	await wait(50);
	expect(item.containsMatchingElement(<Presentation />)).toBe(true);
	expect(item.state("flyOutIndex")).toBe(-1);
});

test("Update the Homescreen Index when already visited search page first time open unlock page", async () => {
	mockResultUserUnlockedAttempt = { result: true };
	mockResultFlyOutIndex = { result: 4 };
	const item = shallow(
		<UnlockWorkPage location={location} match={{ params: { isbn: "string" } }} withAuthConsumer_myUserDetails={MockUserData} api={defaultApi} />
	)
		.dive()
		.dive();

	await wait(50);
	expect(item.containsMatchingElement(<Presentation />)).toBe(true);
	expect(item.state("flyOutIndex")).toBe(4);
});

test("Update the Homescreen Index when visit search page before unlock page", async () => {
	mockResultUserUnlockedAttempt = { result: true };
	mockResultFlyOutIndex = { result: 3 };
	const item = shallow(
		<UnlockWorkPage location={location} match={{ params: { isbn: "string" } }} withAuthConsumer_myUserDetails={MockUserData} api={defaultApi} />
	)
		.dive()
		.dive();

	await wait(50);
	expect(item.containsMatchingElement(<Presentation />)).toBe(true);
	expect(item.state("flyOutIndex")).toBe(3);
});

test("Update the Homescreen Index when visit search page before unlock page", async () => {
	mockResultUserUnlockedAttempt = { result: true };
	mockResultFlyOutIndex = { result: 3 };
	const item = shallow(
		<UnlockWorkPage location={location} match={{ params: { isbn: "string" } }} withAuthConsumer_myUserDetails={MockUserData} api={defaultApi} />
	)
		.dive()
		.dive();
	await wait(50);
	expect(item.containsMatchingElement(<Presentation />)).toBe(true);
	expect(item.state("flyOutIndex")).toBe(3);
});

test("Update the Homescreen Index when first time visit unlock page first time open unlock page", async () => {
	mockResultUserUnlockedAttempt = { result: false };
	mockResultscreenFlyOutIndex = { result: -1 };
	const item = shallow(
		<UnlockWorkPage location={location} match={{ params: { isbn: "string" } }} withAuthConsumer_myUserDetails={MockUserData} api={defaultApi} />
	)
		.dive()
		.dive();
	await wait(50);
	expect(item.containsMatchingElement(<Presentation />)).toBe(true);
	expect(item.state("flyOutIndex")).toBe(-1);
});

//componentWillUnmount
test("Component redener componentWillUnmount", async () => {
	MockPassData.quaggaInitError = "error";
	MockPassData.isbn = "9870836489178";
	MockPassData.canvasDomImage = true;
	mockMediaDevices = false;

	const item = shallow(
		<UnlockWorkPage
			location={location}
			match={{ params: { isbn: MockPassData.isbn } }}
			withAuthConsumer_myUserDetails={mockUserData.data}
			timeout_interval={20}
			api={defaultApi}
		/>
	)
		.dive()
		.dive();
	await wait(50);

	item.instance().componentWillUnmount();
	item.update();
	const element = <video autoplay="true" preload="auto" src="" muted="true" playsinline="true"></video>;
	//user capture a snap
	item.instance().takeASnap(element);

	expect(item.containsMatchingElement(<Presentation />)).toBe(true);
});

//User try to scan barcode and get timeout
// barcord try to scan less than 3 times
test("User try to scan barcode with failedCount with 2", async () => {
	MockPassData.quaggaInitError = null;
	MockPassData.isbn = "9870836489178";
	MockPassData.canvasDomImage = true;
	mockMediaDevices = true;

	const item = shallow(
		<UnlockWorkPage
			location={location}
			match={{ params: { isbn: MockPassData.isbn } }}
			withAuthConsumer_myUserDetails={mockUserData.data}
			timeout_interval={20}
			api={defaultApi}
		/>
	)
		.dive()
		.dive();

	item.setState({ failedCount: 2 }); //we have added to forcefully
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	const updateFailedCount = item.state().failedCount + 1;
	item.instance().onChangeStartButton();
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().failedCount).toEqual(updateFailedCount);
	expect(item.state().message.props.children[0].indexOf(`Your device was unable to detect a barcode.`).length !== -1).toBe(true);
});

//User try to scan barcode and get device manager error //TODO uncomment
test("User try to scan barcode and get device manager error", async () => {
	MockPassData.quaggaInitError = "error";
	MockPassData.isbn = "9870836489178";
	MockPassData.canvasDomImage = true;
	mockMediaDevices = true;
	mockTimeOutSec = 5000;
	mockResultFlyOutIndex = 0;
	const item = shallow(
		<UnlockWorkPage
			location={location}
			match={{ params: { isbn: MockPassData.isbn } }}
			withAuthConsumer_myUserDetails={mockUserData.data}
			timeout_interval={20}
			api={defaultApi}
		/>
	)
		.dive()
		.dive();

	item.update();
	item.instance().onChangeStartButton();

	await wait(1000);
	//expect(item.state().message).toEqual("The Education Platform was not able to detect a scanning device. Please ensure that the device is enabled in Device Manager or correctly plugged in");
	expect(item.state().message.props.children[0].indexOf(`The Education Platform was not able to detect a scanning device.`).length !== -1).toBe(true);
});

//User try to scan barcode and get device manager error //TODO uncomment
test("User try to scan barcode and get device manager error", async () => {
	MockPassData.quaggaInitError = "error";
	MockPassData.isbn = "9870836489178";
	MockPassData.canvasDomImage = true;
	mockMediaDevices = true;
	mockTimeOutSec = 5000;
	const item = shallow(
		<UnlockWorkPage
			location={location}
			match={{ params: { isbn: MockPassData.isbn } }}
			withAuthConsumer_myUserDetails={mockUserData.data}
			timeout_interval={20}
			api={defaultApi}
		/>
	)
		.dive()
		.dive();

	item.update();
	item.instance().onChangeStartButton();

	await wait(1000);
	//expect(item.state().message).toEqual("The Education Platform was not able to detect a scanning device. Please ensure that the device is enabled in Device Manager or correctly plugged in");
	expect(item.state().message.props.children[0].indexOf(`The Education Platform was not able to detect a scanning device.`).length !== -1).toBe(true);
});

//User try to scan barcode and get WARNING //TODO uncomment
test("User try to scan barcode and get device manager error  ", async () => {
	MockPassData.quaggaInitError = "error";
	MockPassData.isbn = "9870836489178";
	MockPassData.canvasDomImage = true;
	mockMediaDevices = false;
	mockTimeOutSec = 100;
	const item = shallow(
		<UnlockWorkPage
			location={location}
			match={{ params: { isbn: MockPassData.isbn } }}
			withAuthConsumer_myUserDetails={mockUserData.data}
			timeout_interval={20}
			api={defaultApi}
		/>
	)
		.dive()
		.dive();
	item.update();
	item.instance().onChangeStartButton();
	await wait(50);
	expect(item.state().message).toEqual(
		<div>
			<strong>WARNING!</strong>
			<br />
			Your current browser does not support this feature. Please use an alternative browser, such as Chrome or Firefox.
		</div>
	);
});

/** quaggaOnDetected*/
/** User scan and get barcode image value */
test("User scan barcode and get barcode image value", async () => {
	MockPassData.quaggaInitError = "error";
	MockPassData.isbn = "9870836489178";
	MockPassData.canvasDomImage = true;
	mockMediaDevices = false;
	mockTimeOutSec = 5000;
	const result = {
		codeResult: {
			code: MockPassData.isbn,
		},
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/unlock") {
			return {
				result: {
					isbn: "9870836489178",
					title: "The title",
				},
				unlock_attempt_oid: "123456789012345678901234567890123456",
				status: "successfully-unlocked",
			};
		} else if (endpoint === "/public/get-temp-unlocked-assets") {
			return mockResultTempUnlockAsset;
		} else if (endpoint === "/public/first-time-user-experience-get-mine-seen") {
			return mockResultFlyOutIndex;
		}
		throw new Error("should never be here");
	}

	const item = shallow(
		<UnlockWorkPage
			location={location}
			match={{ params: { isbn: MockPassData.isbn } }}
			withAuthConsumer_myUserDetails={mockUserData.data}
			timeout_interval={20}
			api={api}
		/>
	)
		.dive()
		.dive();
	item.setState({ isScanning: true });
	item.instance().quaggaOnDetected(result);
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().unlocked).toBe(true);
});

/** User scan and get exception error */
test("User scan and get exception error 'Asset not found'", async () => {
	MockPassData.quaggaInitError = "error";
	MockPassData.isbn = "9870836489178";
	MockPassData.canvasDomImage = true;
	mockMediaDevices = false;

	const result = {
		codeResult: {
			code: MockPassData.isbn,
		},
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/unlock") {
			return {
				result: {},
				unlock_attempt_oid: "123456789012345678901234567890123456",
				status: "does-not-exist",
			};
		} else if (endpoint === "/public/get-temp-unlocked-assets") {
			return mockResultTempUnlockAsset;
		} else if (endpoint === "/public/first-time-user-experience-get-mine-seen") {
			return mockResultFlyOutIndex;
		}
		throw new Error("should never be here");
	}

	const item = shallow(
		<UnlockWorkPage
			location={location}
			match={{ params: { isbn: MockPassData.isbn } }}
			withAuthConsumer_myUserDetails={mockUserData.data}
			timeout_interval={20}
			api={api}
		/>
	)
		.dive()
		.dive();

	item.instance().quaggaOnDetected(result);
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().notFound).toBe(true);
});

/** User scan and get exception error */
test("User scan and get exception error", async () => {
	MockPassData.quaggaInitError = "error";
	MockPassData.isbn = "9870836489178";
	MockPassData.canvasDomImage = true;
	mockMediaDevices = false;

	const result = {
		codeResult: {
			code: MockPassData.isbn,
		},
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/unlock") {
			throw "Unknown Error";
		} else if (endpoint === "/public/get-temp-unlocked-assets") {
			return mockResultTempUnlockAsset;
		} else if (endpoint === "/public/first-time-user-experience-get-mine-seen") {
			return mockResultFlyOutIndex;
		}
		throw new Error("should never be here");
	}

	//const item = mount( <UnlockWorkPage  location={location} match={{params: {isbn: MockPassData.isbn}}} withAuthConsumer_myUserDetails={mockUserData.data} timeout_interval={20} api={api}/> ).dive().dive();
	const item = shallow(
		<UnlockWorkPage
			location={location}
			match={{ params: { isbn: MockPassData.isbn } }}
			withAuthConsumer_myUserDetails={mockUserData.data}
			timeout_interval={20}
			api={api}
		/>
	)
		.dive()
		.dive();

	item.instance().quaggaOnDetected(result);
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().response).toBe("Unknown Error");
});

/** User scan and get message `Asset already unlocked` */
test(`User scan and get message 'Asset already unlocked'`, async () => {
	MockPassData.quaggaInitError = "error";
	MockPassData.isbn = "9870836489178";
	MockPassData.canvasDomImage = true;
	mockMediaDevices = false;

	const result = {
		codeResult: {
			code: MockPassData.isbn,
		},
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/unlock") {
			return {
				result: {
					isbn: "9870836489178",
					title: "The title",
					message: `Asset already unlocked`,
				},
				unlock_attempt_oid: "123456789012345678901234567890123456",
				status: "already-unlocked",
			};
		} else if (endpoint === "/public/get-temp-unlocked-assets") {
			return mockResultTempUnlockAsset;
		} else if (endpoint === "/public/first-time-user-experience-get-mine-seen") {
			return mockResultFlyOutIndex;
		}
		throw new Error("should never be here");
	}

	const item = shallow(
		<UnlockWorkPage
			location={location}
			match={{ params: { isbn: MockPassData.isbn } }}
			withAuthConsumer_myUserDetails={mockUserData.data}
			timeout_interval={20}
			api={api}
		/>
	)
		.dive()
		.dive();

	item.instance().quaggaOnDetected(result);
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().unlocked).toBe(true);
	expect(item.state().response).toEqual("Asset already unlocked");
});

test(`User scan book and click on unlock more button `, async () => {
	MockPassData.quaggaInitError = "error";
	MockPassData.isbn = "9870836489178";
	MockPassData.canvasDomImage = true;
	mockMediaDevices = false;

	const result = {
		codeResult: {
			code: MockPassData.isbn,
		},
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/unlock") {
			return {
				result: {
					isbn: "9870836489178",
					title: "The title",
				},
				unlock_attempt_oid: "123456789012345678901234567890123456",
				status: "successfully-unlocked",
			};
		} else if (endpoint === "/public/get-temp-unlocked-assets") {
			return mockResultTempUnlockAsset;
		} else if (endpoint === "/public/first-time-user-experience-get-mine-seen") {
			return mockResultFlyOutIndex;
		}
		throw new Error("should never be here");
	}

	const item = shallow(
		<UnlockWorkPage
			location={location}
			match={{ params: { isbn: MockPassData.isbn } }}
			withAuthConsumer_myUserDetails={mockUserData.data}
			timeout_interval={20}
			api={api}
		/>
	)
		.dive()
		.dive();

	item.instance().quaggaOnDetected(result);
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().unlocked).toBe(true);
	expect(item.state().unlockStatus).toEqual("successfully-unlocked");
	item.instance()._takePictureTimeout = true;
	item.instance().unlockMore();
	item.update();
	item.instance().forceUpdate();
	expect(item.state().unlocked).toBe(false);
	expect(item.state().resultCode).toBe("");
	expect(item.state().message).toBe("");
	expect(item.state().response).toBe(null);
	expect(item.state().isScanning).toBe(true);
	expect(item.state().didCaputre).toBe(false);
});

test("User take the picture of barcode", async () => {
	MockPassData.quaggaInitError = null;
	MockPassData.isbn = null;
	MockPassData.canvasDomImage = true;
	mockMediaDevices = true;
	mockTimeOutSec = 100;
	mockEANIsValid = false;
	mockResultFlyOutIndex = { result: 0 };
	const result = {
		codeResult: {
			code: "",
		},
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/unlock") {
			return {
				result: {
					isbn: "9870836489178",
					title: "The title",
				},
				unlock_attempt_oid: "123456789012345678901234567890123456",
				status: "successfully-unlocked",
			};
		} else if (endpoint === "/public/unlock-via-image-upload") {
			return true;
		} else if (endpoint === "/public/get-temp-unlocked-assets") {
			return mockResultTempUnlockAsset;
		} else if (endpoint === "/public/first-time-user-experience-get-mine-seen") {
			return mockResultFlyOutIndex;
		}
		throw new Error("should never be here");
	}

	const item = shallow(
		<UnlockWorkPage
			location={location}
			match={{ params: { isbn: MockPassData.isbn } }}
			withAuthConsumer_myUserDetails={mockUserData.data}
			timeout_interval={20}
			api={api}
		/>
	)
		.dive()
		.dive();
	await wait(500);
	item.update();
	expect(item.state().waiting).toBe(false);
	expect(item.state().isAllowToUseCamera).toBe(false);
	expect(item.state().isCodeDetected).toBe(false);
	// item.setState({waiting: true, isAllowToUseCamera: false, isCodeDetected: false});
	item.instance().onChangeStartButton();
	await wait(500);
	expect(item.state().waiting).toBe(false);
	expect(item.state().isAllowToUseCamera).toBe(true);
	expect(item.state().isCodeDetected).toBe(false);

	item.instance().forceUpdate();
	expect(item.state().message).toBe("We're having trouble detecting a barcode. Could you take a picture for us?");

	//user click on sure button
	item.instance().onAcceptTakePicture();
	expect(item.state().doDisplayTakePictureOptions).toBe(false);
	expect(item.state().doDisplayTakePictureButton).toBe(true);
	expect(item.state().message).toBe("Hold the book in front of the camera and click OK when the barcode is steady.");

	//user click on Capture Button
	mockQuerySelector = (selector) => {
		if (selector === ".quagga-target video") {
			return {
				srcObject: null,
				play() {},
			};
		}
		return document.createElement("div");
	};
	mockCreateElement = (tagName) => {
		if (tagName === "canvas") {
			return {
				toBlob(callback, mimeType, quality) {
					setTimeout(() => {
						const fakeBlob = {};
						callback(fakeBlob);
					}, 1);
				},
				toDataURL() {
					return "http://some.image.com/hello.jpg";
				},
				getContext() {
					return {
						drawImage() {},
					};
				},
			};
		}
		return document.createElement(tagName);
	};
	item.instance().captureImage();
	await wait(100);
	//expect(item.state().doShowPreviewImage).toBe(true);
	//const element = <video autoplay="true" preload="auto" src="" muted="true" playsinline="true"></video>;
	//user capture a snap
	//item.instance().takeASnap(element);
	await wait(100);
	expect(item.state().previewImageDataUrl).not.toBeNull();

	//User deny to taked picture
	//item.instance().onDenyPreviewImage();
	//expect(item.state().doShowPreviewImage).toEqual(false);
});

test("User Denies on captured image", async () => {
	MockPassData.quaggaInitError = null;
	MockPassData.isbn = null;
	MockPassData.canvasDomImage = true;
	mockMediaDevices = true;
	mockTimeOutSec = 100;
	mockEANIsValid = false;
	const result = {
		codeResult: {
			code: "",
		},
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/unlock") {
			return {
				result: {
					isbn: "9870836489178",
					title: "The title",
				},
				unlock_attempt_oid: "123456789012345678901234567890123456",
				status: "successfully-unlocked",
			};
		} else if (endpoint === "/public/unlock-via-image-upload") {
			return true;
		} else if (endpoint === "/public/get-temp-unlocked-assets") {
			return mockResultTempUnlockAsset;
		} else if (endpoint === "/public/first-time-user-experience-get-mine-seen") {
			return mockResultFlyOutIndex;
		}
		throw new Error("should never be here");
	}
	const item = shallow(
		<UnlockWorkPage
			location={location}
			match={{ params: { isbn: MockPassData.isbn } }}
			withAuthConsumer_myUserDetails={mockUserData.data}
			timeout_interval={20}
			api={api}
		/>
	)
		.dive()
		.dive();
	item.setState({
		previewImageDataUrl: "canvas Data Image URL",
	});
	item.instance().onDenyPreviewImage();
	expect(item.state().previewImageDataUrl).toEqual(null);
});

test("User Denies to take picture", async () => {
	MockPassData.quaggaInitError = null;
	MockPassData.isbn = null;
	MockPassData.canvasDomImage = true;
	mockMediaDevices = true;
	mockTimeOutSec = 100;
	mockEANIsValid = false;
	const result = {
		codeResult: {
			code: "",
		},
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/unlock") {
			return {
				result: {
					isbn: "9870836489178",
					title: "The title",
				},
				unlock_attempt_oid: "123456789012345678901234567890123456",
				status: "successfully-unlocked",
			};
		} else if (endpoint === "/public/unlock-via-image-upload") {
			return true;
		} else if (endpoint === "/public/get-temp-unlocked-assets") {
			return mockResultTempUnlockAsset;
		} else if (endpoint === "/public/first-time-user-experience-get-mine-seen") {
			return mockResultFlyOutIndex;
		}
		throw new Error("should never be here");
	}
	const item = shallow(
		<UnlockWorkPage
			location={location}
			match={{ params: { isbn: MockPassData.isbn } }}
			withAuthConsumer_myUserDetails={mockUserData.data}
			timeout_interval={20}
			api={api}
		/>
	)
		.dive()
		.dive();
	item.instance().onDenyTakePicture();
	const stateMessage = item.state().message;
	expect(stateMessage.props.children[0].toString().indexOf("Perhaps we can still help you?")).toBeGreaterThan(-1);
});

test("User accepts the picture and sends it to server", async () => {
	MockPassData.quaggaInitError = null;
	MockPassData.isbn = null;
	MockPassData.canvasDomImage = true;
	mockMediaDevices = true;
	mockTimeOutSec = 100;
	mockEANIsValid = false;
	const result = {
		codeResult: {
			code: "",
		},
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/unlock") {
			return {
				result: {
					isbn: "9870836489178",
					title: "The title",
				},
				unlock_attempt_oid: "123456789012345678901234567890123456",
				status: "successfully-unlocked",
			};
		} else if (endpoint === "/public/unlock-via-image-upload") {
			return true;
		} else if (endpoint === "/public/get-temp-unlocked-assets") {
			return mockResultTempUnlockAsset;
		} else if (endpoint === "/public/first-time-user-experience-get-mine-seen") {
			return mockResultFlyOutIndex;
		}
		throw new Error("should never be here");
	}
	const item = shallow(
		<UnlockWorkPage
			location={location}
			match={{ params: { isbn: MockPassData.isbn } }}
			withAuthConsumer_myUserDetails={mockUserData.data}
			timeout_interval={20}
			api={api}
		/>
	)
		.dive()
		.dive();
	const fakeBlob = {};
	item.instance().previewImageRef.current = fakeBlob;
	item.instance().sendCapturedImageToServer();
	expect(item.instance().state.isSending).toBe(true);
	await wait(100);
	expect(item.instance().state.isSending).toBe(false);
	expect(
		item
			.instance()
			.state.message.indexOf("Thank you! We have sent this to our automatic barcode detector and we will notify you if it can be unlocked.")
	).toBeGreaterThan(-1);
});

test("User get unknown error when accepts the take picture and sends it to server", async () => {
	MockPassData.quaggaInitError = null;
	MockPassData.isbn = null;
	MockPassData.canvasDomImage = true;
	mockMediaDevices = true;
	mockTimeOutSec = 100;
	mockEANIsValid = false;
	const result = {
		codeResult: {
			code: "",
		},
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/unlock") {
			return {
				result: {
					isbn: "9870836489178",
					title: "The title",
				},
				unlock_attempt_oid: "123456789012345678901234567890123456",
				status: "successfully-unlocked",
			};
		} else if (endpoint === "/public/unlock-via-image-upload") {
			throw new Error("Unkown error");
		} else if (endpoint === "/public/get-temp-unlocked-assets") {
			return mockResultTempUnlockAsset;
		} else if (endpoint === "/public/first-time-user-experience-get-mine-seen") {
			return mockResultFlyOutIndex;
		}
		throw new Error("should never be here");
	}
	const item = shallow(
		<UnlockWorkPage
			location={location}
			match={{ params: { isbn: MockPassData.isbn } }}
			withAuthConsumer_myUserDetails={mockUserData.data}
			timeout_interval={20}
			api={api}
		/>
	)
		.dive()
		.dive();
	const fakeBlob = {};
	item.instance().previewImageRef.current = fakeBlob;
	item.instance().sendCapturedImageToServer();
	expect(item.instance().state.previewImageDataUrl).toBe(null);
	await wait(100);
	expect(item.instance().state.isSending).toBe(false);
	expect(item.instance().state.message).toBe("Something went wrong!");
	expect(item.instance().state.didCaputre).toBe(false);
	expect(item.instance().state.show).toBe(true);
});

test(`User scan book and click on unlock more button and view the unlock asset `, async () => {
	MockPassData.quaggaInitError = "error";
	MockPassData.isbn = "9870836489178";
	MockPassData.canvasDomImage = true;
	mockMediaDevices = false;

	const result = {
		codeResult: {
			code: MockPassData.isbn,
		},
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/unlock") {
			return {
				result: {
					isbn: "9870836489178",
					title: "The title",
				},
				unlock_attempt_oid: "123456789012345678901234567890123456",
				status: "successfully-unlocked",
			};
		} else if (endpoint === "/public/get-temp-unlocked-assets") {
			return mockResultTempUnlockAsset;
		} else if (endpoint === "/public/first-time-user-experience-get-mine-seen") {
			return mockResultFlyOutIndex;
		}
		throw new Error("should never be here");
	}

	const item = shallow(
		<UnlockWorkPage
			location={location}
			match={{ params: { isbn: MockPassData.isbn } }}
			withAuthConsumer_myUserDetails={mockUserData.data}
			timeout_interval={20}
			api={api}
		/>
	)
		.dive()
		.dive();

	item.instance().quaggaOnDetected(result);
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().unlocked).toBe(true);
	expect(item.state().unlockStatus).toEqual("successfully-unlocked");

	item.instance().unlockMore();
	item.update();
	item.instance().forceUpdate();
	expect(item.state().unlocked).toBe(false);
	expect(item.state().resultCode).toBe("");
	expect(item.state().message).toBe("");
	expect(item.state().response).toBe(null);
	expect(item.state().isScanning).toBe(true);
	expect(item.state().didCaputre).toBe(false);

	item.instance().setStateForRedirection();
	expect(item.state().redirect).toBe(true);
});

/** User scan and get exception error */
test("User scan asset and show intent to copy form", async () => {
	MockPassData.quaggaInitError = "error";
	MockPassData.isbn = "9870836489178";
	MockPassData.canvasDomImage = true;
	mockMediaDevices = false;

	const result = {
		codeResult: {
			code: MockPassData.isbn,
		},
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/unlock") {
			return {
				result: {},
				unlock_attempt_oid: "123456789012345678901234567890123456",
				status: "does-not-exist",
			};
		} else if (endpoint === "/public/get-temp-unlocked-assets") {
			return mockResultTempUnlockAsset;
		} else if (endpoint === "/public/first-time-user-experience-get-mine-seen") {
			return mockResultFlyOutIndex;
		}
		throw new Error("should never be here");
	}

	const item = shallow(
		<UnlockWorkPage
			location={location}
			match={{ params: { isbn: MockPassData.isbn } }}
			withAuthConsumer_myUserDetails={mockUserData.data}
			timeout_interval={20}
			api={api}
		/>
	)
		.dive()
		.dive();

	item.instance().quaggaOnDetected(result);
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().notFound).toBe(true);
	expect(item.state().showUnlockMore).toBe(false);
	// expect(item.state().unlockedTitle).toBe({});
	expect(item.state().unlock_attempt_oid).toBe("123456789012345678901234567890123456");
});

test("User close intent to copy form", async () => {
	MockPassData.quaggaInitError = "error";
	MockPassData.isbn = "9870836489178";
	MockPassData.canvasDomImage = true;
	mockMediaDevices = false;

	const result = {
		codeResult: {
			code: MockPassData.isbn,
		},
	};

	async function api(endpoint, data) {
		if (endpoint === "/public/unlock") {
			return {
				result: {},
				unlock_attempt_oid: "123456789012345678901234567890123456",
				status: "does-not-exist",
			};
		} else if (endpoint === "/public/get-temp-unlocked-assets") {
			return mockResultTempUnlockAsset;
		} else if (endpoint === "/public/first-time-user-experience-get-mine-seen") {
			return mockResultFlyOutIndex;
		}
		throw new Error("should never be here");
	}

	const item = shallow(
		<UnlockWorkPage
			location={location}
			match={{ params: { isbn: MockPassData.isbn } }}
			withAuthConsumer_myUserDetails={mockUserData.data}
			timeout_interval={20}
			api={api}
		/>
	)
		.dive()
		.dive();

	item.instance().quaggaOnDetected(result);
	await wait(50);
	item.update();
	item.instance().forceUpdate();

	expect(item.state().notFound).toBe(true);
	expect(item.state().showUnlockMore).toBe(false);
	// expect(item.state().unlockedTitle).toBe(null);
	expect(item.state().unlock_attempt_oid).toBe("123456789012345678901234567890123456");

	item.instance().onCloseIntentToCopy();
	expect(item.state().resultCode).toBe("");
	expect(item.state().response).toBe(null);
	expect(item.state().unlocked).toBe(false);
	expect(item.state().redirect).toBe(false);
	expect(item.state().showStartButton).toBe(true);
	expect(item.state().waiting).toBe(false);
	expect(item.state().notFound).toBe(false);
});

test("User click on find book button for find a book for temporarily unlock ", async () => {
	const item = shallow(<UnlockWorkPage location={location} withAuthConsumer_myUserDetails={mockUserData.data} api={defaultApi} />)
		.dive()
		.dive();
	item.instance().unlockWithoutPhysicalCopy();
	expect(item.state().isTemp).toBe(true);
	item.instance().findBookInputRef.current = { value: "9781781350003" };
	item.instance().findBookOnClick();
	expect(item.state().isbnValidationMsg).toBe(null);
});

test("User enter invalid isbn on text box and  click on find book button for find a book for temporarily unlock", async () => {
	const item = shallow(<UnlockWorkPage location={location} withAuthConsumer_myUserDetails={mockUserData.data} api={defaultApi} />)
		.dive()
		.dive();
	item.instance().unlockWithoutPhysicalCopy();
	expect(item.state().isTemp).toBe(true);
	item.instance().findBookInputRef.current = { value: "97881350003" };
	item.instance().findBookOnClick();
	expect(item.state().isbnValidationMsg).not.toBe(null);
});

test("User click on `What if you don't have the book with you?' link for unlock asset without physical copy ", async () => {
	const item = shallow(<UnlockWorkPage location={location} withAuthConsumer_myUserDetails={mockUserData.data} api={defaultApi} />)
		.dive()
		.dive();
	item.instance().findBookInputRef.current = { value: "97881350003" };
	item.instance().unlockWithoutPhysicalCopy();
	expect(item.state().isTemp).toBe(true);
});

test("User Confirmed for unlock asset temporarily ", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/public/unlock") {
			return {
				result: { isbn: "9870836489178", title: "The title" },
				unlock_attempt_oid: "123456789012345678901234567890123456",
				status: "temp-unlocked",
			};
		} else if (endpoint === "/public/get-temp-unlocked-assets") {
			return mockResultTempUnlockAsset;
		} else if (endpoint === "/public/first-time-user-experience-get-mine-seen") {
			return mockResultFlyOutIndex;
		}
		throw new Error("should never be here");
	}

	const item = shallow(<UnlockWorkPage location={location} withAuthConsumer_myUserDetails={mockUserData.data} api={api} />)
		.dive()
		.dive();
	item.instance().unlockWithoutPhysicalCopy();
	item.instance().onConfirmOwnsAssetForTempUnlock();
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().unlockStatus).toBe("temp-unlocked");
});

test("User confirmed for inlock asset temporarily ", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/public/unlock") {
			return {
				result: { isbn: "9870836489178", title: "The title" },
				unlock_attempt_oid: "123456789012345678901234567890123456",
				status: "not-owned-by-school",
			};
		} else if (endpoint === "/public/get-temp-unlocked-assets") {
			return mockResultTempUnlockAsset;
		} else if (endpoint === "/public/first-time-user-experience-get-mine-seen") {
			return mockResultFlyOutIndex;
		}
		throw new Error("should never be here");
	}

	const item = shallow(<UnlockWorkPage location={location} withAuthConsumer_myUserDetails={mockUserData.data} api={api} />)
		.dive()
		.dive();
	item.instance().unlockWithoutPhysicalCopy();
	item.instance().onDenyOwnsAssetForTempUnlock();
	await wait(50);
	item.update();
	item.instance().forceUpdate();
	expect(item.state().unlockStatus).toBe("not-owned-by-school");
});

test("User doing the temporarily unlock and click on back button to redirect unlock screen", async () => {
	const item = shallow(<UnlockWorkPage location={location} withAuthConsumer_myUserDetails={mockUserData.data} api={defaultApi} />)
		.dive()
		.dive();
	item.instance().unlockWithoutPhysicalCopy();
	expect(item.state().isTemp).toBe(true);
	item.instance().backFromTempUnlock();
	expect(item.state().unlockStatus).toBe(null);
	expect(item.state().isTemp).toBe(false);
});

test("User doing temporarily unlock, enter the isbn and submit than getting the message like 'ISBN is not valid'", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/public/unlock") {
			throw "ISBN is not valid";
		} else if (endpoint === "/public/get-temp-unlocked-assets") {
			return mockResultTempUnlockAsset;
		}
		defaultApi(endpoint, data);
	}

	const item = shallow(<UnlockWorkPage location={location} withAuthConsumer_myUserDetails={mockUserData.data} api={api} />)
		.dive()
		.dive();
	item.instance().unlockWithoutPhysicalCopy();
	item.instance().findBookInputRef.current = { value: "9781912820442" };
	await wait(50);
	item.instance().findBookOnClick();
	await wait(100);
	expect(item.state().isbnValidationMsg).not.toBe(null);
	expect(item.state().message).toBe("ISBN is not valid");
});

test("User manual enter the isbn number into url for temporarily unlock, getting the message like 'ISBN is not valid'", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/public/unlock") {
			throw "ISBN is not valid";
		} else if (endpoint === "/public/get-temp-unlocked-assets") {
			return mockResultTempUnlockAsset;
		}
		defaultApi(endpoint, data);
	}

	location.search = "?isbn=9781911208290";
	const item = shallow(<UnlockWorkPage location={location} history={history} withAuthConsumer_myUserDetails={mockUserData.data} api={api} />)
		.dive()
		.dive();
	expect(item.state().isTemp).toBe(true);
});

test("When user clicks on tell us link and open content request model", async () => {
	const item = shallow(
		<UnlockWorkPage location={location} match={{ params: { isbn: "string" } }} withAuthConsumer_myUserDetails={mockUserData.data} api={defaultApi} />
	)
		.dive()
		.dive();

	const openContentRequestModal = item.find("Presentation").prop("openContentRequestModal");
	openContentRequestModal();
	expect(item.find("ContentRequestModal").length).toBe(1);
});

test("When user close content request model", async () => {
	const item = shallow(
		<UnlockWorkPage location={location} match={{ params: { isbn: "string" } }} withAuthConsumer_myUserDetails={mockUserData.data} api={defaultApi} />
	)
		.dive()
		.dive();

	const openContentRequestModal = item.find("Presentation").prop("openContentRequestModal");
	openContentRequestModal();
	expect(item.find("ContentRequestModal").length).toBe(1);

	const hideContentRequestModal = item.find("ContentRequestModal").prop("handleClose");
	hideContentRequestModal();
	expect(item.find("ContentRequestModal").length).toBe(0);
});
