export default function () {
	let prefixes = " -webkit- -moz- -o- -ms- ".split(" ");
	let mq = function (query) {
		return window.matchMedia(query).matches;
	};
	if ("ontouchstart" in window || (window.DocumentTouch && document instanceof DocumentTouch)) {
		return true;
	}
	let query = ["(", prefixes.join("touch-enabled),("), "heartz", ")"].join("");
	return mq(query);
}
