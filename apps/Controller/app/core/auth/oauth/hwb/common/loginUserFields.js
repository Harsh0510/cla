module.exports = `
	cla_user.id AS id,
	cla_user.role AS role,
	cla_user.email AS email,
	school.id AS school_id,
	school.academic_year_end_month AS academic_year_end_month,
	school.academic_year_end_day AS academic_year_end_day,
	cla_user.is_first_time_flyout_enabled AS flyout_enabled
`;
