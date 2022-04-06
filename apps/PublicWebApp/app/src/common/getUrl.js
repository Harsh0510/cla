import customWindowOrigin from "./customWindowOrigin";

let origin,
	windowOrigin = customWindowOrigin();
if (windowOrigin) {
	origin = windowOrigin;
} else {
	origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "");
}

export default function (suffix) {
	let base = origin;
	if (typeof suffix === "string") {
		return base + suffix;
	}
	return base;
}
