const map = {
	"ALL THROUGH": "allthrough",
	PRIMARY: "primary",
	"MIDDLE DEEMED PRIMARY": "primary",
	SECONDARY: "secondary",
	"MIDDLE DEEMED SECONDARY": "secondary",
	NURSERY: "nursery",
	"16 PLUS": "post-16",
};

module.exports = (str) => {
	const ret = map[str];
	return ret ? ret : "other";
};
