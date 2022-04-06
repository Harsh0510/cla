import "../../../mocks/matchMedia.mock";
import React from "react";
import { shallow } from "enzyme";
import Upload from "../Upload";

let props;
let mockGetExtractLimitResults;

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);

async function defaultApi(endpoint, data) {
	if (endpoint === "/public/user-asset-upload") {
		return {
			extract_oid: "dff8e690d34653861c9954121ffb22b99fac",
		};
	}
	if (endpoint === "/public/asset-get-one") {
		return {
			result: {
				title: "title",
				authors: [{ firstName: "abc", lastName: "def" }],
				is_unlocked: true,
				page_count: 50,
				copy_excluded_pages: [2, 4, 6],
				content_form: "MI",
				file_format: "epub",
			},
			sas_token: "Sas Token",
		};
	}
	if (endpoint === "/public/get-extract-limits") {
		return mockGetExtractLimitResults;
	}
	if (endpoint === "/public/asset-check-permissions") {
		return {
			status: "Excluded",
		};
	}
	throw new Error("should never be here");
}

function resetAll() {
	props = {
		location: {
			search: "?title=test&isbn=9780785789017&author=test&publisher=test&pageCount=100",
		},
		history: { push: jest.fn() },
	};
	mockGetExtractLimitResults = {
		school: {
			limit: 10,
			extracted: [1, 2, 3, 4, 5],
		},
		course: {
			limit: 2,
			extracted: [],
		},
	};
}

beforeEach(resetAll);
afterEach(resetAll);

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

test("Component renders correctly", async () => {
	const item = shallow(<Upload api={defaultApi} {...props} />);
	expect(item.find("HeadTitle").length).toBe(1);
});

test("Component renders correctly without query string", async () => {
	props.location.search = "";
	const item = shallow(<Upload api={defaultApi} {...props} />);
	expect(item.find("HeadTitle").length).toBe(1);
});

test(`When asset is excluded, form inputs are disabled, help message renders, back button renders`, async () => {
	const item = shallow(<Upload api={defaultApi} {...props} />);
	item.setState({
		assetPermissionStatus: "Excluded",
	});
	item.update();
	expect(item.find("[name='uploadName']").props().disabled).toEqual(true);
	expect(item.find("[name='pages']").props().disabled).toEqual(true);
	expect(item.find("ResponseText").length).toBe(1);
	expect(item.find("BackButton").length).toBe(1);
});

test(`When asset is covered form inputs are enabled`, async () => {
	const item = shallow(<Upload api={defaultApi} {...props} />);
	item.setState({
		assetPermissionStatus: "Covered",
	});
	item.update();
	expect(item.find("[name='uploadName']").props().disabled).toEqual(false);
	expect(item.find("[name='pages']").props().disabled).toEqual(false);
});

test(`When asset is Not Found form inputs are enabled and response message renders`, async () => {
	const item = shallow(<Upload api={defaultApi} {...props} />);
	item.setState({
		assetPermissionStatus: "Not Found",
	});
	item.update();
	expect(item.find("[name='uploadName']").props().disabled).toEqual(false);
	expect(item.find("[name='pages']").props().disabled).toEqual(false);
	expect(item.find("ResponseText").length).toBe(1);
});

test(`Loader renders when loading is true and permission status is Excluded`, async () => {
	const item = shallow(<Upload api={defaultApi} {...props} />);
	item.setState({
		loading: true,
		assetPermissionStatus: "",
	});
	item.update();
	expect(item.find("Loader").length).toBe(1);
});

test(`BackButton click`, async () => {
	const item = shallow(<Upload api={defaultApi} {...props} />);
	item.setState({
		assetPermissionStatus: "Excluded",
	});
	item.update();
	item.find("BackButton").simulate("click");
	expect(props.history.push.mock.calls[0][0]).toBe("/asset-upload/before-we-start");
});

test(`checkPermissionStatus gets status and sets state with it`, async () => {
	const item = shallow(<Upload api={defaultApi} {...props} />);
	await wait(50);
	expect(item.state().assetPermissionStatus).toBe("Excluded");
});

test(`checkPermissions throws an error then form disabled and error message`, async () => {
	async function mockApiError(endpoint, data) {
		if (endpoint === "/public/user-asset-upload") {
			return;
		}
		if (endpoint === "/public/asset-get-one") {
			return;
		}
		if (endpoint === "/public/asset-check-permissions") {
			throw new Error("Unknown Error");
		}
		return defaultApi;
	}
	const item = shallow(<Upload api={mockApiError} {...props} />);
	await wait(50);
	expect(item.state().assetPermissionStatus).toBe("Error");
	expect(item.find("[name='uploadName']").props().disabled).toEqual(true);
	expect(item.find("[name='pages']").props().disabled).toEqual(true);
	expect(item.find("ResponseText").length).toBe(1);
});

test(`When user upload valid file`, async () => {
	const item = shallow(<Upload api={defaultApi} {...props} />);
	item.instance().handleFileUpload([new File([], "fileName.pdf")], "assetPdfFile");
	item.update();
	expect(item.state().fields.assetPdfFile).not.toBe(null);
	expect(item.state().valid.assetPdfFile.isValid).toBe(true);
	expect(item.state().valid.assetPdfFile.message).toBe(null);
	expect(item.find("UploadedFile").length).toBe(1);
});

test(`When user upload invalid file`, async () => {
	const item = shallow(<Upload api={defaultApi} {...props} />);
	item.instance().handleFileUpload(null, "assetPdfFile");
	item.instance().invalidateFileUpload();
	item.update();
	expect(item.state().fields.assetPdfFile).toBe(null);
	expect(item.state().valid.assetPdfFile.isValid).toBe(false);
	expect(item.state().valid.assetPdfFile.message).toBe("Required assetPdfFile");
	expect(item.find("UploadedFile").length).toBe(0);
});

test(`When user enters invalid range`, async () => {
	const item = shallow(<Upload api={defaultApi} {...props} />);
	item.instance().handlePagesChange("a-b", "pages", true);
	item.update();
	expect(item.state().fields.pages).toBe("a-b");
	expect(item.state().fields.pagesArray).toBe(null);
	expect(item.state().valid.pagesArray.isValid).toBe(false);
	expect(item.state().valid.pagesArray.message).toBe("Please provide valid page range");
});

test(`When user enters valid range`, async () => {
	const item = shallow(<Upload api={defaultApi} {...props} />);
	item.instance().handlePagesChange("1-5", "pages", true);
	item.update();
	expect(item.state().fields.pages).toBe("1-5");
	expect(item.state().fields.pagesArray).toEqual([1, 2, 3, 4, 5]);
	expect(item.state().valid.pagesArray.isValid).toBe(true);
	expect(item.state().valid.pagesArray.message).toBe(null);
});

test(`When user changes total number of pages`, async () => {
	const item = shallow(<Upload api={defaultApi} {...props} />);
	item.instance().handleInputNumberChange({
		target: {
			name: "pageCount",
			value: 50,
		},
	});
	item.update();
	expect(item.state().fields.pageCount).toEqual(50);
	expect(item.state().valid.pageCount.isValid).toBe(true);
	expect(item.state().valid.pageCount.message).toBe(null);
});

test(`When user select checkbox for create copy`, async () => {
	const item = shallow(<Upload api={defaultApi} {...props} />);
	item.instance().handleCheckboxChange("isSelectedCreateCopy", true);
	item.update();
	expect(item.state().isSelectedCreateCopy).toEqual(true);
	expect(item.find("AjaxSearchableDropdown").length).toBe(1);
});

test(`When user select the class`, async () => {
	const selectedClass = {
		id: "4503c55ecdf775830dd8e978f2f3fb3f9534",
		name: "class",
		value: "4503c55ecdf775830dd8e978f2f3fb3f9534",
		label: "class",
		key: "4503c55ecdf775830dd8e978f2f3fb3f9534",
	};
	const item = shallow(<Upload api={defaultApi} {...props} />);
	item.instance().handleClassChange("selectedClass", selectedClass, {
		isValid: true,
		errorType: "",
		message: null,
	});
	item.update();
	expect(item.state().fields.selectedClass).toEqual(selectedClass);
	expect(item.state().valid.selectedClass.isValid).toBe(true);
	expect(item.state().valid.selectedClass.message).toBe(null);
});

test(`Submit button disabled when until does not confirms that work is owned by isntitution`, async () => {
	const item = shallow(<Upload api={defaultApi} {...props} />);
	item.setState({
		fields: {
			title: "title",
			isbn: "9780785789017",
			author: ["author"],
			publisher: "publisher",
			publicationYear: 2012,
			pages: "1-2",
			pagesArray: [1, 2],
			pageCount: 50,
			assetPdfFile: new File([], "fileName.pdf"),
			selectedClass: "",
			uploadName: "upload name",
		},
	});
	item.update();
	expect(item.find("Button").props().disabled).toEqual(true);
});

test(`When user clicks on submit with invalid isbn`, async () => {
	// props.location.search = `?title=test&isbn=9780785de789017&author=test&publisher=test&pageCount=100`;
	const item = shallow(<Upload api={defaultApi} {...props} />);
	item.setState({
		fields: {
			title: "title",
			isbn: "1234567890",
			author: ["author"],
			publisher: "publisher",
			publicationYear: 2012,
			pages: "1-2",
			pagesArray: [1, 2],
			pageCount: 50,
			assetPdfFile: new File([], "fileName.pdf"),
			selectedClass: "",
			uploadName: "upload name",
		},
		isOwned: true,
	});
	item.update();
	item.instance().onSubmit({ preventDefault: jest.fn() });
	await wait(10);
	expect(props.history.push.mock.calls).toEqual([]);
	expect(item.state().error).toEqual("ISBN not valid");
});

test(`When user clicks on submit without wants to create copy`, async () => {
	const item = shallow(<Upload api={defaultApi} {...props} />);
	item.setState({
		fields: {
			title: "title",
			isbn: "0926777386",
			author: ["author"],
			publisher: "publisher",
			publicationYear: 2012,
			pages: "1-2",
			pagesArray: [1, 2],
			pageCount: 50,
			assetPdfFile: new File([], "fileName.pdf"),
			selectedClass: "",
			uploadName: "upload name",
		},
		isOwned: true,
	});
	item.update();
	item.instance().onSubmit({ preventDefault: jest.fn() });
	await wait(10);
	expect(props.history.push.mock.calls[0][0]).toBe("/profile/my-copies?q_mine_only=1");
});

test(`When user clicks on submit and wants to create copy`, async () => {
	props.location.search = `?isbn13=9780926777385&course=4503c55ecdf775830dd8e978f2f3fb3f9534&selected=1-2&search=9780926777385&type=search`;
	const item = shallow(<Upload api={defaultApi} {...props} />);
	item.setState({
		fields: {
			title: "title",
			isbn: "0926777386",
			author: ["author"],
			publisher: "publisher",
			publicationYear: 2012,
			pages: "1-2",
			pagesArray: [1, 2],
			pageCount: 50,
			assetPdfFile: new File([], "fileName.pdf"),
			selectedClass: {
				id: "4503c55ecdf775830dd8e978f2f3fb3f9534",
				name: "class",
				value: "4503c55ecdf775830dd8e978f2f3fb3f9534",
				label: "class",
				key: "4503c55ecdf775830dd8e978f2f3fb3f9534",
			},
			uploadName: "upload name",
		},
		isOwned: true,
		isSelectedCreateCopy: true,
	});
	item.update();
	item.instance().onSubmit({ preventDefault: jest.fn() });
	await wait(10);
	expect(props.history.push.mock.calls[0][0]).toEqual({
		pathname: "/asset-upload/copy-confirm",
		search: "?isbn13=9780926777385&course=4503c55ecdf775830dd8e978f2f3fb3f9534&selected=1-2&search=9780926777385&type=search",
		state: {
			publicationYear: 2012,
			requestFile: { binary: true, files: { asset: new File([], "fileName.pdf") } },
			requestParams: {
				authors: ["author"],
				course_oid: "4503c55ecdf775830dd8e978f2f3fb3f9534",
				image: undefined,
				is_copying_full_chapter: false,
				is_created_extract: false,
				isbn: "9780926777385",
				page_count: 50,
				page_range: "1, 2",
				pages: [1, 2],
				publication_date: 1325442600,
				publication_year: 2012,
				publisher: "publisher",
				title: "title",
				upload_name: "upload name",
			},
		},
	});
});

test(`When user clicks on submit and wnats to create copy but class is not selected`, async () => {
	const item = shallow(<Upload api={defaultApi} {...props} />);
	item.setState({
		fields: {
			title: "title",
			isbn: "0926777386",
			author: ["author"],
			publisher: "publisher",
			publicationYear: null,
			pages: "1-2",
			pagesArray: [1, 2],
			pageCount: 50,
			assetPdfFile: new File([], "fileName.pdf"),
			selectedClass: null,
			uploadName: "upload name",
		},
		isOwned: true,
		isSelectedCreateCopy: true,
	});
	item.update();
	item.instance().onSubmit({ preventDefault: jest.fn() });
	await wait(10);
	expect(props.history.push.mock.calls).toEqual([]);
	expect(item.state().error).toEqual("Please select a class");
});

test(`Test componentDidUpdate method`, async () => {
	let prevProps = {
		location: {
			search: "?title=test&isbn=9780785789017&author=test&publisher=test&pageCount=200",
		},
	};
	const item = shallow(<Upload api={defaultApi} {...props} />);
	item.instance().componentDidUpdate(prevProps);
	await wait(10);
	expect(item.find("HeadTitle").length).toBe(1);
});

test(`Test componentWillUnmount method`, async () => {
	const item = shallow(<Upload api={defaultApi} {...props} />);
	item.instance()._isMounted = true;
	item.instance().componentWillUnmount();

	await wait(10);
	expect(item.instance()._isMounted).toBe(undefined);
});

test(`When user enters range less than 5%`, async () => {
	const item = shallow(<Upload api={defaultApi} {...props} />);
	item.setState({ pageCount: 100 });
	item.instance().handlePagesChange("1-4", "pages", true);
	item.update();
	expect(item.state().fields.pages).toBe("1-4");
	expect(item.state().fields.pagesArray).toEqual([1, 2, 3, 4]);
	expect(item.state().valid.pagesArray.isValid).toBe(true);
	expect(item.state().valid.pagesArray.message).toBe(null);
	expect(item.find("PageRangeExceedLabel").length).toBe(0);
});

test(`When user enters range greater than 5%`, async () => {
	const item = shallow(<Upload api={defaultApi} {...props} />);
	item.setState({ pageCount: 100 });
	item.instance().handlePagesChange("1-10", "pages", true);
	item.update();
	expect(item.state().fields.pages).toBe("1-10");
	expect(item.state().fields.pagesArray).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
	expect(item.state().valid.pagesArray.isValid).toBe(true);
	expect(item.state().valid.pagesArray.message).toBe(null);
	expect(item.find("[name='isCopyingFullChapter']").length).toBe(1);
});

test(`When user selects the checkbox for copying full chapter`, async () => {
	const item = shallow(<Upload api={defaultApi} {...props} />);
	item.instance().handleCheckboxChange("isCopyingFullChapter", true);
	item.update();
	expect(item.state().isCopyingFullChapter).toEqual(true);
});

test(`When user change upload name`, async () => {
	const item = shallow(<Upload api={defaultApi} {...props} />);
	item.instance().doNameInputFieldChange("test name", "uploadName");
	expect(item.state().fields.uploadName).toBe("test name");
	expect(item.state().valid.uploadName.isValid).toBe(true);
});

test(`When user change upload name to null`, async () => {
	const item = shallow(<Upload api={defaultApi} {...props} />);
	item.instance().doNameInputFieldChange(null, "uploadName");
	expect(item.state().fields.uploadName).toBe(null);
	expect(item.state().valid.uploadName.isValid).toBe(false);
	expect(item.state().valid.uploadName.message).toEqual("Required uploadName");
});

test(`When asset is already in EP`, async () => {
	const item = shallow(<Upload api={defaultApi} {...props} />);
	item.update();
	await wait(10);
	expect(item.find("i").length).toBe(2);
	expect(item.find("i").at(1).props().title).toBe(
		`A record for this title already exists with a page count of 50. If you believe this is incorrect, please contact support@educationplatform.zendesk.com.`
	);
});

test(`When user enter invalid page count`, async () => {
	async function api(endpoint, data) {
		if (endpoint === "/public/asset-get-one") {
			return {
				result: null,
			};
		}
	}
	const item = shallow(<Upload api={api} {...props} />);
	item.instance().handleInputNumberChange({
		target: {
			name: "pageCount",
			value: -5,
		},
	});
	expect(item.find("FormError").length).toBe(1);
	expect(item.find("FormError").text()).toBe(`Please enter the total number of pages in the book`);
});

test("When user clicks on submit and gets unknown error from user asset upload api", async () => {
	async function api(endpoint, data) {
		if (endpoint === "/public/user-asset-upload") {
			throw new Error("Unlnown Error");
		}
	}
	const item = shallow(<Upload api={api} {...props} />);
	item.setState({
		fields: {
			title: "title",
			isbn: "0926777386",
			author: ["author"],
			publisher: "publisher",
			publicationYear: 2012,
			pages: "1-2",
			pagesArray: [1, 2],
			pageCount: 50,
			assetPdfFile: new File([], "fileName.pdf"),
			selectedClass: "",
			uploadName: "upload name",
		},
		isOwned: true,
	});
	item.update();
	item.instance().onSubmit({ preventDefault: jest.fn() });
	await wait(10);
	expect(props.history.push).not.toHaveBeenCalled();
});

test(`When user enters page range greater than 20% and clicks on submit`, async () => {
	const item = shallow(<Upload api={defaultApi} {...props} />);
	item.setState({
		fields: {
			title: "title",
			isbn: "0926777386",
			author: ["author"],
			publisher: "publisher",
			publicationYear: null,
			pages: "1-3",
			pagesArray: [1, 2, 3],
			pageCount: 10,
			assetPdfFile: new File([], "fileName.pdf"),
			selectedClass: null,
			uploadName: "upload name",
		},
		isOwned: true,
		isSelectedCreateCopy: true,
	});
	item.instance().onSubmit({ preventDefault: jest.fn() });
	await wait(10);
	expect(item.find("Modal").length).toBe(1);
});

test(`When user clicks on i understand button`, async () => {
	const item = shallow(<Upload api={defaultApi} {...props} />);
	item.setState({
		fields: {
			title: "title",
			isbn: "0926777386",
			author: ["author"],
			publisher: "publisher",
			publicationYear: null,
			pages: "1-3",
			pagesArray: [1, 2, 3],
			pageCount: 10,
			assetPdfFile: new File([], "fileName.pdf"),
			selectedClass: null,
			uploadName: "upload name",
		},
		isOwned: true,
		isSelectedCreateCopy: true,
	});
	item.instance().onSubmit({ preventDefault: jest.fn() });
	await wait(10);
	expect(item.find("Modal").length).toBe(1);
});

test(`When user clicks on i understand button`, async () => {
	const item = shallow(<Upload api={defaultApi} {...props} />);
	item.setState({
		fields: {
			title: "title",
			isbn: "0926777386",
			author: ["author"],
			publisher: "publisher",
			publicationYear: null,
			pages: "1-3",
			pagesArray: [1, 2, 3],
			pageCount: 50,
			assetPdfFile: new File([], "fileName.pdf"),
			selectedClass: null,
			uploadName: "upload name",
		},
		isOwned: true,
		isSelectedCreateCopy: true,
	});
	item.instance().onSubmit({ preventDefault: jest.fn() });
	await wait(10);
	item.instance().doCloseModal();
	expect(item.find("Modal").length).toBe(0);
	expect(item.state().fields).toEqual({
		title: "title",
		isbn: "0926777386",
		author: ["author"],
		publisher: "publisher",
		publicationYear: null,
		pages: "1-3",
		pagesArray: [1, 2, 3],
		pageCount: 50,
		assetPdfFile: new File([], "fileName.pdf"),
		selectedClass: null,
		uploadName: "upload name",
	});
});

test(`When user wants to create a copy and exceeded the 5% copy limit on my specific class AND asset`, async () => {
	async function api(endpoint) {
		if (endpoint === "/public/get-extract-limits") {
			return {
				school: {
					limit: 10,
					extracted: [1, 2, 3, 4, 5],
				},
				course: {
					limit: 2,
					extracted: [1, 2, 3],
				},
			};
		}
		return defaultApi;
	}

	const item = shallow(<Upload api={api} {...props} />);

	item.instance().handleCheckboxChange("isSelectedCreateCopy", true);
	item.update();

	const selectedClass = {
		id: "4503c55ecdf775830dd8e978f2f3fb3f9534",
		name: "class",
		value: "4503c55ecdf775830dd8e978f2f3fb3f9534",
		label: "class",
		key: "4503c55ecdf775830dd8e978f2f3fb3f9534",
	};
	item.instance().handleClassChange("selectedClass", selectedClass, {
		isValid: true,
		errorType: "",
		message: null,
	});
	item.update();
	await wait(10);

	expect(item.find("InfoText").at(1).text()).toEqual(
		"You have reached the copying allowance for this book. You can still upload your PDF to use for another class, or in a future academic year. To proceed, please uncheck the above box or select a different class."
	);
	expect(item.find("Button").props().disabled).toBe(true);
});

test(`When user enters page range greater than 20% and clicks on 'Would you also like to create a copy?'`, async () => {
	const item = shallow(<Upload api={defaultApi} {...props} />);
	item.setState({ pageCount: 100 });
	item.instance().handlePagesChange("1-21", "pages", true);
	item.update();
	item.instance().handleCheckboxChange("isSelectedCreateCopy", true);
	item.update();
	expect(item.find("InfoText").at(1).text()).toEqual(
		"You have reached the copying allowance for this book. You can still upload your PDF to use in a future academic year. To proceed, please uncheck the above box."
	);
	expect(item.find("Button").props().disabled).toBe(true);
});

test(`When school limit exceeded for asset and user clicks on 'Would you also like to create a copy?' `, async () => {
	async function api(endpoint) {
		if (endpoint === "/public/get-extract-limits") {
			return {
				school: {
					limit: 5,
					extracted: [1, 2, 3, 4, 5, 6, 7, 8],
				},
				course: {
					limit: 2,
					extracted: [1, 2, 3],
				},
			};
		}
		return defaultApi;
	}

	const item = shallow(<Upload api={api} {...props} />);
	await wait(10);

	item.instance().handleCheckboxChange("isSelectedCreateCopy", true);
	item.update();
	await wait(10);

	expect(item.find("InfoText").at(1).text()).toEqual(
		"You have reached the copying allowance for this book. You can still upload your PDF to use in a future academic year. To proceed, please uncheck the above box."
	);
	expect(item.find("Button").props().disabled).toBe(true);
});

test(`When user deselect the class`, async () => {
	const item = shallow(<Upload api={defaultApi} {...props} />);
	item.setState({
		isOwned: true,
		isSelectedCreateCopy: true,
	});
	item.instance().handleClassChange("selectedClass", null, {
		isValid: true,
		errorType: "",
		message: null,
	});
	item.update();
	expect(item.state().fields.selectedClass).toEqual(null);
	expect(item.state().valid.selectedClass.isValid).toBe(false);
	expect(item.state().valid.selectedClass.message).toBe("Required selectedClass");
});

test(`When user comes from copy confirmation page`, async () => {
	props.location = {
		search: `?title=Some%20third%20title&isbn=9780307283672&author=%5B"Bob%20Markson"%2C"Mark%20Bobson"%5D&publisher=OUP&course=aa2bf8f49879114742151b796c866126737a&publicationYear=1997`,
		state: {
			file: new File([], "fileName.pdf"),
			params: {
				authors: ["author"],
				course_oid: "4503c55ecdf775830dd8e978f2f3fb3f9534",
				image: undefined,
				is_copying_full_chapter: false,
				is_created_extract: false,
				isbn: "9780926777385",
				page_count: 50,
				page_range: "1,2",
				pages: [1, 2],
				publication_date: 1325442600,
				publisher: "publisher",
				title: "title",
				upload_name: "upload name",
				select_class: {
					id: "4503c55ecdf775830dd8e978f2f3fb3f9534",
					name: "class",
					value: "4503c55ecdf775830dd8e978f2f3fb3f9534",
					label: "class",
					key: "4503c55ecdf775830dd8e978f2f3fb3f9534",
				},
			},
		},
	};
	const item = shallow(<Upload api={defaultApi} {...props} />);
	expect(item.state().fields).toEqual({
		title: "Some third title",
		isbn: "9780307283672",
		author: ["Bob Markson", "Mark Bobson"],
		publisher: "OUP",
		publicationYear: "1997",
		pages: [1, 2],
		pagesArray: [1, 2],
		pageCount: 0,
		assetPdfFile: new File([], "fileName.pdf"),
		selectedClass: {
			id: "4503c55ecdf775830dd8e978f2f3fb3f9534",
			key: "4503c55ecdf775830dd8e978f2f3fb3f9534",
			label: "class",
			name: "class",
			value: "4503c55ecdf775830dd8e978f2f3fb3f9534",
		},
		image: undefined,
		uploadName: "upload name",
	});
});

test(`When user clicks on submit and wants to create copy with manual data`, async () => {
	props.location.search = `?isbn13=9780926777385&course=4503c55ecdf775830dd8e978f2f3fb3f9534&selected=1-2&search=9780926777385&type=manual`;
	const item = shallow(<Upload api={defaultApi} {...props} />);
	item.setState({
		fields: {
			title: "title",
			isbn: "0926777386",
			author: ["author"],
			publisher: "publisher",
			publicationYear: 2012,
			pages: "1-2",
			pagesArray: [1, 2],
			pageCount: 50,
			assetPdfFile: new File([], "fileName.pdf"),
			selectedClass: {
				id: "4503c55ecdf775830dd8e978f2f3fb3f9534",
				name: "class",
				value: "4503c55ecdf775830dd8e978f2f3fb3f9534",
				label: "class",
				key: "4503c55ecdf775830dd8e978f2f3fb3f9534",
			},
			uploadName: "upload name",
		},
		isOwned: true,
		isSelectedCreateCopy: true,
	});
	item.update();
	item.instance().onSubmit({ preventDefault: jest.fn() });
	await wait(10);
	expect(props.history.push.mock.calls[0][0]).toEqual({
		pathname: "/asset-upload/copy-confirm",
		search: "?isbn13=9780926777385&course=4503c55ecdf775830dd8e978f2f3fb3f9534&selected=1-2&search=9780926777385&type=manual",
		state: {
			publicationYear: 2012,
			requestFile: { binary: true, files: { asset: new File([], "fileName.pdf") } },
			requestParams: {
				authors: ["author"],
				course_oid: "4503c55ecdf775830dd8e978f2f3fb3f9534",
				image: undefined,
				is_copying_full_chapter: false,
				is_created_extract: false,
				isbn: "9780926777385",
				page_count: 50,
				page_range: "1, 2",
				pages: [1, 2],
				publication_date: 1325442600,
				publication_year: 2012,
				publisher: "publisher",
				title: "title",
				upload_name: "upload name",
			},
		},
	});
});
