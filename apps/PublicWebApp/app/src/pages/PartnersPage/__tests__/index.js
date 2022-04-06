// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";

import React from "react";
import { shallow } from "enzyme";
import Partners from "../index";

jest.mock("../images/Collins_logo_redband_485_RGB.jpg", () => mockPassthruHoc);
jest.mock("../images/Partner_10_CriticalPublishing.png", () => mockPassthruHoc);
jest.mock("../images/Partner_11_SearchPress.jpg", () => mockPassthruHoc);
jest.mock("../images/ylolfa.png", () => mockPassthruHoc);
jest.mock("../images/Partner_13_Hachette.png", () => mockPassthruHoc);
jest.mock("../images/cgp.png", () => mockPassthruHoc);
jest.mock("../images/Faber-Logo.png", () => mockPassthruHoc);
jest.mock("../images/pg-online-logo_blue.png", () => mockPassthruHoc);
jest.mock("../images/atebol.png", () => mockPassthruHoc);
jest.mock("../images/CrownHouse.png", () => mockPassthruHoc);
jest.mock("../images/Graffeg.png", () => mockPassthruHoc);
jest.mock("../images/Illuminate_logo.png", () => mockPassthruHoc);
jest.mock("../images/little_tiger_group.png", () => mockPassthruHoc);
jest.mock("../images/bsmall.jpg", () => mockPassthruHoc);
jest.mock("../images/MA_Education.png", () => mockPassthruHoc);
jest.mock("../images/barrington_stoke.png", () => mockPassthruHoc);
jest.mock("../images/john_catt.png", () => mockPassthruHoc);
jest.mock("../images/Tarquin.jpg", () => mockPassthruHoc);
jest.mock("../images/cpe_logo.png", () => mockPassthruHoc);
jest.mock("../images/springer_nature.png", () => mockPassthruHoc);
jest.mock("../images/random_house.png", () => mockPassthruHoc);
jest.mock("../images/linguascope.png", () => mockPassthruHoc);
jest.mock("../images/caa_cymru.png", () => mockPassthruHoc);
jest.mock("../images/brilliant_publications.jpg", () => mockPassthruHoc);
jest.mock("../images/gwasg_carreg_gwalch.png", () => mockPassthruHoc);
jest.mock("../images/rily.png", () => mockPassthruHoc);
jest.mock("../images/uwp.jpg", () => mockPassthruHoc);
jest.mock("../images/Kogan_Page.png", () => mockPassthruHoc);
jest.mock("../images/immediate_media.png", () => mockPassthruHoc);
jest.mock("../images/oxford_university_press.png", () => mockPassthruHoc);
jest.mock("../images/dc_logo.png", () => mockPassthruHoc);
jest.mock("../images/kitchen-chemistry.jpg", () => mockPassthruHoc);
jest.mock("../images/scholastic.png", () => mockPassthruHoc);
jest.mock("../images/spck.png", () => mockPassthruHoc);
jest.mock("../images/thames_hudson.png", () => mockPassthruHoc);
jest.mock("../images/wiley.png", () => mockPassthruHoc);
jest.mock("../images/red_robin_books.png", () => mockPassthruHoc);
jest.mock("../images/lco_cad_consultants.png", () => mockPassthruHoc);
jest.mock("../images/jessica_kingsley_publishers.png", () => mockPassthruHoc);
jest.mock("../images/future_publishing.png", () => mockPassthruHoc);
jest.mock("../images/family_links.png", () => mockPassthruHoc);
jest.mock("../images/amber.png", () => mockPassthruHoc);
jest.mock("../images/burleigh_dodds.png", () => mockPassthruHoc);
function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = shallow(<Partners />);
	expect(item.find("FormTitle h1").text().trim()).toEqual("Our Partners");
	expect(item.find("PartnerWrap").length).toEqual(50);
});

/** Component render with header description */
test("Component render with header description", async () => {
	const item = shallow(<Partners />);
	expect(item.find("FormTitle p").text()).toEqual("Access books from our partner publishers");
});

/** Component renders all images */
test("Component render with partners images", async () => {
	const item = shallow(<Partners />);
	expect(item.find("PartnerWrap").length).toBe(50);
});
