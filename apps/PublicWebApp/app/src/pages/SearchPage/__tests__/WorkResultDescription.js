// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";
import React from "react";
import { shallow, mount } from "enzyme";
import WorkResultDescription from "../WorkResultDescription";
import MockSearchResults from "../../../mocks/MockSearchResults";

let props;

/**
 * Reset function
 */
function resetAll() {
	props = {
		asset: MockSearchResults.results[0],
		isMobile: false,
		isLoggedIn: true,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test("Render the component correctly for desktop", async () => {
	props.isMobile = false;
	props.asset.content_form = "BO";
	const item = shallow(<WorkResultDescription {...props} />);
	expect(item.find("WorkTitle").length).toBe(1);
	expect(item.find("SubTitleLink").length).toBe(1);
	expect(item.find('[name="BookAuthors"]').length).toBe(1);
	expect(item.find('[name="BookEditors"]').length).toBe(1);
	expect(item.find("WorkAdditionalData").length).toBe(1);
	expect(item.find("WrapSection").length).toBe(1);
});

test("Render the component correctly for mobile", async () => {
	props.isMobile = true;
	props.asset.content_form = "BO";
	const item = shallow(<WorkResultDescription {...props} />);
	//In mobile screen, not display the book title
	expect(item.find("SubTitleLink").length).toBe(1);
	expect(item.find('[name="BookAuthors"]').length).toBe(1);
	expect(item.find('[name="BookEditors"]').length).toBe(1);
	expect(item.find("WorkAdditionalData").length).toBe(1);
	expect(item.find("WrapSection").length).toBe(1);
});

test("User not getting the title in Mobile screen", async () => {
	props.isMobile = true;
	props.asset.content_form = "BO";
	const item = shallow(<WorkResultDescription {...props} />);
	//In mobile screen, not display the book title
	expect(item.find('[name="DesktopBookTitle"]').length).toBe(0);
	expect(item.find("SubTitleLink").length).toBe(1);
	expect(item.find('[name="BookAuthors"]').length).toBe(1);
	expect(item.find('[name="BookEditors"]').length).toBe(1);
	expect(item.find("WorkAdditionalData").length).toBe(1);
	expect(item.find("WrapSection").length).toBe(1);
});

/** Passs asset as null in props */
test("User not getting any value", async () => {
	props.asset = null;
	const item = shallow(<WorkResultDescription {...props} />);
	expect(item.debug()).toBe("");
	expect(item.find("WrapSection").length).toBe(0);
});

/** Passs authors as null in props */
test("User not getting any value", async () => {
	props.asset.authors = null;
	const item = shallow(<WorkResultDescription {...props} />);
	expect(item.debug()).not.toBe("");
	expect(item.find("WorkTitle").length).toBe(1);
	expect(item.find("SubTitleLink").length).toBe(1);
	expect(item.find('[name="BookAuthors"]').length).toBe(0);
	expect(item.find('[name="BookEditors"]').length).toBe(0);
	expect(item.find("WorkAdditionalData").length).toBe(1);
	expect(item.find("WrapSection").length).toBe(1);
});

test(`When Book don't have publication_date`, async () => {
	props.asset.publication_date = null;
	const item = shallow(<WorkResultDescription {...props} />);
	expect(item.find("WorkAdditionalData").text()).toEqual("publisher 1.  2nd Edition.");
});

test(`When Book edition is not graeter than 1`, async () => {
	props.asset.edition = 1;
	const item = shallow(<WorkResultDescription {...props} />);
	expect(item.find("WorkAdditionalData").text()).toEqual("publisher 1.  ");
});

test(`User not getting the Editors and Authors in Mobile screen`, async () => {
	props.isMobile = true;
	props.asset.content_form = "MI";
	const item = shallow(<WorkResultDescription {...props} />);
	//In mobile screen, not display the book title
	expect(item.find('[name="DesktopBookTitle"]').length).toBe(0);
	expect(item.find("SubTitleLink").length).toBe(1);
	expect(item.find('[name="BookAuthors"]').length).toBe(0);
	expect(item.find('[name="BookEditors"]').length).toBe(0);
	expect(item.find("WorkAdditionalData").length).toBe(1);
	expect(item.find("WrapSection").length).toBe(1);
});

test(`User not getting the Editors and Authors in Mobile screen`, async () => {
	props.isMobile = true;
	props.asset.content_form = "MI";
	const item = shallow(<WorkResultDescription {...props} />);
	//In mobile screen, not display the book title
	expect(item.find('[name="DesktopBookTitle"]').length).toBe(0);
	expect(item.find("SubTitleLink").length).toBe(1);
	expect(item.find('[name="BookAuthors"]').length).toBe(0);
	expect(item.find('[name="BookEditors"]').length).toBe(0);
	expect(item.find("WorkAdditionalData").length).toBe(1);
	expect(item.find("WrapSection").length).toBe(1);
});

test(`User not seen the unlock with tick icon for unlocked asset`, async () => {
	props.isMobile = false;
	props.asset.content_form = "MI";
	props.asset.is_unlocked = false;
	props.asset.auto_unlocked = false;
	const item = shallow(<WorkResultDescription {...props} />);
	//In mobile screen, not display the book title
	expect(item.find('[name="DesktopBookTitle"]').length).toBe(0);
	expect(item.find("SubTitleLink").length).toBe(1);
	expect(item.find('[name="BookAuthors"]').length).toBe(0);
	expect(item.find('[name="BookEditors"]').length).toBe(0);
	expect(item.find("WorkAdditionalData").length).toBe(1);
	expect(item.find("WrapSection").length).toBe(1);
	expect(item.find("IconSection").length).toBe(0);
	expect(item.find("ContentSection").length).toBe(1);
});

test(`User see full circle icon for desktop screen if the asset has full copy access`, async () => {
	props.asset.can_copy_in_full = true;
	const item = shallow(<WorkResultDescription {...props} />);
	expect(item.find("IconSection").length).toBe(1);
});

test(`User can not see full circle icon if the asset has full copy access and user is not logged in`, async () => {
	props.isLoggedIn = false;
	props.asset.can_copy_in_full = true;
	const item = shallow(<WorkResultDescription {...props} />);
	expect(item.find("IconSection").length).toBe(0);
});

test(`User see full circle icon and unlock with tick icon for desktop screen`, async () => {
	props.asset.is_unlocked = true;
	props.asset.auto_unlocked = true;
	props.asset.can_copy_in_full = true;
	const item = shallow(<WorkResultDescription {...props} />);
	expect(item.find("IconSection").length).toBe(2);
});

test(`User see full circle icon and unlock with tick icon on mobile screen`, async () => {
	props.isMobile = true;
	props.asset.is_unlocked = true;
	props.asset.auto_unlocked = true;
	props.asset.can_copy_in_full = true;
	const item = shallow(<WorkResultDescription {...props} />);
	expect(item.find("IconSection").length).toBe(2);
});
