require("./assets/fonts/stylesheet2.css");
require("./assets/css/fontawesome.min.css");
//require('./assets/defaults.css');
require("./assets/css/global.css");
require("./assets/css/custom.css");

// Needed for IE11 (https://www.npmjs.com/package/formdata-polyfill)
require("formdata-polyfill");
require("blueimp-canvas-to-blob");
require("./common/element-closest-polyfill");

import React from "react";
import ReactDOM from "react-dom";

import App from "./App";

window._claMainMouseButtonPressed = false;
window._claAtLeastOneTouchPressed = false;

document.addEventListener(
	"mousedown",
	(e) => {
		if (e.button === 0) {
			window._claMainMouseButtonPressed = true;
		}
	},
	false
);
document.addEventListener(
	"mouseup",
	(e) => {
		if (e.button === 0) {
			window._claMainMouseButtonPressed = false;
		}
	},
	false
);
document.addEventListener(
	"touchstart",
	(e) => {
		window._claAtLeastOneTouchPressed = true;
	},
	false
);
document.addEventListener(
	"touchend",
	(e) => {
		if (e.touches.length === 0) {
			window._claAtLeastOneTouchPressed = false;
		}
	},
	false
);

ReactDOM.render(<App />, document.getElementById("App"));
