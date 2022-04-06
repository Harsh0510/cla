// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import AdminPage from "../index";
import MockUnlockAttempt from "../../../mocks/MockUnlockAttempt";
import MockUser from "../../../mocks/MockUser";
import Header from "../../../widgets/Header";
import MockExtractAccess from "../../../mocks/MockExtractAccess";
import MockContentRequest from "../../../mocks/MockContentRequest";

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);
jest.mock("../../../common/withAdminAuthRequiredConsumer", () => {
	return function (acceptedRoles, WrappedComponent) {
		if (!Object.keys(acceptedRoles).length == 3) {
			throw "It should be passed acceptedToles with a single key";
		}
		if (!acceptedRoles.hasOwnProperty("cla-admin" || "school-admin" || "teacher")) {
			throw "It should be passed acceptedToles with a key: cla-admin || school-admin || teacher";
		}
		return WrappedComponent;
	};
});

jest.mock("xlsx", () => {
	return {
		utils: {
			json_to_sheet: jest.fn().mockReturnValue({
				A1: { t: "s", v: "Username" },
				A2: { t: "s", v: "schooladmin@email.com" },
				A3: { t: "s", v: "schooladmin@email.com" },
				A4: { t: "s", v: "email2@email.com" },
				B1: { t: "s", v: "School" },
				B2: { t: "s", v: "Test School5ffff" },
				B3: { t: "s", v: "Test School5ffff" },
				B4: { t: "s", v: "Another School" },
				C1: { t: "s", v: "Date of Unlock" },
				C2: { t: "s", v: "2019-03-06 13:54:10" },
				C3: { t: "s", v: "2019-03-06 11:39:90" },
				C4: { t: "s", v: "2019-03-06 11:38:66" },
				D1: { t: "s", v: "Read ISBN" },
				D2: { t: "s", v: "9780007138784" },
				D3: { t: "s", v: "9780007138784" },
				D4: { t: "s", v: "9780007138784" },
			}),
			book_new: jest.fn().mockReturnValue({
				Props: { SheetNames: Array(1), Worksheets: 1, Application: "SheetJS" },
				SSF: [],
				SheetNames: ["Unlock Attempt Fail"],
				Sheets: {
					"Unlock Attempt Fail": {
						"!ref": "A1:D4",
						A1: { t: "s", v: "Username" },
						A2: { t: "s", v: "schooladmin@email.com" },
						A3: { t: "s", v: "schooladmin@email.com" },
						A4: { t: "s", v: "email2@email.com" },
						B1: { t: "s", v: "School" },
						B2: { t: "s", v: "Test School5ffff" },
						B3: { t: "s", v: "Test School5ffff" },
						B4: { t: "s", v: "Another School" },
						C1: { t: "s", v: "Date of Unlock" },
						C2: { t: "s", v: "2019-03-06 13:54:10" },
						C3: { t: "s", v: "2019-03-06 11:39:90" },
						C4: { t: "s", v: "2019-03-06 11:38:66" },
						D1: { t: "s", v: "Read ISBN" },
						D2: { t: "s", v: "9780007138784" },
						D3: { t: "s", v: "9780007138784" },
						D4: { t: "s", v: "9780007138784" },
					},
				},
			}),
			book_append_sheet: () => mockBook_Append_Sheet,
		},
		write: jest.fn(),
		writeFile: jest.fn(),
	};
});
/**Mock function */
const mockBook_Append_Sheet = jest.fn();

let mockUserData;

function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}

/**
 * Reset function
 */
function resetAll() {
	mockUserData = MockUser[0];
}

beforeEach(resetAll);
afterEach(resetAll);

test("Component renders correctly", async () => {
	const item = shallow(<AdminPage withAuthConsumer_myUserDetails={mockUserData} />);

	expect(item.containsMatchingElement(<Header />)).toBe(true);
});

/** User login with cla-admin */
test("User login with cla-admin and showing the 23 links", async () => {
	mockUserData = MockUser[3];
	const item = shallow(<AdminPage withAuthConsumer_myUserDetails={mockUserData} />);
	expect(item.find("LinkIcon").length).toEqual(23);
	const schoolLink = item.find("LinkIcon").at(6);
	expect(schoolLink.debug()).toEqual('<LinkIcon linkTitle="Institutions" iconClass="fas fa-school" linkTo="/profile/admin/institutions" />');
	expect(schoolLink.props().linkTitle).toEqual("Institutions");
});

/** User login with school-admin */
test("User login with school-admin and show schools link", async () => {
	mockUserData = MockUser[1];
	const item = shallow(<AdminPage withAuthConsumer_myUserDetails={mockUserData} />);
	expect(item.find("LinkIcon").length).toEqual(9);
	expect(item.find("LinkIcon").at(5).props().linkTitle).toEqual("Edit Institution Details");
	expect(item.find("LinkIcon").at(7).props().linkTitle).toEqual("Reporting");
});

/** User login with tacher so not display edit school and schools link, but show the class management link and My uploads */
test("User login with teacher it show only class management link, reporting link and My uploads", async () => {
	mockUserData = MockUser[2];
	const item = shallow(<AdminPage withAuthConsumer_myUserDetails={mockUserData} />);
	expect(item.find("LinkIcon").length).toEqual(3);
	expect(item.find("LinkIcon").at(0).props().linkTitle).toEqual("Classes");
	expect(item.find("LinkIcon").at(1).props().linkTitle).toEqual("Reporting");
	expect(item.find("LinkIcon").at(2).props().linkTitle).toEqual("My Uploads");
});

/* User login with cla-admin and show Approved Domains link */
test("User login with cla-admin and show Approved Domains link", async () => {
	mockUserData = MockUser[3];
	const item = shallow(<AdminPage withAuthConsumer_myUserDetails={mockUserData} />);
	const approvedDomainLink = item.find("LinkIcon").at(11);
	expect(approvedDomainLink.props().linkTitle).toEqual("Approved Domains");
});

/* User login with cla-admin and show Trusted Domains link */
test("User login with cla-admin and show Trusted Domains link", async () => {
	mockUserData = MockUser[3];
	const item = shallow(<AdminPage withAuthConsumer_myUserDetails={mockUserData} />);
	const trustedDomainLink = item.find("LinkIcon").at(12);
	expect(trustedDomainLink.props().linkTitle).toEqual("Trusted Domains");
});

/* User login with cla-admin and show Publishers link */
test("User login with cla-admin and show Publishers link", async () => {
	mockUserData = MockUser[3];
	const item = shallow(<AdminPage withAuthConsumer_myUserDetails={mockUserData} />);
	const publisherLink = item.find("LinkIcon").at(13);
	expect(publisherLink.props().linkTitle).toEqual("Publishers");
});

/* User login with cla-admin and show Unlock content for school link */
test("User login with cla-admin and show Unlock content for school link", async () => {
	mockUserData = MockUser[3];
	const item = shallow(<AdminPage withAuthConsumer_myUserDetails={mockUserData} />);
	const unlockContentLink = item.find("LinkIcon").at(4);
	expect(unlockContentLink.props().linkTitle).toEqual("Bulk Content Unlock");
});

/* User login with school-admin and show Unlock content for school link */
test("User login with school-admin and show Unlock content for school link", async () => {
	mockUserData = MockUser[1];
	const item = shallow(<AdminPage withAuthConsumer_myUserDetails={mockUserData} />);
	const unlockContentLink = item.find("LinkIcon").at(4);
	expect(unlockContentLink.props().linkTitle).toEqual("Bulk Content Unlock");
});

/* User login with cla-admin and show Unlock content for Download list of attempted unlocks link */
test("User login with cla-admin and show Unlock content for Download list of attempted unlocks link", async () => {
	mockUserData = MockUser[3];
	const item = shallow(<AdminPage withAuthConsumer_myUserDetails={mockUserData} />);
	const unlockContentLink = item.find("LinkIcon").at(14);
	expect(unlockContentLink.props().linkTitle).toEqual("Download list of attempted unlocks");
});

/* User click on "Download list of attempted unlocks" link and get the export file */
test('User click on "Download list of attempted unlocks" link and get the export file', async () => {
	async function api(endpoint, data) {
		if (endpoint === "/admin/unlock-attempt-get-all") {
			return MockUnlockAttempt;
		}
		throw new Error("should never be here");
	}
	mockUserData = MockUser[3];
	const item = shallow(<AdminPage withAuthConsumer_myUserDetails={mockUserData} api={api} />);
	item.instance()._aElement = {
		setAttribute: () => true,
		click: () => true,
	};
	const unlockContentLink = item.find("LinkIcon").at(14);
	expect(unlockContentLink.props().linkTitle).toEqual("Download list of attempted unlocks");
	unlockContentLink.props().onButtonClick({ preventDefault: jest.fn(), stopPropagation: jest.fn() });
	await wait(100);
	item.update();
	expect(item.state().message).toEqual("Exported the Unlock-Attempt failed data successfully.");
});

/* User click on "Download list of attempted unlocks" link and get the export file */
test('User click on "Download list of attempted unlocks" link and get the export file with balnk data', async () => {
	async function api(endpoint, data) {
		if (endpoint === "/admin/unlock-attempt-get-all") {
			return { result: [] };
		}
		throw new Error("should never be here");
	}
	mockUserData = MockUser[3];
	const item = shallow(<AdminPage withAuthConsumer_myUserDetails={mockUserData} api={api} />);
	item.instance()._aElement = {
		setAttribute: () => true,
		click: () => true,
	};
	const unlockContentLink = item.find("LinkIcon").at(14);
	expect(unlockContentLink.props().linkTitle).toEqual("Download list of attempted unlocks");
	unlockContentLink.props().onButtonClick({ preventDefault: jest.fn(), stopPropagation: jest.fn() });
	await wait(100);
	item.update();
	expect(item.state().message).toEqual("Exported the Unlock-Attempt failed data successfully.");
});

/* User click on "Download list of attempted unlocks" link and get "Unknown Error" */
test('User click on "Download list of attempted unlocks" link and get "Unknown Error"', async () => {
	async function api(endpoint, data) {
		if (endpoint === "/admin/unlock-attempt-get-all") {
			throw "Unknown Error";
		}
		throw new Error("should never be here");
	}
	mockUserData = MockUser[3];
	const item = shallow(<AdminPage withAuthConsumer_myUserDetails={mockUserData} api={api} />);
	const unlockContentLink = item.find("LinkIcon").at(14);
	expect(unlockContentLink.props().linkTitle).toEqual("Download list of attempted unlocks");
	unlockContentLink.props().onButtonClick({ preventDefault: jest.fn(), stopPropagation: jest.fn() });
	await wait(100);
	item.update();
	expect(item.state().message).toEqual("Unknown Error");
});

/** content-access link test cases */
/* User click on "Download list of extract access" link and get the export file */
test('User click on "Download list of extract access" link and get the export file', async () => {
	async function api(endpoint, data) {
		if (endpoint === "/admin/extract-access-get-all") {
			return MockExtractAccess;
		}
		throw new Error("should never be here");
	}
	mockUserData = MockUser[3];
	const item = shallow(<AdminPage withAuthConsumer_myUserDetails={mockUserData} api={api} />);
	const unlockContentLink = item.find("LinkIcon").at(15);
	expect(unlockContentLink.props().linkTitle).toEqual("Download list of content accesses");
	unlockContentLink.props().onButtonClick({ preventDefault: jest.fn(), stopPropagation: jest.fn() });
	await wait(100);
	item.update();
	expect(item.state().message).toEqual("Exported the extract-access data successfully.");
});

/* User click on "Download list of extract access" link and get the export file */
test('User click on "Download list of extract access" link and get the export file with balnk data', async () => {
	async function api(endpoint, data) {
		if (endpoint === "/admin/extract-access-get-all") {
			return { result: [] };
		}
		throw new Error("should never be here");
	}
	mockUserData = MockUser[3];
	const item = shallow(<AdminPage withAuthConsumer_myUserDetails={mockUserData} api={api} />);
	const unlockContentLink = item.find("LinkIcon").at(15);
	expect(unlockContentLink.props().linkTitle).toEqual("Download list of content accesses");
	unlockContentLink.props().onButtonClick({ preventDefault: jest.fn(), stopPropagation: jest.fn() });
	await wait(100);
	item.update();
	expect(item.state().message).toEqual("Exported the extract-access data successfully.");
});

/* User click on "Download list of extract access" link and get "Unknown Error" */
test('User click on "Download list of extract access" link and get "Unknown Error"', async () => {
	async function api(endpoint, data) {
		if (endpoint === "/admin/extract-access-get-all") {
			throw "Unknown Error";
		}
		throw new Error("should never be here");
	}
	mockUserData = MockUser[3];
	const item = shallow(<AdminPage withAuthConsumer_myUserDetails={mockUserData} api={api} />);
	const unlockContentLink = item.find("LinkIcon").at(15);
	expect(unlockContentLink.props().linkTitle).toEqual("Download list of content accesses");
	unlockContentLink.props().onButtonClick({ preventDefault: jest.fn(), stopPropagation: jest.fn() });
	await wait(100);
	item.update();
	expect(item.state().message).toEqual("Unknown Error");
});

/* Test componentWillUnmount" */
test(`Test componentWillUnmount method`, async () => {
	async function api(endpoint, data) {
		if (endpoint === "/admin/extract-access-get-all") {
			throw "Unknown Error";
		}
		throw new Error("should never be here");
	}
	mockUserData = MockUser[3];
	const item = shallow(<AdminPage withAuthConsumer_myUserDetails={mockUserData} api={api} />);
	// _aElement will be deleted
	item.instance().componentWillUnmount();
	expect(item.instance()._aElement).toEqual(undefined);
	// _aElement is already deleted
	item.instance().componentWillUnmount();
	expect(item.instance()._aElement).toEqual(undefined);
});

test('User click on "Download list of emails" link and get the export file', async () => {
	async function api(endpoint, data) {
		if (endpoint === "/admin/email-activity-get-url") {
			return { url: "https://file-examples.com/wp-content/uploads/2017/02/file_example_XLSX_5000.xlsx" };
		}
		throw new Error("should never be here");
	}
	mockUserData = MockUser[3];
	const item = shallow(<AdminPage withAuthConsumer_myUserDetails={mockUserData} api={api} />);

	item.instance()._aElement = {
		setAttribute: () => true,
		click: () => true,
	};

	const getEmailLink = item.find("LinkIcon").at(16);
	expect(getEmailLink.props().linkTitle).toEqual("Download list of emails");
	getEmailLink.props().onButtonClick({ preventDefault: jest.fn(), stopPropagation: jest.fn() });
	await wait(100);
	item.update();
	expect(item.state().message).toEqual("Exported the email list data successfully.");
});

/* User login with cla-admin and show download list of content requests link */
test("User login with cla-admin and show download list of content requests link", async () => {
	mockUserData = MockUser[3];
	const item = shallow(<AdminPage withAuthConsumer_myUserDetails={mockUserData} />);
	const assetRequestLink = item.find("LinkIcon").at(22);
	expect(assetRequestLink.props().linkTitle).toEqual("Download list of content requests");
});

/* User click on "Download list of content requests" link and get the export file */
test('User click on "Download list of content requests" link and get the export file', async () => {
	async function api(endpoint, data) {
		if (endpoint === "/admin/content-request-get-all") {
			return MockContentRequest;
		}
		throw new Error("should never be here");
	}
	mockUserData = MockUser[3];
	const item = shallow(<AdminPage withAuthConsumer_myUserDetails={mockUserData} api={api} />);
	item.instance()._aElement = {
		setAttribute: () => true,
		click: () => true,
	};
	const assetRequestLink = item.find("LinkIcon").at(22);
	expect(assetRequestLink.props().linkTitle).toEqual("Download list of content requests");
	assetRequestLink.props().onButtonClick({ preventDefault: jest.fn(), stopPropagation: jest.fn() });
	await wait(100);
	item.update();
	expect(item.state().message).toEqual("Exported content requests successfully.");
});

/* User click on "Download list of content requests" link and get the export file */
test('User click on "Download list of content requests" link and get the export file with balnk data', async () => {
	async function api(endpoint, data) {
		if (endpoint === "/admin/content-request-get-all") {
			return { result: [] };
		}
		throw new Error("should never be here");
	}
	mockUserData = MockUser[3];
	const item = shallow(<AdminPage withAuthConsumer_myUserDetails={mockUserData} api={api} />);
	item.instance()._aElement = {
		setAttribute: () => true,
		click: () => true,
	};
	const unlockContentLink = item.find("LinkIcon").at(22);
	expect(unlockContentLink.props().linkTitle).toEqual("Download list of content requests");
	unlockContentLink.props().onButtonClick({ preventDefault: jest.fn(), stopPropagation: jest.fn() });
	await wait(100);
	item.update();
	expect(item.state().message).toEqual("Exported content requests successfully.");
});

/* User click on "Download list of content requests" link and get "Unknown Error" */
test('User click on "Download list of content requests" link and get "Unknown Error"', async () => {
	async function api(endpoint, data) {
		if (endpoint === "/admin/content-request-get-all") {
			throw "Unknown Error";
		}
		throw new Error("should never be here");
	}
	mockUserData = MockUser[3];
	const item = shallow(<AdminPage withAuthConsumer_myUserDetails={mockUserData} api={api} />);
	const unlockContentLink = item.find("LinkIcon").at(22);
	expect(unlockContentLink.props().linkTitle).toEqual("Download list of content requests");
	unlockContentLink.props().onButtonClick({ preventDefault: jest.fn(), stopPropagation: jest.fn() });
	await wait(100);
	item.update();
	expect(item.state().message).toEqual("Unknown Error");
});

test("User login with school-admin and show reporting link", async () => {
	mockUserData = MockUser[1];
	const item = shallow(<AdminPage withAuthConsumer_myUserDetails={mockUserData} />);
	const assetRequestLink = item.find("LinkIcon").at(7);
	expect(assetRequestLink.props().linkTitle).toEqual("Reporting");
});

test("User login as teacher and show reporting link", async () => {
	mockUserData = MockUser[2];
	const item = shallow(<AdminPage withAuthConsumer_myUserDetails={mockUserData} />);
	const assetRequestLink = item.find("LinkIcon").at(1);
	expect(assetRequestLink.props().linkTitle).toEqual("Reporting");
});
