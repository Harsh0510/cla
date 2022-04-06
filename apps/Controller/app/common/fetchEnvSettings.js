module.exports = async (querier, keys) => {
	const wasString = typeof keys === "string";
	if (typeof keys === "string") {
		keys = [keys];
	}
	const binds = [];
	const values = [];
	for (const key of keys) {
		values.push("$" + binds.push(key));
	}
	const result = await querier(
		`
			SELECT
				key,
				value
			FROM
				env_setting
			WHERE
				key IN (${values.join(", ")})
		`,
		binds
	);
	if (!result.rowCount) {
		return null;
	}
	if (wasString) {
		return result.rows[0].value;
	}
	const ret = Object.create(null);
	for (const row of result.rows) {
		if (row.value && typeof row.value._value !== "undefined") {
			ret[row.key] = row.value._value;
		} else {
			ret[row.key] = row.value;
		}
	}
	return ret;
};
