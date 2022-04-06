const ensure = require("#tvf-ensure");
const { unlockAttemptStatus } = require("../../common/staticValues");

module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();
	const sessionData = await ctx.getSessionData();

	ensure.validIdentifier(ctx, params.oid, "OID");
	if (params.hasOwnProperty("notification_oid")) {
		ensure.validIdentifier(ctx, params.notification_oid, "Notification OID");
	}
	const intentToCopy = !!params.intent;
	const result = await ctx.appDbQuery(
		`
			UPDATE
				unlock_attempt
			SET
				intent_to_copy = $1,
				date_edited = NOW(),
				modified_by_user_id = $3
			WHERE
				oid = $2
				AND intent_to_copy IS NULL
				AND (status = '${unlockAttemptStatus.doesNotExist}' OR status = '${unlockAttemptStatus.publisherRestricted}')
			RETURNING
				id
		`,
		[intentToCopy, params.oid, sessionData.user_id]
	);
	if (result.rowCount && params.notification_oid) {
		await ctx.appDbQuery(
			`
				UPDATE
					notification
				SET
					link = jsonb_set(COALESCE(link, '{}'::jsonb), '{has_replied}', 'true')
				WHERE
					oid = $1
			`,
			[params.notification_oid]
		);
	}
	return {
		updated: result.rowCount > 0,
	};
};
