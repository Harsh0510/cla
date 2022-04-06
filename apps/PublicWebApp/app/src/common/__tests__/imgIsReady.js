import imgIsReadyRaw from "./../imgIsReady";

/** Component renders correctly */
test("function renders correctly", async () => {
	const imgEl = {
		accessKey: "",
		complete: true,
		currentSrc: "https://dummyimage.com/1200x1000/ee0000/333.png&text=13",
		naturalHeight: 1000,
		naturalWidth: 1200,
	};
	const item = imgIsReadyRaw(imgEl);
	expect(item).toBe(1000);
});

test("function renders correctly with canvas", async () => {
	const imgEl = {
		accessKey: "",
		complete: true,
		currentSrc: "https://dummyimage.com/1200x1000/ee0000/333.png&text=13",
		naturalHeight: 1000,
		naturalWidth: 1200,
		tagName: "CANVAS",
	};
	const item = imgIsReadyRaw(imgEl);
	expect(item).toEqual({
		accessKey: "",
		complete: true,
		currentSrc: "https://dummyimage.com/1200x1000/ee0000/333.png&text=13",
		naturalHeight: 1000,
		naturalWidth: 1200,
		tagName: "CANVAS",
	});
});
