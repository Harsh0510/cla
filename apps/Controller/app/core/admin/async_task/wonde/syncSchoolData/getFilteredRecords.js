const allowedCountryValues = new Set(["United Kingdom", "Isle of Man"]);
const excludedSchoolLevels = new Set(["nursery"]);

const isValidUrn = (urn) => {
	if (!urn) {
		return false;
	}
	if (typeof urn !== "string" && typeof urn !== "number") {
		return false;
	}
	urn = parseInt(urn, 10);
	if (urn < 100000) {
		return false;
	}
	if (urn > 999999) {
		return false;
	}
	return true;
};

const shouldKeepRecord = (excludedWondeIdentifiers, record) => {
	if (excludedWondeIdentifiers.has(record.id)) {
		return false;
	}
	if (!allowedCountryValues.has(record.address_country_name)) {
		return false;
	}
	if (excludedSchoolLevels.has(record.school_level)) {
		return false;
	}
	if (!isValidUrn(record.urn)) {
		return false;
	}
	return true;
};

const getFilteredRecords = (excludedWondeIdentifiers, records) => {
	if (!records || !records.length) {
		return [];
	}
	const ret = [];
	for (const record of records) {
		if (shouldKeepRecord(excludedWondeIdentifiers, record)) {
			ret.push(record);
		}
	}
	return ret;
};

const getExcludedWondeIdentifiers = async (querier) => {
	return new Set(
		(
			await querier(`
		SELECT
			wonde_identifier AS id
		FROM
			wonde_school_block
	`)
		).rows.map((r) => r.id)
	);
};

module.exports = {
	getFilteredRecords,
	getExcludedWondeIdentifiers,
};
