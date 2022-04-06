import React from "react";
import { shallow } from "enzyme";
import BlogPost from "../index";

/**
 * This 'HOC' does nothing but 'pass through' the provided component,
 * so it's not necessary to 'dive()' into rendered results,
 * and so it's possible to mock the 'api' function.
 **/
let MockData;

function mockPassthruHoc(WrappedComponent) {
	return WrappedComponent;
}

jest.mock("../../../common/withApiConsumer", () => mockPassthruHoc);

async function defaultApi(endpoint, data) {
	if (endpoint === "/public/blog-post-get") {
		return MockData.rows;
	}
	// This will be caught by the promise in the component
	throw new Error("should never be here");
}

/**
 * Reset function
 */
function resetAll() {
	MockData = {
		rows: [
			{
				id: 4,
				title: "Title4",
				author_name: "author4",
				date_created: "2020-01-04T00:00:00.000Z",
				image_relative_url: "/url4",
			},
		],
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Component renders correctly */
test("Test when blog posts are not found", async () => {
	const item = shallow(<BlogPost api={defaultApi} />);
	item.setState({ blogPosts: [] });
	expect(item.find("h2").length).toBe(1);
	expect(item.find("h2").text()).toEqual("About the Education Platform");
});

test("Blog posts renders Correctly", async () => {
	const item = shallow(<BlogPost api={defaultApi} />);
	item.setState({ blogPosts: MockData.rows });
	expect(item.find("WrapMoreBlogLink").length).toBe(1);
	expect(item.find("BlogPostCardContentLi").length).toBe(1);
	expect(item.find("BlogPostCardContentLiDate").length).toBe(1);
});

test("Test when component is not mounted", async () => {
	const item = shallow(<BlogPost api={defaultApi} />);
	item.instance()._isMounted = false;
	expect(item.find("h2").length).toBe(1);
	expect(item.find("h2").text()).toEqual("About the Education Platform");
});

test("test When Author is not found", async () => {
	process.env.EP_BLOG_URL = "https://occclaepblog.azurewebsites.net";
	const item = shallow(<BlogPost api={defaultApi} />);
	MockData.rows[0].author_name = null;
	item.setState({ blogPosts: MockData.rows });
	expect(item.find("BlogPostCardContentLi").length).toBe(0);
	expect(item.find("BlogPostCardContentLiDate").length).toBe(1);
});

test("Test when componentWillUnmounted", async () => {
	const item = shallow(<BlogPost api={defaultApi} />);
	item.instance().componentWillUnmount();
	expect(item.find("h2").length).toBe(1);
	expect(item.find("h2").text()).toEqual("About the Education Platform");
});

test("Test when isMounted is false", async () => {
	MockData = null;
	const item = shallow(<BlogPost api={defaultApi} />);
	item.instance()._isMounted = false;
	expect(item.find("h2").length).toBe(1);
	expect(item.find("h2").text()).toEqual("About the Education Platform");
});
