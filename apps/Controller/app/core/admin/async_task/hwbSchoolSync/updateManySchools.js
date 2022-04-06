module.exports = async (querier, schools) => {
	if (!schools.length) {
		return;
	}
	const binds = [];
	const values = [];
	for (const school of schools) {
		values.push(`($${binds.push((school.name || "").trim())}, $${binds.push(school.dfeNumber)})`);
	}
	await querier(
		`
			UPDATE
				school
			SET
				hwb_identifier = v.hwb_identifier,
				date_edited = NOW()
			FROM
				(VALUES ${values.join(", ")})
				AS v(name, hwb_identifier)
			WHERE
				school.name = v.name
		`,
		binds
	);
};
