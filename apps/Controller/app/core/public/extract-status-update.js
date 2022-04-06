const ensure = require("#tvf-ensure");
const { extractStatus } = require("../../common/staticValues");
const STATUS_ACTIVE = extractStatus.active;
const STATUS_EDITABLE = extractStatus.editable;

module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();
	const sessionData = await ctx.getSessionData();
	ensure.validIdentifier(ctx, params.oid, "oid");
	ctx.assert(sessionData.school_id, 401, "You must be associated with a school to create an extract");

	const result = await ctx.appDbQuery(
		`
			UPDATE
				extract
			SET
				status = $1,
				modified_by_user_id = $5,
				date_edited= NOW()
			WHERE
				oid = $2
				AND school_id = $3
				AND status = $4
				AND archive_date IS NULL
			RETURNING
				id
		`,
		[STATUS_ACTIVE, params.oid, sessionData.school_id, STATUS_EDITABLE, sessionData.user_id]
	);
	return {
		result: result.rowCount > 0,
	};
};
