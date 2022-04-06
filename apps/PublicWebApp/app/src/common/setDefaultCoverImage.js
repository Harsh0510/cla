const DEFAULT_COVER_IMAGE = require("../../src/assets/images/cover_img.png");

export default function (event) {
	event.target.src = DEFAULT_COVER_IMAGE;
}
