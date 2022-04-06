import api from "../api";

let endpoint, params, OnSend, mockReadyState, mockSESSID;

/**
 * mock xhr object
 **/
const mockXHR = {
	open: jest.fn(),
	send: jest.fn(),
	readyState: 4,
	status: 200,
	responseText: JSON.stringify([{ title: "test post" }, { title: "second test post" }]),
	setRequestHeader: (type, value) => {},
	onreadystatechange: (callBack) => {
		callBack();
	},
	getResponseHeader: (key) => {
		return mockSESSID;
	},
	ontimeout: (_) => {},
};

/**
 * Mock for  MyXMLHttpRequest
 **/
jest.mock("../MyXMLHttpRequest", () => {
	return function () {
		return mockXHR;
	};
});

/**
 * Reset function
 **/
function resetAll() {
	const oldWindow = window.location;
	delete window.location;
	window.location = {
		...oldWindow,
		reload: jest.fn(),
	};
	OnSend = () => {};
	endpoint = "/auth/login";
	params = { email: "admina1@email.com", password: "uswJ4zkAu81PMTiQ" };
	localStorage = { sessId: "e997d26eef1b2ce43d3151a3be3b74cf0ba4073ee07d2564" };
	mockReadyState = 4;
	mockSESSID = "e997d26eef1b2ce43d3151a3be3b74cf0ba4073ee07d2564";
}

beforeEach(resetAll);
afterEach(resetAll);

/**
 * wait function
 **/
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

/**
 * LocalStorage mock
 **/
class LocalStorageMock {
	constructor() {
		this.store = {};
	}
	clear() {
		this.store = {};
	}
	getItem(key) {
		return this.store[key] || null;
	}
	setItem(key, value) {
		this.store[key] = value.toString();
	}
	removeItem(key) {
		delete this.store[key];
	}
}

/** Should retrieve the list of posts from the server when calling get/posts method */
test("Should retrieve the list of posts from the server when calling get/posts method", async () => {
	let error = null;
	global.localStorage = LocalStorageMock;
	global.localStorage.setItem("sessId", mockSESSID);
	const url = "http://dummy.com";
	const options = { binary: true, files: ["file1"] };

	const reqPromise = api(url, { param1: "test 1", param2: "test 2" }, options);
	mockXHR.onreadystatechange();
	mockXHR.status = 200;
	reqPromise
		.then((posts) => {
			expect(posts.length).toBe(2);
			expect(posts[0].title).toBe("test post");
			expect(posts[1].title).toBe("second test post");
		})
		.catch((e) => {
			error = e;
			expect(error).toBeNull();
		});
	expect(error).toBeNull();
});

/**Shoud retrieve the sessId in response header when calling get/posts method*/
test("Shoud retrieve the sessId in response header when calling get/posts method", async () => {
	let error = null;
	global.localStorage = LocalStorageMock;
	global.localStorage.setItem("sessId", mockSESSID);
	window.location.protocol = null;
	mockXHR.getResponseHeader = (key) => {
		return null;
	};
	const url = "http://dummy.com";

	const reqPromise = api(url, { param1: "test 1", param2: "test 2" });
	mockXHR.onreadystatechange();
	mockXHR.status = 200;
	reqPromise
		.then((posts) => {
			expect(posts.length).toBe(2);
			expect(posts[0].title).toBe("test post");
			expect(posts[1].title).toBe("second test post");
			expect(window.location.reload).toHaveBeenCalled();
			expect(global.localStorage.getItem("sessId")).toBeNull();
		})
		.catch((e) => {
			error = e;
			expect(error).toBeNull();
		});
});

/**Getting the ready state value as null when calling get/posts method*/
test("Getting the ready state value as null when calling get/posts method", async () => {
	let error = null;
	mockSESSID = null;
	global.localStorage = LocalStorageMock;
	global.localStorage.setItem("sessId", mockSESSID);
	window.location.protocol = null;
	mockXHR.getResponseHeader = (key) => {
		return null;
	};
	const url = "http://dummy.com";
	mockXHR.status = 200;
	mockXHR.readyState = null;

	const reqPromise = api(url, { param1: "test 1", param2: "test 2" });
	mockXHR.onreadystatechange();
	reqPromise
		.then((posts) => {
			expect(posts.length).toBe(2);
			expect(posts[0].title).toBe("test post");
			expect(posts[1].title).toBe("second test post");
			expect(window.location.reload).not.toHaveBeenCalled();
			expect(global.localStorage.getItem("sessId")).toBe("null");
		})
		.catch((e) => {
			error = e;
			expect(error).toBeNull();
		});
});

/**SessId not available in local storage when calling get/posts method*/
test("SessId not available in local storage when calling get/posts method", async () => {
	let error = null;
	mockSESSID = null;
	global.localStorage = LocalStorageMock;
	global.localStorage.removeItem("sessId");
	window.location.protocol = null;
	mockXHR.getResponseHeader = (key) => {
		return null;
	};
	const url = "http://dummy.com";
	mockXHR.status = 200;
	mockXHR.readyState = 4;

	const reqPromise = api(url, { param1: "test 1", param2: "test 2" });
	mockXHR.onreadystatechange();
	reqPromise
		.then((posts) => {
			expect(posts.length).toBe(2);
			expect(posts[0].title).toBe("test post");
			expect(posts[1].title).toBe("second test post");
			expect(window.location.reload).not.toHaveBeenCalled();
			expect(global.localStorage.getItem("sessId")).toBeNull();
		})
		.catch((e) => {
			error = e;
			expect(error).toBeNull();
		});
});

/**Getting the status as 500 from response when calling get/posts method*/
test("Getting the status as 500 from response when calling get/posts method", async () => {
	let error = null;
	mockSESSID = null;
	global.localStorage = LocalStorageMock;
	global.localStorage.removeItem("sessId");
	window.location.protocol = null;
	mockXHR.getResponseHeader = (key) => {
		return null;
	};
	const url = "http://dummy.com";
	mockXHR.status = 500;
	mockXHR.readyState = 4;

	const reqPromise = api(url, { param1: "test 1", param2: "test 2" });
	mockXHR.onreadystatechange();
	reqPromise
		.then((posts) => {})
		.catch((e) => {
			error = JSON.parse(e);
			expect(error).not.toBeNull();
			expect(error.length).toEqual(2);
			expect(error[0].title).toEqual("test post");
			expect(error[1].title).toEqual("second test post");
			expect(window.location.reload).not.toHaveBeenCalled();
			expect(global.localStorage.getItem("sessId")).toBeNull();
		});
});

/**Getting the different sessId from the response when calling get/posts method */
test("Getting the different sessId from the response when calling get/posts method", async () => {
	let error = null;
	let sessId = "qweerer12ewrewr345werewrewr6werewr789";
	global.localStorage = LocalStorageMock;
	global.localStorage.setItem("sessId", sessId);
	window.location.protocol = null;
	mockXHR.getResponseHeader = (key) => {
		return mockSESSID;
	};
	const url = "http://dummy.com";
	mockXHR.status = 200;
	mockXHR.readyState = 4;

	const reqPromise = api(url, { param1: "test 1", param2: "test 2" });
	mockXHR.onreadystatechange();
	reqPromise
		.then((posts) => {
			expect(posts.length).toBe(2);
			expect(window.location.reload).toHaveBeenCalled();
			expect(global.localStorage.getItem("sessId")).not.toBeNull();
			expect(global.localStorage.getItem("sessId")).not.toEqual(mockSESSID);
		})
		.catch((e) => {
			error = JSON.parse(e);
			expect(error).not.toBeNull();
			expect(error.length).toEqual(2);
			expect(error[0].title).toEqual("test post");
			expect(error[1].title).toEqual("second test post");
		});
});

/**Request timeout when calling get/posts method */
test("Request timeout when calling get/posts method", async () => {
	let error = null;
	let sessId = "qweerer12ewrewr345werewrewr6werewr789";
	global.localStorage = LocalStorageMock;
	global.localStorage.setItem("sessId", sessId);
	window.location.protocol = null;
	mockXHR.getResponseHeader = (key) => {
		return mockSESSID;
	};
	const url = "http://dummy.com";
	mockXHR.status = 200;
	mockXHR.readyState = 4;

	const reqPromise = api(url, { param1: "test 1", param2: "test 2" });
	mockXHR.ontimeout();
	reqPromise
		.then((posts) => {})
		.catch((e) => {
			error = e;
			expect(error).not.toBeNull();
			expect(error).toEqual("timeout");
		});
});

/**Request with params as null when calling get/posts method*/
test("Request with params as null when calling get/posts method", async () => {
	let error = null;
	let sessId = "qweerer12ewrewr345werewrewr6werewr789";
	global.localStorage = LocalStorageMock;
	global.localStorage.setItem("sessId", sessId);
	window.location.protocol = null;
	mockXHR.getResponseHeader = (key) => {
		return mockSESSID;
	};
	const url = "http://dummy.com";
	mockXHR.status = 200;
	mockXHR.readyState = 4;

	const reqPromise = api(url, null);
	reqPromise
		.then((posts) => {
			expect(mockXHR.send).toHaveBeenCalled();
		})
		.catch((e) => {
			error = e;
			expect(error).not.toBeNull();
			expect(error).toEqual("timeout");
		});
});

/**Request without params when calling get/posts method*/
test("Request without params when calling get/posts method", async () => {
	let error = null;
	let sessId = "qweerer12ewrewr345werewrewr6werewr789";
	global.localStorage = LocalStorageMock;
	global.localStorage.setItem("sessId", sessId);
	window.location.protocol = null;
	mockXHR.getResponseHeader = (key) => {
		return mockSESSID;
	};
	const url = "http://dummy.com";
	mockXHR.status = 200;
	mockXHR.readyState = 4;

	const reqPromise = api(url);
	reqPromise
		.then((posts) => {
			expect(mockXHR.send).toHaveBeenCalled();
		})
		.catch((e) => {
			error = e;
		});
});

test("Request timeout", async () => {
	let error = null;
	mockSESSID = null;
	global.localStorage = LocalStorageMock;
	global.localStorage.removeItem("sessId");
	window.location.protocol = null;
	mockXHR.getResponseHeader = (key) => {
		return null;
	};
	const url = "http://dummy.com";
	mockXHR.status = 0;
	mockXHR.readyState = 4;

	const reqPromise = api(url, { param1: "test 1", param2: "test 2" });
	mockXHR.onreadystatechange();
	mockXHR.ontimeout({ type: "timeout" });
	reqPromise
		.then((posts) => {})
		.catch((e) => {
			error = JSON.parse(e);
			expect(error).not.toBeNull();
			expect(error.length).toEqual(2);
			expect(error[0].title).toEqual("test post");
			expect(error[1].title).toEqual("second test post");
			expect(window.location.reload).not.toHaveBeenCalled();
			expect(global.localStorage.getItem("sessId")).toBeNull();
		});
});

test("User call the api when not include the files in request", async () => {
	let error = null;
	global.localStorage = LocalStorageMock;
	global.localStorage.setItem("sessId", mockSESSID);
	const url = "http://dummy.com";
	const options = {};

	const reqPromise = api(url, { param1: "test 1", param2: "test 2" }, options);
	mockXHR.onreadystatechange();
	mockXHR.status = 200;
	reqPromise
		.then((posts) => {
			expect(posts.length).toBe(2);
			expect(posts[0].title).toBe("test post");
			expect(posts[1].title).toBe("second test post");
		})
		.catch((e) => {
			error = e;
			expect(error).toBeNull();
		});
	expect(error).toBeNull();
});

test("User call the api when include the form data in request", async () => {
	let param = new FormData();
	let error = null;
	global.localStorage = LocalStorageMock;
	global.localStorage.setItem("sessId", mockSESSID);
	const url = "http://dummy.com";
	const options = {};

	const reqPromise = api(url, param, options);
	mockXHR.onreadystatechange();
	mockXHR.status = 200;
	reqPromise
		.then((posts) => {
			expect(posts.length).toBe(2);
			expect(posts[0].title).toBe("test post");
			expect(posts[1].title).toBe("second test post");
		})
		.catch((e) => {
			error = e;
			expect(error).toBeNull();
		});
	expect(error).toBeNull();
});
