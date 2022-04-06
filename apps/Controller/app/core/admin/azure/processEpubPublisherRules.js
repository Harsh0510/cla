/**
 * @todo Update worker-lib.js to use this file.
 * We should generate a JS file from the rules in the adjacent
 * `epub_publisher_rules.txt` file, and embed that into the
 * `worker-lib.js` file.
 */

const fs = require("fs");

const maybeSplitObject = (obj, key = "name") => {
	const value = obj[key];
	const parts = value.split(/\s+OR\s+/g);
	const ret = [];
	for (const part of parts) {
		ret.push({ ...obj, [key]: part.trim() });
	}
	return ret;
};

const parseRules = (str) => {
	const lines = str.split(/[\r\n]+/gim);
	const rules = [];
	let currPublisher;
	let currImprint;
	let currAspect;
	for (const line of lines) {
		const text = line.trimEnd();
		if (!text) {
			continue;
		}
		if (text[0] === "#") {
			// comment
			continue;
		}
		const numTabs = text.match(/^\t*/)[0];
		if (numTabs.length === 0) {
			if (currAspect) {
				currImprint.aspects.push(currAspect);
			}
			currAspect = null;
			if (currImprint) {
				currPublisher.imprints.push(...maybeSplitObject(currImprint));
			}
			currImprint = null;
			if (currPublisher) {
				rules.push(...maybeSplitObject(currPublisher));
			}
			currPublisher = {
				name: text.trim(),
				imprints: [],
			};
		} else if (numTabs.length === 1) {
			// new imprint
			if (currAspect) {
				currImprint.aspects.push(currAspect);
			}
			currAspect = null;
			if (currImprint) {
				currPublisher.imprints.push(...maybeSplitObject(currImprint));
			}
			currImprint = {
				name: text.trim(),
				aspects: [],
			};
		} else if (numTabs.length === 2) {
			// new aspect ratio
			if (currAspect) {
				currImprint.aspects.push(currAspect);
			}
			const textTrim = text.trim();
			let w;
			let h;
			if (textTrim === "<any>") {
				w = 0.0001;
				h = 9999;
			} else {
				const parts = textTrim.split("-");
				if (parts.length !== 2) {
					// error
				}
				w = parseFloat(parts[0].trim());
				if (!w || w < 0) {
					// error
				}
				h = parseFloat(parts[1].trim());
				if (!h || h < 0) {
					// error
				}
			}
			currAspect = {
				range: [w, h],
				props: {},
			};
		} else if (numTabs.length === 3) {
			// prop
			const parts = text.trim().split(/\s*=\s*/);
			if (parts.length !== 2) {
				// error
			}
			const name = parts[0].trim();
			const value = parts[1].trim();
			// check name
			if (name === "trimSize") {
				const parts = value.split("x");
				if (parts.length !== 2) {
					// error
				}
				const w = parseFloat(parts[0].trim());
				if (!w || w < 0) {
					// error
				}
				const h = parseFloat(parts[1].trim());
				if (!h || h < 0) {
					// error
				}
				currAspect.props.trimSize = [w, h];
			} else if (name === "fontSize") {
				const num = parseFloat(value);
				if (!num || num < 0) {
					// error
				}
				currAspect.props.fontSize = num;
			} else if (name === "margins") {
				const num = parseFloat(value);
				if (!num || num < 0) {
					// error
				}
				currAspect.props.margins = num;
			} else if (name === "lineHeight") {
				const num = parseFloat(value);
				if (!num || num < 0) {
					// error
				}
				currAspect.props.lineHeight = num;
			} else {
				// error
			}
		}
	}
	if (currAspect) {
		currImprint.aspects.push(currAspect);
	}
	if (currImprint) {
		currPublisher.imprints.push(...maybeSplitObject(currImprint));
	}
	if (currPublisher) {
		rules.push(...maybeSplitObject(currPublisher));
	}
	return rules;
};

const content = fs.readFileSync(__dirname + "/epub_publisher_rules.txt").toString();

const rules = parseRules(content);
const json = JSON.stringify(rules, null, "    ");
fs.writeFileSync(__dirname + "/out.json", json);
console.log(json);
