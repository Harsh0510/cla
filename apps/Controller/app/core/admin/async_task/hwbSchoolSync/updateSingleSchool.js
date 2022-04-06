module.exports = async (querier, schoolHwbIdentifier, schoolName) => {
	const binds = [];
	await querier(
		`
			UPDATE
				school
			SET
				hwb_identifier = $${binds.push(schoolHwbIdentifier)},
				date_edited = NOW()
			WHERE
				id IN (
					SELECT
						id
					FROM
						school
					WHERE
						name = $${binds.push((schoolName || "").trim())}
					ORDER BY
						id ASC
					LIMIT 1
				)
		`,
		binds
	);
};
