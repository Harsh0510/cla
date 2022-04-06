const maxmind = require("maxmind");
const path = require("path");

let reader = null;
let lastOpenedTimestampMs = 0;

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const pathsToTry = [path.join(__dirname, "../GeoLite2-Country.mmdb"), path.join(__dirname, "../GeoLite2-Country.tmpl.mmdb")];

module.exports = async function () {
	if (!reader || lastOpenedTimestampMs + ONE_DAY_MS < Date.now()) {
		let db = null;
		for (const p of pathsToTry) {
			try {
				db = await maxmind.open(p);
			} catch (e) {}
			if (db) {
				console.log("Using maxmind db: " + p);
				break;
			}
		}
		if (!db) {
			throw new Error("could not open maxmind db");
		}
		reader = db;
		lastOpenedTimestampMs = Date.now();
	}
	return reader;
};
