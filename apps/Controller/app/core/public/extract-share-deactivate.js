const ensure = require("#tvf-ensure");
const { ensureCanCopy } = require("../auth/common/canCopy");

module.exports = async function (params, ctx) {
	ensure.validIdentifier(ctx, params.share_oid, "Share");

	await ctx.ensureLoggedIn();

	const sessionData = await ctx.getSessionData();

	/** Ensure the user is a teacher or school admin */
	if (sessionData.user_role !== "teacher" && sessionData.user_role !== "school-admin") {
		ctx.throw(401, "Unauthorized");
	}

	/** Ensure the user is part of a school */
	ctx.assert(sessionData.school_id, 401, "You must be associated with a school to deactivate this share link");

	await ensureCanCopy(ctx);

	await ctx.appDbQuery(
		`
			UPDATE
				extract_share
			SET
				date_expired = NOW() - interval '1 hour',
				modified_by_user_id = $2,
				date_edited = NOW()
			WHERE
				oid = $1
				AND archive_date IS NULL
		`,
		[params.share_oid, sessionData.user_id]
	);

	return {
		oid: params.share_oid,
	};
};
