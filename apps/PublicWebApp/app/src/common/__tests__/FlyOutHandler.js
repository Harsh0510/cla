import FlyOutHandler from "../FlyOutHandler";

let mockDefaultAPI, mockScreen, mockInstance, mockState, mockFunction;
let mockResultUserIndexUpdate, mockResultUserSeenIndex, mockResultUserAttemptUnlocked;

async function defaultApi(endpoint, data) {
	// "ClassesPage" only queries this endpoint
	if (endpoint === "/public/first-time-user-experience-get-mine-seen") {
		return mockResultUserSeenIndex;
	} else if (endpoint === "/public/first-time-user-experience-update") {
		return mockResultUserIndexUpdate;
	}
	throw new Error("should never be here");
}

function resetAll() {
	mockState = { flyOutIndex: -1 };
	mockDefaultAPI = defaultApi;
	mockScreen = "search";
	mockInstance = {
		setState(object) {
			this.state = object;
		},
		state: { flyOutIndexNotification: -1, flyOutIndex: 1 },
		props: { history: { push: jest.fn() } },
	};
	mockFunction = jest.fn();
	mockResultUserSeenIndex = { result: -1 };
	mockResultUserIndexUpdate = { result: true };
	mockResultUserAttemptUnlocked = { user: false, school: true };
}

beforeEach(resetAll);
afterEach(resetAll);

/**
 * wait function
 **/
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

test(`function getSeen set index value in state`, async () => {
	const flyOutHandler = new FlyOutHandler(mockInstance, defaultApi, mockScreen);
	flyOutHandler.getSeen();
	await wait(50);
	expect(mockInstance.state.flyOutIndex).toEqual(-1);
});

test(`function getSeenNotification set index value in state`, async () => {
	mockScreen = "notification";
	const flyOutHandler = new FlyOutHandler(mockInstance, defaultApi, mockScreen);
	flyOutHandler.getSeenNotification();
	await wait(50);
	expect(mockInstance.state.flyOutIndexNotification).toEqual(-1);
});

test(`function onCloseNotification set index value in state`, async () => {
	//mockInstance.state = { flyOutIndexNotification: 0, ...mockInstance.state };
	mockScreen = "notification";
	const flyOutHandler = new FlyOutHandler(mockInstance, defaultApi, mockScreen);
	mockResultUserIndexUpdate = { result: true };
	flyOutHandler.onCloseNotification();
	expect(mockInstance.state.flyOutIndexNotification).toEqual(-1);
});

test(`function onCloseNotification with Redirecting the URl`, async () => {
	mockScreen = "notification";
	global.window = Object.create(window);
	const url = "/dummy/url";
	Object.defineProperty(window, "location", {
		value: {
			href: "",
		},
	});
	const flyOutHandler = new FlyOutHandler(mockInstance, defaultApi, mockScreen);
	mockResultUserIndexUpdate = { result: true };
	flyOutHandler.onCloseNotification(null, url);
	await wait(50);
	expect(mockInstance.state.flyOutIndexNotification).toEqual(0);
	expect(mockFunction).not.toHaveBeenCalled();
	//expect(window.location.href).toEqual("http://localhost"+ url);
});

test(`function getSeen set index value in state`, async () => {
	const flyOutHandler = new FlyOutHandler(mockInstance, defaultApi, mockScreen);
	flyOutHandler.destroy();
	flyOutHandler.getSeen();
	await wait(50);
	expect(mockInstance.state.flyOutIndex).toEqual(1);
});

test(`function onClose set index value in state`, async () => {
	const flyOutHandler = new FlyOutHandler(mockInstance, defaultApi, mockScreen);
	mockResultUserIndexUpdate = { result: true };
	flyOutHandler.onClose();
	expect(mockInstance.state.flyOutIndex).toEqual(1);
});

test(`function getSeenHome returns when _active is not set`, async () => {
	mockScreen = "Home";
	const flyOutHandler = new FlyOutHandler(mockInstance, defaultApi, mockScreen);
	flyOutHandler._active = false;
	mockResultUserIndexUpdate = { result: true };
	flyOutHandler.getSeenFlyOutIndex();
	expect(mockInstance.state.flyOutIndex).toEqual(1);
});

test(`function getSeenHome set index value in state`, async () => {
	mockScreen = "Home";
	const flyOutHandler = new FlyOutHandler(mockInstance, defaultApi, mockScreen);
	flyOutHandler._active = true;
	mockResultUserIndexUpdate = { result: true };
	flyOutHandler.getSeenFlyOutIndex();
	expect(mockInstance.state.flyOutIndex).toEqual(1);
});

test(`function onClose set index value in state and called callback function`, async () => {
	const flyOutHandler = new FlyOutHandler(mockInstance, defaultApi, mockScreen);
	mockResultUserIndexUpdate = { result: true };
	flyOutHandler.onClose(mockFunction);
	await wait(50);
	expect(mockInstance.state.flyOutIndex).toEqual(2);
	expect(mockFunction).toHaveBeenCalled();
});

test(`function onClose set index value in state and passed wrong cb`, async () => {
	const flyOutHandler = new FlyOutHandler(mockInstance, defaultApi, mockScreen);
	mockResultUserIndexUpdate = { result: true };
	flyOutHandler.onClose("test");
	await wait(50);
	expect(mockInstance.state.flyOutIndex).toEqual(2);
	expect(mockFunction).not.toHaveBeenCalled();
});

test(`function onClose with Redirecting the URl`, async () => {
	global.window = Object.create(window);
	const url = "/dummy/url";
	Object.defineProperty(window, "location", {
		value: {
			href: "",
		},
	});
	const flyOutHandler = new FlyOutHandler(mockInstance, defaultApi, mockScreen);
	mockResultUserIndexUpdate = { result: true };
	flyOutHandler.onClose(null, url);
	await wait(50);
	expect(mockInstance.state.flyOutIndex).toEqual(2);
	expect(mockFunction).not.toHaveBeenCalled();
	//expect(window.location.href).toEqual("http://localhost"+ url);
});

test(`function onClose getting the result false`, async () => {
	mockScreen = "home";
	mockResultUserIndexUpdate = { result: false };
	const flyOutHandler = new FlyOutHandler(mockInstance, defaultApi, mockScreen);
	flyOutHandler.onClose(null, { home: 1 });
	await wait(100);
	expect(mockInstance.state.flyOutIndex).toEqual(2);
	expect(mockFunction).not.toHaveBeenCalled();
});

test(`function isBitSet check index value seen or not`, async () => {
	const flyOutHandler = new FlyOutHandler(mockInstance, defaultApi, mockScreen);
	const result = flyOutHandler.isBitSet(0, 1);
	await wait(50);
	expect(result).toEqual(false);
});

test(`function setElementAtIndex check index value seen or not`, async () => {
	const flyOutHandler = new FlyOutHandler(mockInstance, defaultApi, mockScreen);
	const result = flyOutHandler.setElementAtIndex(0, 1);
	await wait(50);
	expect(result).toEqual(2);
});

test(`function getPopupIndexToShow return next index value`, async () => {
	const flyOutHandler = new FlyOutHandler(mockInstance, defaultApi, mockScreen);
	const result = flyOutHandler.getPopupIndexToShow(15);
	await wait(50);
	expect(result).toEqual(4);
});

test(`function getPopupIndexToShow next index value`, async () => {
	const flyOutHandler = new FlyOutHandler(mockInstance, defaultApi, mockScreen);
	const result = flyOutHandler.getPopupIndexToShow(-1);
	await wait(50);
	expect(result).toEqual(-1);
});

test(`function getPopupIndexToShow next index value`, async () => {
	const flyOutHandler = new FlyOutHandler(mockInstance, defaultApi, mockScreen);
	const result = flyOutHandler.getPopupIndexToShow(45);
	await wait(50);
	expect(result).toEqual(1);
});
