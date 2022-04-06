import setDefaultCoverImage from "../setDefaultCoverImage";

jest.mock("../../../src/assets/images/cover_img.png", () => {
	return "http://localhost:16000/c75fb6359a6a0e1da30ff4a336c6fef3.png";
});

test("Function renders successfully", () => {
	const event = {
		target: {
			src: "/not/image/on/this/path",
		},
	};
	setDefaultCoverImage(event);
	expect(event).toEqual({
		target: {
			src: "http://localhost:16000/c75fb6359a6a0e1da30ff4a336c6fef3.png",
		},
	});
});
