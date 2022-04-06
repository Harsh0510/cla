const scotlandAreas = new Set(["AB", "DD", "KW", "DG", "KY", "EH", "ML", "FK", "PA", "G", "PH", "TD", "IV"]);
const walesAreas = new Set(["CF", "NP", "LD", "SA", "LL", "SY"]);
const northernIrelandAreas = new Set(["BT"]);
const isleOfManAreas = new Set(["IM"]);
const guernseyAreas = new Set(["GY"]);
const jerseyAreas = new Set(["JE"]);

const getTerritoryByPostcodeArea = (area) => {
	if (scotlandAreas.has(area)) {
		return "scotland";
	}
	if (walesAreas.has(area)) {
		return "wales";
	}
	if (northernIrelandAreas.has(area)) {
		return "northern-ireland";
	}
	if (isleOfManAreas.has(area)) {
		return "isle-of-man";
	}
	if (guernseyAreas.has(area)) {
		return "guernsey";
	}
	if (jerseyAreas.has(area)) {
		return "jersey";
	}
	return "england";
};

module.exports = (postcode) => {
	if (!postcode || typeof postcode !== "string") {
		return "england";
	}
	const parts = postcode.split(" ");
	if (parts.length !== 2) {
		return "england";
	}
	const match = parts[0].match(/^([a-zA-Z]+)[0-9]/);
	if (!match) {
		return "england";
	}
	return getTerritoryByPostcodeArea(match[1].toUpperCase());
};
