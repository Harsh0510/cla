const { canCopySql } = require("./common/canCopy");

/**
 * Fetch a user's details (assuming they're logged in - i.e. have a non-empty session).
 */
module.exports = async function (params, ctx) {
	ctx.doNotUpdateSessionExpiry = true;

	const sessData = await ctx.getSessionData();

	if (!sessData) {
		return {
			data: null,
		};
	}

	const userId = sessData.user_id;
	if (!userId) {
		return {
			data: null,
		};
	}

	const result = await ctx.appDbQuery(
		`
			SELECT
				cla_user.title AS title,
				cla_user.first_name AS first_name,
				cla_user.last_name AS last_name,
				cla_user.role AS role,
				cla_user.email AS email,
				cla_user.job_title AS job_title,
				cla_user.name_display_preference AS name_display_preference,
				school.academic_year_end_month AS academic_year_end_month,
				school.academic_year_end_day AS academic_year_end_day,
				school.name AS school,
				cla_user.receive_marketing_emails AS receive_marketing_emails,
				cla_user.is_first_time_flyout_enabled AS flyout_enabled,
				${canCopySql()} AS can_copy,
				cla_user.activation_token IS NULL AS has_verified,
				cla_user.date_created_initial_password AS date_created,
				(cla_user.trusted_domain_registered_with IS NOT NULL OR cla_user.registered_with_approved_domain) AS has_trial_extract_access,
				CASE WHEN (cla_user.source = 'hwb' AND cla_user.status <> 'registered') THEN jsonb_build_object(
					'type', cla_user.hwb_match_type,
					'target_value', cla_user.hwb_match_email,
					'verification_sent', cla_user.hwb_merge_token IS NOT NULL
				) ELSE NULL END AS requires_merge_confirmation,
				school.school_level = 'post-16' AS is_fe_user,
				cla_user.email_opt_out AS email_opt_out
			FROM
				cla_user
				LEFT JOIN school
					ON cla_user.school_id = school.id
			WHERE
				cla_user.id = $1
		`,
		[userId]
	);

	return {
		data: result.rows[0],
	};
};
