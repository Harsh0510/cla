const CLA_USER_STATUS_REGISTERED = "registered";

module.exports = async function getMapRegistrationCountBySchoolId(querier, fromDate) {
	const result = await querier(
		`
			SELECT
				school.id AS id,
				COUNT(cla_user.id) AS value
			FROM
				school
			INNER JOIN cla_user
				ON cla_user.school_id = school.id
			WHERE
				school.wonde_identifier IS NOT NULL
				AND school.wonde_approved = TRUE
				AND cla_user.date_transitioned_to_registered IS NOT NULL
				AND cla_user.date_transitioned_to_registered >= $1
				AND cla_user.status = $2
			GROUP BY
				school.id
		`,
		[fromDate, CLA_USER_STATUS_REGISTERED]
	);

	const mapRegistrationCountBySchoolId = Object.create(null);
	for (const school of result.rows) {
		mapRegistrationCountBySchoolId[school.id] = parseInt(school.value, 10);
	}
	return mapRegistrationCountBySchoolId;
};
