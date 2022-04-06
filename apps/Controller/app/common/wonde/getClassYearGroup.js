module.exports = (wondeClass) => {
	let ret = "Wonde class";
	if (!(wondeClass && wondeClass.students && Array.isArray(wondeClass.students.data))) {
		return ret;
	}
	const uniqueExplicitlyProvidedYears = new Set();
	const uniqueNiceNames = new Set();
	for (const student of wondeClass.students.data) {
		if (!student.year || !student.year.data) {
			continue;
		}
		let addedNiceName = false;
		const y = student.year.data;
		if (!addedNiceName && y.description) {
			const name = y.description
				.toString()
				.trim()
				.replace(/[\r\n\s\t]+/, " ");
			if (name) {
				uniqueNiceNames.add(name);
				addedNiceName = true;
			}
		}
		if (y.type === "YEAR" && y.name) {
			const name = y.name
				.toString()
				.trim()
				.replace(/[\r\n\s\t]+/, " ");
			if (name && !addedNiceName && name.match(/^[0-9]+$/)) {
				uniqueExplicitlyProvidedYears.add(name);
				uniqueNiceNames.add("Year " + name);
				addedNiceName = true;
			}
		}
	}
	if (uniqueNiceNames.size === 1) {
		ret = uniqueNiceNames.values().next().value;
	} else if (uniqueExplicitlyProvidedYears.size === 1) {
		ret = "Year " + uniqueExplicitlyProvidedYears.values().next().value;
	} else if (uniqueExplicitlyProvidedYears.size > 1) {
		const names = Array.from(uniqueExplicitlyProvidedYears).map((n) => parseInt(n, 10));
		names.sort((a, b) => a - b);
		const last = names.pop();
		ret = "Years " + names.join(", ") + " and " + last;
	} else if (uniqueNiceNames.size > 1) {
		ret = uniqueNiceNames.values().next().value;
	}
	return ret;
};
