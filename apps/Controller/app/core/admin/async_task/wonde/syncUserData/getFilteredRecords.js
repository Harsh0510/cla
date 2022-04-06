const shouldKeepRecord = (excludedWondeIdentifiers, record) => {
	if (excludedWondeIdentifiers.has(record.id)) {
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
			wonde_user_block
	`)
		).rows.map((r) => r.id)
	);
};

module.exports = {
	getFilteredRecords,
	getExcludedWondeIdentifiers,
};
