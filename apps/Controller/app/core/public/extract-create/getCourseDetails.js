module.exports = async (querier, courseOid, schoolId) => {
	const result = await querier(
		`
			SELECT
				course.id AS id,
				course.title AS title,
				school.academic_year_end_month AS academic_year_end_month,
				school.academic_year_end_day AS academic_year_end_day,
				school.name AS school_name
			FROM
				course
			INNER JOIN school
				ON course.school_id = school.id
			WHERE
				course.oid = $1
				AND course.school_id = $2
				AND course.archive_date IS NULL
		`,
		[courseOid, schoolId]
	);
	return result.rowCount ? result.rows[0] : null;
};
