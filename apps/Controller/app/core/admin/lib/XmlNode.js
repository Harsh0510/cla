const cssSelect = require("css-select");

cssSelect.filters["starts-with"] = function (next, text, options) {
	var adapter = options.adapter;

	return function startsWith(elem) {
		return next(elem) && adapter.getText(elem).indexOf(text) == 0;
	};
};

cssSelect.filters["equals"] = function (next, text, options) {
	var adapter = options.adapter;

	return function equals(elem) {
		return next(elem) && adapter.getText(elem) == text;
	};
};

cssSelect.filters["matches2"] = function (next, text, options) {
	var adapter = options.adapter;

	const decoded = Buffer.from(text, "hex").toString("utf8");
	const regex = new RegExp(decoded);

	return function matches2(elem) {
		return next(elem) && regex.test(adapter.getText(elem));
	};
};

class XmlNode {
	query(selector) {
		return cssSelect.selectAll(selector, this, { xmlMode: true });
	}
	queryAsRoot(selector) {
		const oldParent = this.parent;
		delete this.parent;
		const ret = this.query(selector);
		this.parent = oldParent;
		return ret;
	}
	queryOne(selector) {
		return cssSelect.selectOne(selector, this, { xmlMode: true });
	}
	queryOneAsRoot(selector) {
		const oldParent = this.parent;
		delete this.parent;
		const ret = this.queryOne(selector);
		this.parent = oldParent;
		return ret;
	}
	containsOnlyText() {
		if (this.type !== "tag") {
			return false;
		}
		if (this.children.length > 1) {
			return false;
		}
		if (this.children.length == 0) {
			return true;
		}
		const child = this.children[0];
		if (child.type !== "text") {
			return false;
		}
		return true;
	}
	getInnerText() {
		if (this.type !== "tag") {
			return null;
		}
		if (this.children.length > 1) {
			return null;
		}
		if (this.children.length == 0) {
			return null;
		}
		const child = this.children[0];
		if (child.type !== "text") {
			return null;
		}
		return child.data;
	}
	getInnerXml() {
		let text = "";
		for (const child of this.children) {
			if (child.type === "text") {
				text += child.data;
			} else {
				const atts = [];
				for (const key in child.attribs) {
					if (child.attribs.hasOwnProperty(key)) {
						atts.push(XmlNode.escapeXml(key) + '="' + XmlNode.escapeXml(child.attribs[key]) + '"');
					}
				}
				let attsString = atts.length ? " " + atts.join(" ") : "";
				if (child.isSelfClosing) {
					text += "<" + child.name + attsString + " />";
				} else {
					text += "<" + child.name + attsString + ">";
					text += child.getInnerXml();
					text += "</" + child.name + ">";
				}
			}
		}
		return text;
	}
	getOuterXml() {
		let text = "";
		const atts = [];
		for (const key in this.attribs) {
			if (this.attribs.hasOwnProperty(key)) {
				atts.push(XmlNode.escapeXml(key) + '="' + XmlNode.escapeXml(this.attribs[key]) + '"');
			}
		}
		let attsString = atts.length ? " " + atts.join(" ") : "";
		if (this.isSelfClosing) {
			text += "<" + this.name + attsString + " />";
		} else {
			text += "<" + this.name + attsString + ">";
			text += this.getInnerXml();
			text += "</" + this.name + ">";
		}
		return text;
	}
}

/**
 * @brief Safely XML escape a string.
 */
XmlNode.escapeXml = (function () {
	const escapeMap = Object.create(null);
	escapeMap[">"] = "&gt;";
	escapeMap["<"] = "&lt;";
	escapeMap["'"] = "&apos;";
	escapeMap['"'] = "&quot;";
	escapeMap["&"] = "&amp;";

	function escaper(item) {
		return escapeMap[item];
	}

	return function (str) {
		if (typeof str !== "string") {
			return "";
		}
		return str.replace(/[><'"&]/g, escaper);
	};
})();

module.exports = XmlNode;
