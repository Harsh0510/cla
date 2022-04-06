const ensure = require("#tvf-ensure");

const nameDisplayPreference = require("../../common/nameDisplayPreference/sql");
const { ensureCanCopy } = require("../auth/common/canCopy");

/**
 * Get an array of share links for a particular extract
 * @param {object} params The request body
 * @param {object} ctx The context object
 */
module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();

	/** Throw an error if any user inputs are an empty string */
	ensure.nonEmptyStr(ctx, params.extract_oid, "extract_oid");

	await ensureCanCopy(ctx);

	/**
	 * Query the extract_share table get all share ids from extract id
	 */
	const result = await ctx.appDbQuery(
		`
			SELECT
				extract_share.oid AS oid,
				extract_share.date_created AS created,
				extract_share.date_edited AS edited,
				extract_share.date_expired AS revoked,
				extract_share.user_id AS user_id,
				extract_share.title AS title,
				${nameDisplayPreference.getFinal(`cla_user`)} AS teacher,
				extract_share.access_code AS access_code,
				extract_share.enable_extract_share_access_code AS enable_extract_share_access_code
			FROM
				extract_share
				LEFT JOIN cla_user
					ON extract_share.user_id = cla_user.id
				INNER JOIN extract
					ON extract.id = extract_share.extract_id
			WHERE
				extract.oid = $1 
				AND extract_share.date_expired >= NOW()
				AND extract.archive_date IS NULL
				AND extract_share.archive_date IS NULL
			ORDER BY
				extract_share.id DESC
		`,
		[params.extract_oid]
	);

	return {
		result: result.rows.length !== 0 ? result.rows : null,
	};
};
