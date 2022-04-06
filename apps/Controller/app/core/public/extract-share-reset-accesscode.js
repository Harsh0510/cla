const ensure = require("#tvf-ensure");
const generate_access_code = require("../../common/generate_access_code");
const { ensureCanCopy } = require("../auth/common/canCopy");
/**
 * Update the extract share reset access code
 * @param {object} params The request body
 * @param {object} ctx The context object
 */
module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();

	/** Throw an error if any user inputs are an empty string */
	ensure.validIdentifier(ctx, params.share_oid, "Share oid");

	const sessionData = await ctx.getSessionData();

	/** Ensure the user is part of a school */
	ctx.assert(sessionData.school_id, 401, "You must be associated with a school to deactivate this share link");

	await ensureCanCopy(ctx);

	const access_code = generate_access_code();
	await ctx.appDbQuery(
		`
			UPDATE
				extract_share
			SET
				access_code = $2,
				modified_by_user_id = $4,
				date_edited = NOW()
			FROM
				extract
			WHERE
				extract_share.oid = $1
				AND extract.id = extract_share.extract_id
				AND extract.school_id = $3
				AND extract.archive_date IS NULL
				AND extract_share.archive_date IS NULL
		`,
		[params.share_oid, access_code, sessionData.school_id, sessionData.user_id]
	);
	return {
		oid: params.share_oid,
	};
};
