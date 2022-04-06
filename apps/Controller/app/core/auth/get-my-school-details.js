const blockedFields = require("../../common/wonde/schoolUpdatableFields");

/**
 * Get all school details for a particular admin
 */
module.exports = async function (params, ctx) {
	const userRole = await ctx.getUserRole();
	const sessionData = await ctx.getSessionData();

	// Throw an error if non admins attempt to access this endpoint
	ctx.assert(userRole === "cla-admin" || userRole === "school-admin", 401, "Unauthorized");

	const result = await ctx.appDbQuery(
		`
		SELECT
			name AS name,
			address1 AS address1,
			address2 AS address2,
			city AS city,
			post_code AS post_code,
			country_iso2 AS country,
			local_authority AS local_authority,
			school_level AS school_level,
			school_home_page AS school_home_page,
			number_of_students AS number_of_students,
			wonde_identifier IS NULL AS can_edit_blocked_fields
		FROM
			school
		WHERE
			id = $1
		LIMIT 1
	`,
		[sessionData.school_id]
	);
	return {
		result: result.rows,
		blocked_fields: blockedFields,
	};
};
