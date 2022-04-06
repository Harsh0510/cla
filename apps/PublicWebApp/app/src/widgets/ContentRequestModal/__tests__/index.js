import React from "react";
import { shallow } from "enzyme";
import ContentRequestModal from "../index";
import staticValues from "../../../common/staticValues";

let props;

async function defaultApi(endpoint) {
	// "ContentRequestModal" only queries this endpoint
	if (endpoint === "/admin/content-type-get-all") {
		return {
			data: [
				{ id: 1, name: "content type 1" },
				{ id: 2, name: "content type 2" },
			],
		};
	}

	if (endpoint === "/admin/content-request-create") {
		return {
			created: true,
		};
	}

	throw new Error("should never be here");
}

/**wait for async function */
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

function resetAll() {
	props = {
		api: defaultApi,
		handleClose: jest.fn(),
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test(`Component renders correctly`, async () => {
	const item = shallow(<ContentRequestModal {...props} />);
	expect(item.find("Modal").length).toBe(1);
	expect(item.find("ConfirmModal").length).toBe(0);
});

test(`Component renders correctly when isbn have default value`, async () => {
	props.defaultValues = {
		isbn: "9781002521878",
	};
	const item = shallow(<ContentRequestModal {...props} />);
	expect(item.find("Modal").length).toBe(1);
	expect(item.find("ConfirmModal").length).toBe(0);
	expect(item.state().bookRequest.isbn).toBe("9781002521878");
});

test(`Component renders correctly when title have default value`, async () => {
	props.defaultValues = {
		title: "book title",
	};
	const item = shallow(<ContentRequestModal {...props} />);
	expect(item.find("Modal").length).toBe(1);
	expect(item.find("ConfirmModal").length).toBe(0);
	expect(item.state().bookRequest.title).toBe("book title");
});

describe("When content request is Book request", () => {
	test(`When user changes the tab to the book request`, async () => {
		const item = shallow(<ContentRequestModal {...props} />);
		expect(item.find("Modal").length).toBe(1);
		expect(item.find("ConfirmModal").length).toBe(0);
		expect(item.find("TabSet").length).toBe(1);
		item.instance().onChangeTab(0, staticValues.contentRequestType.bookRequest);
		expect(item.find("TabSet").prop("selectedIndex")).toBe(0);
		expect(item.state().currentTab).toEqual("book-request");
		//when no data provided then submit button is disabled
		expect(item.find("Button").prop("disabled")).toBe(true);
	});

	test(`When user enters invalid isbn value`, async () => {
		const item = shallow(<ContentRequestModal {...props} />);
		expect(item.find("Modal").length).toBe(1);
		expect(item.find("ConfirmModal").length).toBe(0);
		expect(item.find("TabSet").length).toBe(1);
		item.instance().onChangeTab(0, staticValues.contentRequestType.bookRequest);
		expect(item.find("TabSet").prop("selectedIndex")).toBe(0);
		expect(item.state().currentTab).toEqual("book-request");
		item.instance().onChange("isbn", "123456");
		expect(item.state().bookRequest.isbn).toEqual("123456");
		//when invalid isbn provided then submit button is disabled
		expect(item.find("Button").prop("disabled")).toBe(true);
	});

	test(`When user enters valid isbn value`, async () => {
		const item = shallow(<ContentRequestModal {...props} />);
		expect(item.find("Modal").length).toBe(1);
		expect(item.find("ConfirmModal").length).toBe(0);
		expect(item.find("TabSet").length).toBe(1);
		item.instance().onChangeTab(0, staticValues.contentRequestType.bookRequest);
		expect(item.find("TabSet").prop("selectedIndex")).toBe(0);
		expect(item.state().currentTab).toEqual("book-request");
		item.instance().onChange("isbn", "123456789");
		expect(item.state().bookRequest.isbn).toEqual("123456789");
		//when valid isbn provided then submit button is enabled
		expect(item.find("Button").prop("disabled")).toBe(false);
	});

	test(`When user enters only publisher value`, async () => {
		const item = shallow(<ContentRequestModal {...props} />);
		expect(item.find("Modal").length).toBe(1);
		expect(item.find("ConfirmModal").length).toBe(0);
		expect(item.find("TabSet").length).toBe(1);
		item.instance().onChangeTab(0, staticValues.contentRequestType.bookRequest);
		expect(item.find("TabSet").prop("selectedIndex")).toBe(0);
		expect(item.state().currentTab).toEqual("book-request");
		item.instance().onChange("publisher", "publisher");
		expect(item.state().bookRequest.publisher).toEqual("publisher");
		//when only publisher provided then submit button is enabled
		expect(item.find("Button").prop("disabled")).toBe(false);
	});

	test(`When user enters only book title value`, async () => {
		const item = shallow(<ContentRequestModal {...props} />);
		expect(item.find("Modal").length).toBe(1);
		expect(item.find("ConfirmModal").length).toBe(0);
		expect(item.find("TabSet").length).toBe(1);
		item.instance().onChangeTab(0, staticValues.contentRequestType.bookRequest);
		expect(item.find("TabSet").prop("selectedIndex")).toBe(0);
		expect(item.state().currentTab).toEqual("book-request");
		item.instance().onChange("bookTitle", "book title");
		expect(item.state().bookRequest.bookTitle).toEqual("book title");
		//when only book title provided then submit button is enabled
		expect(item.find("Button").prop("disabled")).toBe(false);
	});

	test(`When user enters only publication year value`, async () => {
		const item = shallow(<ContentRequestModal {...props} />);
		expect(item.find("Modal").length).toBe(1);
		expect(item.find("ConfirmModal").length).toBe(0);
		expect(item.find("TabSet").length).toBe(1);
		item.instance().onChangeTab(0, staticValues.contentRequestType.bookRequest);
		expect(item.find("TabSet").prop("selectedIndex")).toBe(0);
		expect(item.state().currentTab).toEqual("book-request");
		item.instance().onChange("publicationYear", 2021);
		expect(item.state().bookRequest.publicationYear).toEqual(2021);
		//when only publication year provided then submit button is enabled
		expect(item.find("Button").prop("disabled")).toBe(false);
	});

	test(`When user enters only author(s) value`, async () => {
		const item = shallow(<ContentRequestModal {...props} />);
		expect(item.find("Modal").length).toBe(1);
		expect(item.find("ConfirmModal").length).toBe(0);
		expect(item.find("TabSet").length).toBe(1);
		item.instance().onChangeTab(0, staticValues.contentRequestType.bookRequest);
		expect(item.find("TabSet").prop("selectedIndex")).toBe(0);
		expect(item.state().currentTab).toEqual("book-request");
		item.instance().onChange("authors", "author");
		expect(item.state().bookRequest.authors).toEqual("author");
		//when only authors(s) provided then submit button submit is enabled
		expect(item.find("Button").prop("disabled")).toBe(false);
	});

	test(`When user enters only url value`, async () => {
		const item = shallow(<ContentRequestModal {...props} />);
		expect(item.find("Modal").length).toBe(1);
		expect(item.find("ConfirmModal").length).toBe(0);
		expect(item.find("TabSet").length).toBe(1);
		item.instance().onChangeTab(0, staticValues.contentRequestType.bookRequest);
		expect(item.find("TabSet").prop("selectedIndex")).toBe(0);
		expect(item.state().currentTab).toEqual("book-request");
		item.instance().onChange("url", "www.google.com");
		expect(item.state().bookRequest.url).toEqual("www.google.com");
		//when only url provided then submit button is enabled
		expect(item.find("Button").prop("disabled")).toBe(false);
	});

	test(`When user enters valid data and clicks on submit button`, async () => {
		const item = shallow(<ContentRequestModal {...props} />);
		expect(item.find("Modal").length).toBe(1);
		expect(item.find("ConfirmModal").length).toBe(0);
		expect(item.find("TabSet").length).toBe(1);
		item.instance().onChangeTab(0, staticValues.contentRequestType.bookRequest);
		expect(item.find("TabSet").prop("selectedIndex")).toBe(0);
		expect(item.state().currentTab).toEqual("book-request");
		item.instance().onChange("isbn", "123456789");
		expect(item.state().bookRequest.isbn).toEqual("123456789");
		const submitButton = item.find("Button");
		submitButton.simulate("click");
		await wait(50);
		// after successfully added data confirm modal popups
		expect(item.find("ConfirmModal").length).toBe(1);
	});

	test(`When user clicks on submit button and gets error`, async () => {
		props.api = async (endpoint) => {
			if (endpoint === "/admin/content-request-create") {
				return new Promise((resolve, reject) => {
					reject("Error");
				});
			}
			if (endpoint === "/admin/content-type-get-all") {
				return {
					data: [
						{ id: 1, name: "content type 1" },
						{ id: 2, name: "content type 2" },
					],
				};
			}
		};
		const item = shallow(<ContentRequestModal {...props} />);
		expect(item.find("Modal").length).toBe(1);
		expect(item.find("ConfirmModal").length).toBe(0);
		expect(item.find("TabSet").length).toBe(1);
		item.instance().onChangeTab(0, staticValues.contentRequestType.bookRequest);
		expect(item.find("TabSet").prop("selectedIndex")).toBe(0);
		expect(item.state().currentTab).toEqual("book-request");
		item.instance().onChange("isbn", "123456");
		expect(item.state().bookRequest.isbn).toEqual("123456");
		const submitButton = item.find("Button");
		submitButton.simulate("click");
		await wait(50);
		// after getting isbn not valid error confirm modal not popups
		expect(item.find("ConfirmModal").length).toBe(0);
		expect(item.state("isShowContentRequestForm")).toBe(true);
		expect(item.state("isShowSuccessConfirmModal")).toBe(false);
		expect(item.find("Modal").length).toBe(1);
	});

	test(`When user want to add another request from confirm modal after submited the request`, async () => {
		const item = shallow(<ContentRequestModal {...props} />);
		expect(item.find("Modal").length).toBe(1);
		expect(item.find("ConfirmModal").length).toBe(0);
		expect(item.find("TabSet").length).toBe(1);
		item.instance().onChangeTab(0, staticValues.contentRequestType.bookRequest);
		expect(item.state().currentTab).toEqual("book-request");
		expect(item.state().currentTab).toBe("book-request");
		item.instance().onChange("isbn", "123456789");
		expect(item.state().bookRequest.isbn).toEqual("123456789");
		item.instance().onSubmit();
		const submitButton = item.find("Button");
		submitButton.simulate("click");
		await wait(50);
		// successfully submited and show confirm modal popup
		expect(item.find("Modal").length).toBe(0);
		expect(item.find("ConfirmModal").length).toBe(1);
		expect(item.state("isShowContentRequestForm")).toBe(false);
		expect(item.state("isShowSuccessConfirmModal")).toBe(true);

		//user want to add another request from confirm modal after submited the request
		item.instance().onConfirmSuccessConfirmModal();

		//open the request content popup
		expect(item.find("ConfirmModal").length).toBe(0);
		expect(item.state("isShowContentRequestForm")).toBe(true);
		expect(item.state("isShowSuccessConfirmModal")).toBe(false);
		expect(item.find("Modal").length).toBe(1);
	});
});

describe("When content request is  Author request", () => {
	test(`When user changes the tab to the author request`, async () => {
		const item = shallow(<ContentRequestModal {...props} />);
		expect(item.find("Modal").length).toBe(1);
		expect(item.find("ConfirmModal").length).toBe(0);
		expect(item.find("TabSet").length).toBe(1);
		item.instance().onChangeTab(1, staticValues.contentRequestType.authorRequest);
		expect(item.find("TabSet").prop("selectedIndex")).toBe(1);
		expect(item.state().currentTab).toBe("author-request");
		//when no data provided then submit button is disabled
		expect(item.find("Button").prop("disabled")).toBe(true);
		expect(item.find("ConfirmModal").length).toBe(0);
		expect(item.state("isShowContentRequestForm")).toBe(true);
		expect(item.state("isShowSuccessConfirmModal")).toBe(false);
		expect(item.find("Modal").length).toBe(1);
	});

	test(`When user add author`, async () => {
		const item = shallow(<ContentRequestModal {...props} />);
		expect(item.find("Modal").length).toBe(1);
		expect(item.find("ConfirmModal").length).toBe(0);
		expect(item.find("TabSet").length).toBe(1);
		item.instance().onChangeTab(1, staticValues.contentRequestType.authorRequest);
		expect(item.state().currentTab).toBe("author-request");
		item.instance().onChange("authorRequest", ["author"]);
		expect(item.state().authorRequest).toEqual(["author"]);
		//when author provided theen submit button is enabled
		expect(item.find("Button").prop("disabled")).toBe(false);
	});

	test(`When user enters valid data and clicks on submit button`, async () => {
		const item = shallow(<ContentRequestModal {...props} />);
		expect(item.find("Modal").length).toBe(1);
		expect(item.find("ConfirmModal").length).toBe(0);
		expect(item.find("TabSet").length).toBe(1);
		item.instance().onChangeTab(1, staticValues.contentRequestType.authorRequest);
		expect(item.state().currentTab).toBe("author-request");
		item.instance().onChange("authorRequest", ["author"]);
		expect(item.state().authorRequest).toEqual(["author"]);
		const submitButton = item.find("Button");
		submitButton.simulate("click");
		await wait(50);
		// successfully submited and show confirm modal popup
		expect(item.find("ConfirmModal").length).toBe(1);
		expect(item.state("isShowContentRequestForm")).toBe(false);
		expect(item.state("isShowSuccessConfirmModal")).toBe(true);
		expect(item.find("Modal").length).toBe(0);
	});
});

describe("When content request is Publisher request", () => {
	test(`When user changes the tab to the publisher request`, async () => {
		const item = shallow(<ContentRequestModal {...props} />);
		expect(item.find("Modal").length).toBe(1);
		expect(item.find("ConfirmModal").length).toBe(0);
		expect(item.find("TabSet").length).toBe(1);
		item.instance().onChangeTab(2, staticValues.contentRequestType.publisherRequest);
		expect(item.state().currentTab).toBe("publisher-request");
		expect(item.state().publisherRequest).toEqual([]);
		expect(item.find("TabSet").prop("selectedIndex")).toBe(2);
		//when no data provided then submit button is disabled
		expect(item.find("Button").prop("disabled")).toBe(true);
	});

	test(`When user add publisher`, async () => {
		const item = shallow(<ContentRequestModal {...props} />);
		expect(item.find("Modal").length).toBe(1);
		expect(item.find("ConfirmModal").length).toBe(0);
		expect(item.find("TabSet").length).toBe(1);
		item.instance().onChangeTab(2, staticValues.contentRequestType.publisherRequest);
		expect(item.state().currentTab).toBe("publisher-request");
		item.instance().onChange("publisherRequest", ["publisher"]);
		expect(item.state().publisherRequest).toEqual(["publisher"]);
		//when publisher provided then submit button is enabled
		expect(item.find("Button").prop("disabled")).toBe(false);
	});

	test(`When user enters valid data and clicks on submit button`, async () => {
		const item = shallow(<ContentRequestModal {...props} />);
		expect(item.find("Modal").length).toBe(1);
		expect(item.find("ConfirmModal").length).toBe(0);
		expect(item.find("TabSet").length).toBe(1);
		item.instance().onChangeTab(2, staticValues.contentRequestType.publisherRequest);
		expect(item.state().currentTab).toBe("publisher-request");
		expect(item.find("TabSet").prop("selectedIndex")).toBe(2);
		item.instance().onChange("publisherRequest", ["publisher"]);
		expect(item.state().publisherRequest).toEqual(["publisher"]);
		const submitButton = item.find("Button");
		submitButton.simulate("click");
		await wait(50);
		// successfully submited and show confirm modal popup
		expect(item.state("isShowContentRequestForm")).toBe(false);
		expect(item.state("isShowSuccessConfirmModal")).toBe(true);
		expect(item.find("ConfirmModal").length).toBe(1);
		expect(item.find("Modal").length).toBe(0);
	});
});

describe(`When content request is Content type request`, () => {
	test(`When user changes the tab to the content type request`, async () => {
		const item = shallow(<ContentRequestModal {...props} />);
		expect(item.find("Modal").length).toBe(1);
		expect(item.find("ConfirmModal").length).toBe(0);
		expect(item.find("TabSet").length).toBe(1);
		item.instance().onChangeTab(3, staticValues.contentRequestType.contentTypeRequest);
		expect(item.find("TabSet").prop("selectedIndex")).toBe(3);

		//when no data provided then submit button is disabled
		expect(item.find("Button").prop("disabled")).toBe(true);
	});

	test(`When user selects content type from drop down`, async () => {
		const item = shallow(<ContentRequestModal {...props} />);
		expect(item.find("Modal").length).toBe(1);
		expect(item.find("ConfirmModal").length).toBe(0);
		expect(item.find("TabSet").length).toBe(1);
		item.instance().onChangeTab(3, staticValues.contentRequestType.contentTypeRequest);
		item.instance().onChange("contentTypes", [1, 3]);
		//when content types provided then submit button is enabled
		expect(item.find("Button").prop("disabled")).toBe(false);
	});

	test(`When user changes value of additional comments`, async () => {
		const item = shallow(<ContentRequestModal {...props} />);
		expect(item.find("Modal").length).toBe(1);
		expect(item.find("ConfirmModal").length).toBe(0);
		expect(item.find("TabSet").length).toBe(1);
		item.instance().onChangeTab(3, staticValues.contentRequestType.contentTypeRequest);
		item.instance().onChange("additionalComments", "additional comments");
		expect(item.find("Button").prop("disabled")).toBe(false);
	});

	test(`When user enters valid data and clicks on submit button`, async () => {
		const item = shallow(<ContentRequestModal {...props} />);
		expect(item.find("Modal").length).toBe(1);
		expect(item.find("ConfirmModal").length).toBe(0);
		expect(item.find("TabSet").length).toBe(1);
		item.instance().onChangeTab(3, staticValues.contentRequestType.contentTypeRequest);
		item.instance().onChange("additionalComments", "additional comments");
		const submitButton = item.find("Button");
		submitButton.simulate("click");
		await wait(50);
		// successfully submited and show confirm modal popup
		expect(item.state("isShowContentRequestForm")).toBe(false);
		expect(item.state("isShowSuccessConfirmModal")).toBe(true);
		expect(item.find("ConfirmModal").length).toBe(1);
		expect(item.find("Modal").length).toBe(0);
	});
});

describe("When content request is Other request", () => {
	test(`When user changes the tab to the other request`, async () => {
		const item = shallow(<ContentRequestModal {...props} />);
		expect(item.find("Modal").length).toBe(1);
		expect(item.find("ConfirmModal").length).toBe(0);
		expect(item.find("TabSet").length).toBe(1);
		item.instance().onChangeTab(4, staticValues.contentRequestType.otherRequest);
		expect(item.find("TabSet").prop("selectedIndex")).toBe(4);
		expect(item.state().otherRequest).toEqual("");
		//when no data provided then submit button is disabled
		expect(item.find("Button").prop("disabled")).toBe(true);
	});

	test(`When user changes value of other request`, async () => {
		const item = shallow(<ContentRequestModal {...props} />);
		expect(item.find("Modal").length).toBe(1);
		expect(item.find("ConfirmModal").length).toBe(0);
		expect(item.find("TabSet").length).toBe(1);
		item.instance().onChangeTab(4, staticValues.contentRequestType.otherRequest);
		item.instance().onChange("otherRequest", "other request");
		expect(item.state().otherRequest).toEqual("other request");

		item.instance().onChange("otherRequest", "other request test");
		expect(item.state().otherRequest).toEqual("other request test");
		//when  other request provided submit button is enabled
		expect(item.find("Button").prop("disabled")).toBe(false);
	});

	test(`When user enters valid data and clicks on submit button`, async () => {
		const item = shallow(<ContentRequestModal {...props} />);
		expect(item.find("Modal").length).toBe(1);
		expect(item.find("ConfirmModal").length).toBe(0);
		expect(item.find("TabSet").length).toBe(1);
		item.instance().onChangeTab(4, staticValues.contentRequestType.otherRequest);
		item.instance().onChange("otherRequest", "other request");
		expect(item.state().otherRequest).toEqual("other request");
		const submitButton = item.find("Button");
		submitButton.simulate("click");
		await wait(50);
		// successfully submited and show confirm modal popup
		expect(item.state("isShowContentRequestForm")).toBe(false);
		expect(item.state("isShowSuccessConfirmModal")).toBe(true);
		expect(item.find("ConfirmModal").length).toBe(1);
		expect(item.find("Modal").length).toBe(0);
	});
});

describe("When more than one requests", () => {
	test("When user enters value of isbn for book request and other request and then clicks on submit request", async () => {
		const item = shallow(<ContentRequestModal {...props} />);
		expect(item.find("Modal").length).toBe(1);
		expect(item.find("ConfirmModal").length).toBe(0);
		expect(item.find("TabSet").length).toBe(1);
		item.instance().onChangeTab(0, staticValues.contentRequestType.bookRequest);
		item.instance().onChange("isbn", "123456789");
		item.instance().onChangeTab(4, staticValues.contentRequestType.otherRequest);
		item.instance().onChange("otherRequest", "other request");
		const submitButton = item.find("Button");
		submitButton.simulate("click");
		await wait(50);
		// successfully submited and show confirm modal popup
		expect(item.state("isShowContentRequestForm")).toBe(false);
		expect(item.state("isShowMultiRequestConfirmModal")).toBe(true);
		const confirmModal = item.find("ConfirmModal");
		expect(confirmModal.length).toBe(1);
		expect(confirmModal.props().title).toEqual("You've entered some text on the Book request and Other request as well.");
		expect(item.find("Modal").length).toBe(0);
	});

	test("When user clicks on 'Yes-submit info from all tabs' button of confirm modal for submit all requests", async () => {
		const item = shallow(<ContentRequestModal {...props} />);
		expect(item.find("Modal").length).toBe(1);
		expect(item.find("ConfirmModal").length).toBe(0);
		expect(item.find("TabSet").length).toBe(1);
		item.instance().onChangeTab(0, staticValues.contentRequestType.bookRequest);
		item.instance().onChange("isbn", "123456789");
		item.instance().onChangeTab(4, staticValues.contentRequestType.otherRequest);
		item.instance().onChange("otherRequest", "other request");
		const submitButton = item.find("Button");
		submitButton.simulate("click");
		await wait(50);
		// successfully submited and show confirm modal popup
		expect(item.state("isShowContentRequestForm")).toBe(false);
		expect(item.state("isShowMultiRequestConfirmModal")).toBe(true);
		const confirmModal = item.find("ConfirmModal");
		expect(confirmModal.length).toBe(1);
		expect(confirmModal.props().title).toEqual("You've entered some text on the Book request and Other request as well.");
		expect(item.find("Modal").length).toBe(0);

		// clicks on yes button of confirm modal for submit all requests
		item.instance().onConfirmMultiRequestConfirmModal();
		await wait(50);
		//open the confirm modal popup for submit another data or not
		expect(item.find("ConfirmModal").length).toBe(1);
		expect(item.state("isShowContentRequestForm")).toBe(false);
		expect(item.state("isShowSuccessConfirmModal")).toBe(true);
		expect(item.state("isShowMultiRequestConfirmModal")).toBe(false);
		expect(item.find("Modal").length).toBe(0);
	});

	test("When user clicks on 'No-take me back to edditing' button of confirm modal", async () => {
		const item = shallow(<ContentRequestModal {...props} />);
		expect(item.find("Modal").length).toBe(1);
		expect(item.find("ConfirmModal").length).toBe(0);
		expect(item.find("TabSet").length).toBe(1);
		item.instance().onChangeTab(0, staticValues.contentRequestType.bookRequest);
		item.instance().onChange("isbn", "123456789");
		item.instance().onChangeTab(4, staticValues.contentRequestType.otherRequest);
		item.instance().onChange("otherRequest", "other request");
		const submitButton = item.find("Button");
		submitButton.simulate("click");
		await wait(50);
		// successfully submited and show confirm modal popup
		expect(item.state("isShowContentRequestForm")).toBe(false);
		expect(item.state("isShowMultiRequestConfirmModal")).toBe(true);
		const confirmModal = item.find("ConfirmModal");
		expect(confirmModal.length).toBe(1);
		expect(confirmModal.props().title).toEqual("You've entered some text on the Book request and Other request as well.");
		expect(item.find("Modal").length).toBe(0);

		// clicks on take me back to edditing button
		item.instance().onCancleMultiRequestConfirmModal();
		await wait(50);
		// request modal remains open
		expect(item.find("Modal").length).toBe(1);
		expect(item.find("ConfirmModal").length).toBe(0);
		expect(item.find("TabSet").length).toBe(1);
		expect(item.state().bookRequest.isbn).toEqual("123456789");
		expect(item.state().otherRequest).toEqual("other request");
	});

	test("When user clicks on yes button after submitting multiple requests for creating another requests", async () => {
		const item = shallow(<ContentRequestModal {...props} />);
		expect(item.find("Modal").length).toBe(1);
		expect(item.find("ConfirmModal").length).toBe(0);
		expect(item.find("TabSet").length).toBe(1);
		item.instance().onChangeTab(0, staticValues.contentRequestType.bookRequest);
		item.instance().onChange("isbn", "123456789");
		item.instance().onChangeTab(4, staticValues.contentRequestType.otherRequest);
		item.instance().onChange("otherRequest", "other request");
		const submitButton = item.find("Button");
		submitButton.simulate("click");
		await wait(50);
		// successfully submited and show confirm modal popup
		expect(item.state("isShowContentRequestForm")).toBe(false);
		expect(item.state("isShowMultiRequestConfirmModal")).toBe(true);
		const confirmModal = item.find("ConfirmModal");
		expect(confirmModal.length).toBe(1);
		expect(confirmModal.props().title).toEqual("You've entered some text on the Book request and Other request as well.");
		expect(item.find("Modal").length).toBe(0);

		// clicks on yes button of confirm modal for submit all requests
		item.instance().onConfirmMultiRequestConfirmModal();
		await wait(50);
		//open the confirm modal popup for submit another data or not
		expect(item.find("ConfirmModal").length).toBe(1);
		expect(item.state("isShowContentRequestForm")).toBe(false);
		expect(item.state("isShowSuccessConfirmModal")).toBe(true);
		expect(item.state("isShowMultiRequestConfirmModal")).toBe(false);
		expect(item.find("Modal").length).toBe(0);

		// clicks on yes for submitting another requests
		item.instance().onConfirmSuccessConfirmModal();
		await wait(50);
		// shows request modal
		expect(item.find("Modal").length).toBe(1);
		expect(item.find("ConfirmModal").length).toBe(0);
		expect(item.find("TabSet").length).toBe(1);
		expect(item.find("ConfirmModal").length).toBe(0);
	});

	test("When user clicks on no button after submitting multiple requests for not submitting another request", async () => {
		const item = shallow(<ContentRequestModal {...props} />);
		expect(item.find("Modal").length).toBe(1);
		expect(item.find("ConfirmModal").length).toBe(0);
		expect(item.find("TabSet").length).toBe(1);
		item.instance().onChangeTab(0, staticValues.contentRequestType.bookRequest);
		item.instance().onChange("isbn", "123456789");
		item.instance().onChangeTab(4, staticValues.contentRequestType.otherRequest);
		item.instance().onChange("otherRequest", "other request");
		const submitButton = item.find("Button");
		submitButton.simulate("click");
		await wait(50);
		// successfully submited and show confirm modal popup
		expect(item.state("isShowContentRequestForm")).toBe(false);
		expect(item.state("isShowMultiRequestConfirmModal")).toBe(true);
		const confirmModal = item.find("ConfirmModal");
		expect(confirmModal.length).toBe(1);
		expect(confirmModal.props().title).toEqual("You've entered some text on the Book request and Other request as well.");
		expect(item.find("Modal").length).toBe(0);

		// clicks on yes button of confirm modal for submit all requests
		item.instance().onConfirmMultiRequestConfirmModal();
		await wait(50);
		//open the confirm modal popup for submit another data or not
		expect(item.find("ConfirmModal").length).toBe(1);
		expect(item.state("isShowContentRequestForm")).toBe(false);
		expect(item.state("isShowSuccessConfirmModal")).toBe(true);
		expect(item.state("isShowMultiRequestConfirmModal")).toBe(false);
		expect(item.find("Modal").length).toBe(0);

		// clicks on no button for not submitting another request
		item.find("ConfirmModal").props().onCancel();
		await wait(50);

		expect(props.handleClose).toHaveBeenCalled();
	});
});
