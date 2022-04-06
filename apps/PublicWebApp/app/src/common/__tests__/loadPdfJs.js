import * as loadPdfJs from "../loadPdfJs";
import {} from "";

jest.mock("../injectResource", () => {
	return {
		injectJs: () => {
			return new Promise((resolve, reject) => {
				resolve("inject js");
			});
		},
		injectCss: () => {
			return new Promise((resolve, reject) => {
				resolve("inject css");
			});
		},
		removeJs: () => {
			return new Promise((resolve, reject) => {
				resolve("remove js");
			});
		},
		removeCss: () => {
			return new Promise((resolve, reject) => {
				resolve("remove css");
			});
		},
	};
});

test("Load function call successfully", async () => {
	const item = await loadPdfJs.load();
	expect(item).toEqual(["inject js", "inject css"]);
});

test("Unload function call successfully", async () => {
	const item = await loadPdfJs.unload();
	expect(item).toEqual(["remove js", "remove css"]);
});
