// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import TitleSection from "../TitleSection";

import theme from "../../../common/theme";

let isCalledSetDefaultCoverImage;

/**Image mocks */
/**Mocks for image */
jest.mock("../../../assets/icons/blue_unlocked_single.svg", () => jest.fn());
jest.mock("../../../assets/icons/work_locked.svg", () => jest.fn());
jest.mock("../../../assets/icons/preview.png", () => jest.fn());
jest.mock("../../../widgets/PageWrap/images/Sign_in_Shape_1.svg", () => jest.fn());
jest.mock(".././../widgets/PageWrap/images/Sign_in_Shape_2.svg", () => jest.fn());
jest.mock("../../../widgets/PageWrap/images/Sign_in_Shape_1.svg", () => jest.fn());
jest.mock("../../../widgets/PageWrap/images/Sign_in_Shape_1.svg", () => jest.fn());
jest.mock("../../../widgets/PageWrap/images/Sign_in_Shape_1.svg", () => jest.fn());
jest.mock("../../../widgets/PageWrap/images/Sign_in_Shape_1.svg", () => jest.fn());
jest.mock("../../../common/setDefaultCoverImage.js", () => {
	return () => {
		isCalledSetDefaultCoverImage = true;
	};
});

/**
 * This 'HOC' does nothing but 'pass through' the provided component,
 * so it's not necessary to 'dive()' into rendered results,
 * and so it's possible to mock the 'api' function.
 **/
function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

// Mock import
jest.mock("../../../common/withPageSize", () => {
	const withPageSize = function (WrappedComponent) {
		return WrappedComponent;
	};
	Object.defineProperty(withPageSize, "TINY_MOBILE", {
		value: 5,
		writable: false,
		configurable: false,
	});
	return withPageSize;
});

// jest.mock('@fortawesome/fontawesome-svg-core', () => mockPassthruHoc);
// jest.mock('@fortawesome/react-fontawesome', () => mockPassthruHoc);
// jest.mock('@fortawesome/free-solid-svg-icons', () => mockPassthruHoc);
const mockFunction = jest.fn();
let userData, props, mockGoogleEventIsCalled;
jest.mock("../../../common/googleEvent", () => {
	return function () {
		mockGoogleEventIsCalled = true;
		return true;
	};
});

function resetAll() {
	mockGoogleEventIsCalled = false;
	props = {
		resultData: {
			id: 140,
			title: "Collins Mental Maths",
			sub_title: null,
			description: `Providing plenty of opportunities to improve KS2 mathematical skills, this Maths activity book offers lots of mental maths skills practice and is perfect for use at home.
							Tailored towards Key Stage 2, this Mental Maths activity book provides a fun way to test maths understanding and improve various maths skills.
							Included in this book:
							•	Progress charts to help children track progress
							•	Parental notes to support learning at home
							•	Weekly tests to improve understanding and retention`,
			page_count: 48,
			table_of_contents: null,
			edition: 1,
			publication_date: "2011-12-05T00:00:00.000Z",
			subject_code: "Y",
			subject_name: "Children's, Teenage & educational",
			publisher: "HarperCollins Publishers",
			sub_title: null,
			table_of_contents: null,
			title: "Rising Stars Mathematics Year 6 Textbook",
			is_unlocked: false,
			content_form: "BO",
			temp_unlock_opt_in: false,
		},
		isbn: "9780007457939",
		className: "StyledTitleSection-y3m261-6 bHbYBH",
		breakpoint: 30,
		userData: {
			first_name: "school",
			last_name: "admin",
			role: "school-admin",
			school: "Test School",
			academic_year_end_month: 8,
			academic_year_end_day: 15,
			can_copy: true,
		},
	};
	isCalledSetDefaultCoverImage = false;
}

beforeEach(resetAll);
afterEach(resetAll);

/**mock functions */
const doExtractSort = jest.fn();

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<TitleSection {...props} />);

	expect(item.find("StudentBook").length).toBe(1);
});

/** Asset is locked */
test("Asset is locked", async () => {
	props.resultData.is_unlocked = false;
	const item = shallow(<TitleSection {...props} />);

	expect(item.find("LockBook").length).toBe(1);
	expect(item.find("CreateCopyForm").length).toBe(0);
});

test("When Book unlock then button display with buy link in desktop", async () => {
	props.resultData.is_unlocked = false;
	props.resultData.content_form = "BO";
	props.breakpoint = 30;
	const item = shallow(<TitleSection {...props} />);
	expect(item.find("BuyBookWrap").text().indexOf("Buy this book")).not.toBe(-1);
});

test("When Magazine lock then lock message display in desktop", async () => {
	props.breakpoint = 30;
	props.resultData.is_unlocked = false;
	props.resultData.content_form = "MI";
	const item = shallow(<TitleSection {...props} />);
	expect(item.find("LockBook").text()).toBe("This issue is currently locked. If your institution has a copy, you can unlock it.");
});

test("When Book lock then lock message display in desktop", async () => {
	props.resultData.is_unlocked = false;
	props.resultData.content_form = "BO";
	const item = shallow(<TitleSection {...props} />);
	expect(item.find("LockBook").text()).toBe("This book is currently locked. If your institution has a copy, you can unlock it.");
});

/** Asset is unlocked */
test("When book is unlocked and user screen is desktop", async () => {
	props.resultData.is_unlocked = true;
	props.breakpoint = 30;
	props.resultData.content_form = "BO";
	const item = shallow(<TitleSection {...props} />);
	expect(item.find("LockBook").length).toBe(0);
	expect(item.find("CreateCopyForm").length).toBe(1);
	expect(item.find("BuyBook").length).toBe(1);
	expect(item.find("BuyBook").text()).toBe("Buy this book");
	expect(item.find("MobBuyBook").length).toBe(0);
});

test("When book is unlocked and user screen is mobile", async () => {
	props.resultData.is_unlocked = true;
	props.breakpoint = 5;
	props.resultData.content_form = "BO";
	const item = shallow(<TitleSection {...props} />);
	expect(item.find("LockBook").length).toBe(0);
	expect(item.find("CreateCopyForm").length).toBe(1);
	expect(item.find("BuyBook").length).toBe(0);
	expect(item.find("MobBuyBook").length).toBe(1);
	expect(item.find("MobBuyBook").text()).toBe("Buy this book");
});

test("When book is locked and user screen is desktop", async () => {
	props.resultData.is_unlocked = false;
	props.resultData.content_form = "BO";
	const item = shallow(<TitleSection {...props} />);
	expect(item.find("LockBook").length).toBe(1);
	expect(item.find("CreateCopyForm").length).toBe(0);
	expect(item.find("BuyBook").length).toBe(1);
	expect(item.find("BuyBook").text()).toBe("Buy this book");
	expect(item.find("MobBuyBook").length).toBe(0);
});

test("When book is locked and user screen is mobile", async () => {
	props.resultData.is_unlocked = false;
	props.resultData.content_form = "BO";
	props.breakpoint = 5;
	const item = shallow(<TitleSection {...props} />);
	expect(item.find("LockBook").length).toBe(1);
	expect(item.find("BuyBook").length).toBe(0);
	expect(item.find("MobBuyBook").length).toBe(1);
	expect(item.find("MobBuyBook").text()).toBe("Buy this book");
});

test("When magazine is locked and user screen is desktop", async () => {
	props.resultData.is_unlocked = false;
	props.resultData.content_form = "MI";
	const item = shallow(<TitleSection {...props} />);
	expect(item.find("LockBook").length).toBe(1);
	expect(item.find("CreateCopyForm").length).toBe(0);
	expect(item.find("BuyBook").length).toBe(1);
	expect(item.find("BuyBook").text()).toBe("Subscribe to this magazine");
	expect(item.find("MobBuyBook").length).toBe(0);
});

test("When magazine is locked and user screen is mobile", async () => {
	props.resultData.is_unlocked = false;
	props.resultData.content_form = "MI";
	props.breakpoint = 5;
	const item = shallow(<TitleSection {...props} />);
	expect(item.find("LockBook").length).toBe(1);
	expect(item.find("BuyBook").length).toBe(0);
	expect(item.find("MobBuyBook").length).toBe(1);
	expect(item.find("MobBuyBook").text()).toBe("Subscribe to this magazine");
});

test("When user is not logged in and viewing the book from desktop", async () => {
	props.breakpoint = 30;
	props.resultData.is_unlocked = false;
	props.resultData.buy_book_link = false;
	props.resultData.content_form = "BO";
	userData = null;
	const item = shallow(<TitleSection {...props} />);
	expect(item.find("LockBook").length).toBe(1);
	expect(item.find("CreateCopyForm").length).toBe(0);
	expect(item.find("BuyBook").length).toBe(1);
	expect(item.find("BuyBook").text()).toBe("Buy this book");
	expect(item.find("MobBuyBook").length).toBe(0);
});

test("When user is not logged in and viewing the book from mobile", async () => {
	props.breakpoint = 5;
	props.resultData.is_unlocked = false;
	props.resultData.content_form = "BO";
	userData = null;
	const item = shallow(<TitleSection {...props} />);
	expect(item.find("LockBook").length).toBe(1);
	expect(item.find("CreateCopyForm").length).toBe(0);
	expect(item.find("BuyBook").length).toBe(0);
	expect(item.find("MobBuyBook").length).toBe(1);
	expect(item.find("MobBuyBook").text()).toBe("Buy this book");
});

test("When user is not logged in and viewing the magazine from desktop", async () => {
	props.breakpoint = 30;
	props.resultData.is_unlocked = false;
	props.resultData.buy_book_link = false;
	props.resultData.content_form = "MI";
	userData = null;
	const item = shallow(<TitleSection {...props} />);
	expect(item.find("LockBook").length).toBe(1);
	expect(item.find("CreateCopyForm").length).toBe(0);
	expect(item.find("BuyBook").length).toBe(1);
	expect(item.find("BuyBook").text()).toBe("Subscribe to this magazine");
	expect(item.find("MobBuyBook").length).toBe(0);
});

test("When user is not logged in and viewing the magazine from mobile", async () => {
	props.breakpoint = 5;
	props.resultData.is_unlocked = false;
	props.resultData.content_form = "MI";
	userData = null;
	const item = shallow(<TitleSection {...props} />);
	expect(item.find("LockBook").length).toBe(1);
	expect(item.find("CreateCopyForm").length).toBe(0);
	expect(item.find("BuyBook").length).toBe(0);
	expect(item.find("MobBuyBook").length).toBe(1);
	expect(item.find("MobBuyBook").text()).toBe("Subscribe to this magazine");
});

test("When book is unlocked and buy_book_link is true", async () => {
	props.breakpoint = 30;
	props.resultData.content_form = "BO";
	props.resultData.is_unlocked = true;
	props.resultData.buy_book_link = true;
	userData = null;
	const item = shallow(<TitleSection {...props} />);
	expect(item.find("LockBook").length).toBe(0);
	expect(item.find("CreateCopyForm").length).toBe(1);
	expect(item.find("BuyBook").length).toBe(1);
	expect(item.find("BuyBook").text()).toBe("Buy this book");
	expect(item.find("BuyBook").props().className).toBe("ga-buy-book-unlocked btn");
	expect(item.find("MobBuyBook").length).toBe(0);
});

test("When book is locked and buy_book_link is true", async () => {
	props.breakpoint = 30;
	props.resultData.content_form = "BO";
	props.resultData.is_unlocked = false;
	props.resultData.buy_book_link = true;
	userData = null;
	const item = shallow(<TitleSection {...props} />);
	expect(item.find("LockBook").length).toBe(1);
	expect(item.find("CreateCopyForm").length).toBe(0);
	expect(item.find("BuyBook").length).toBe(1);
	expect(item.find("BuyBook").text()).toBe("Buy this book");
	expect(item.find("BuyBook").props().className).toBe("ga-buy-book-locked btn");
	expect(item.find("MobBuyBook").length).toBe(0);
});

test("When book is unlocked and buy_book_link is false", async () => {
	props.breakpoint = 30;
	props.resultData.content_form = "BO";
	props.resultData.is_unlocked = true;
	props.resultData.buy_book_link = false;
	userData = null;
	const item = shallow(<TitleSection {...props} />);
	expect(item.find("LockBook").length).toBe(0);
	expect(item.find("CreateCopyForm").length).toBe(1);
	expect(item.find("BuyBook").length).toBe(1);
	expect(item.find("BuyBook").text()).toBe("Buy this book");
	expect(item.find("BuyBook").props().className).toBe("btn");
	expect(item.find("MobBuyBook").length).toBe(0);
});

test("When book is locked and buy_book_link is false", async () => {
	props.breakpoint = 30;
	props.resultData.content_form = "BO";
	props.resultData.is_unlocked = false;
	props.resultData.buy_book_link = false;
	userData = null;
	const item = shallow(<TitleSection {...props} />);
	expect(item.find("LockBook").length).toBe(1);
	expect(item.find("CreateCopyForm").length).toBe(0);
	expect(item.find("BuyBook").length).toBe(1);
	expect(item.find("BuyBook").text()).toBe("Buy this book");
	expect(item.find("BuyBook").props().className).toBe("");
	expect(item.find("MobBuyBook").length).toBe(0);
});

test("When magazine is unlocked and buy_book_link is true", async () => {
	props.breakpoint = 30;
	props.resultData.content_form = "MI";
	props.resultData.is_unlocked = true;
	props.resultData.buy_book_link = true;
	userData = null;
	const item = shallow(<TitleSection {...props} />);
	expect(item.find("LockBook").length).toBe(0);
	expect(item.find("CreateCopyForm").length).toBe(1);
	expect(item.find("BuyBook").length).toBe(1);
	expect(item.find("BuyBook").text()).toBe("Subscribe to this magazine");
	expect(item.find("BuyBook").props().className).toBe("ga-subscribe-magazine-unlocked btn");
	expect(item.find("MobBuyBook").length).toBe(0);
});

test("When magazine is locked and buy_book_link is true", async () => {
	props.breakpoint = 30;
	props.resultData.content_form = "MI";
	props.resultData.is_unlocked = false;
	props.resultData.buy_book_link = true;
	userData = null;
	const item = shallow(<TitleSection {...props} />);
	expect(item.find("LockBook").length).toBe(1);
	expect(item.find("CreateCopyForm").length).toBe(0);
	expect(item.find("BuyBook").length).toBe(1);
	expect(item.find("BuyBook").text()).toBe("Subscribe to this magazine");
	expect(item.find("BuyBook").props().className).toBe("ga-subscribe-magazine-locked btn");
	expect(item.find("MobBuyBook").length).toBe(0);
});

test("When magazine is unlocked and buy_book_link is false", async () => {
	props.breakpoint = 30;
	props.resultData.content_form = "MI";
	props.resultData.is_unlocked = true;
	props.resultData.buy_book_link = false;
	userData = null;
	const item = shallow(<TitleSection {...props} />);
	expect(item.find("LockBook").length).toBe(0);
	expect(item.find("CreateCopyForm").length).toBe(1);
	expect(item.find("BuyBook").length).toBe(1);
	expect(item.find("BuyBook").text()).toBe("Subscribe to this magazine");
	expect(item.find("BuyBook").props().className).toBe("btn");
	expect(item.find("MobBuyBook").length).toBe(0);
});

test("When magazine is locked and buy_book_link is false", async () => {
	props.breakpoint = 30;
	props.resultData.content_form = "MI";
	props.resultData.is_unlocked = false;
	props.resultData.buy_book_link = false;
	userData = null;
	const item = shallow(<TitleSection {...props} />);
	expect(item.find("LockBook").length).toBe(1);
	expect(item.find("CreateCopyForm").length).toBe(0);
	expect(item.find("BuyBook").length).toBe(1);
	expect(item.find("BuyBook").text()).toBe("Subscribe to this magazine");
	expect(item.find("BuyBook").props().className).toBe("btn");
	expect(item.find("MobBuyBook").length).toBe(0);
});

test("When book is unlocked and user click on buy book link", async () => {
	props.resultData.is_unlocked = true;
	props.resultData.content_form = "BO";
	const item = shallow(<TitleSection {...props} />);
	expect(item.find("LockBook").length).toBe(0);
	expect(item.find("CreateCopyForm").length).toBe(1);
	const buyBookLinkButton = item.find("BuyBook");
	expect(buyBookLinkButton.length).toBe(1);
	expect(buyBookLinkButton.text()).toBe("Buy this book");
	expect(item.find("MobBuyBook").length).toBe(0);

	buyBookLinkButton.simulate("click", {
		preventDefault: () => {},
	});
	expect(mockGoogleEventIsCalled).toEqual(true);
});

test("When book is locked and user click on buy book link", async () => {
	props.resultData.is_unlocked = false;
	props.resultData.content_form = "BO";
	const item = shallow(<TitleSection {...props} />);
	expect(item.find("LockBook").length).toBe(1);
	expect(item.find("CreateCopyForm").length).toBe(0);
	const buyBookLinkButton = item.find("BuyBook");
	expect(buyBookLinkButton.length).toBe(1);
	expect(buyBookLinkButton.text()).toBe("Buy this book");
	expect(item.find("MobBuyBook").length).toBe(0);

	buyBookLinkButton.simulate("click", {
		preventDefault: () => {},
	});
	expect(mockGoogleEventIsCalled).toEqual(true);
});

test("When Book lock and asset's publisher allow to temporary unlock book then user seen link for temporary unlock asset", async () => {
	props.resultData.is_unlocked = false;
	props.resultData.temp_unlock_opt_in = true;
	props.resultData.content_form = "BO";
	const item = shallow(<TitleSection {...props} />);
	expect(item.find("LockBook").text()).toBe(
		"This book is currently locked. If your institution has a copy, you can unlock it.What if you don't have the book with you?"
	);
});

test(`When asset does not have cover image`, async () => {
	const item = shallow(<TitleSection {...props} />);
	item.find("AssetTitleImage").simulate("error");
	expect(isCalledSetDefaultCoverImage).toBeTruthy();
});
