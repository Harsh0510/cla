const pardot = require("./pardot");

module.exports = async function (ctx, emailAddress) {
	if (!process.env.CLA_PARDOT_API_PRIVATE_KEY) {
		return;
	}
	let prospect = await pardot.getProspect(emailAddress);
	if (!prospect) {
		const userDetails = await ctx.appDbQuery(
			`
				SELECT
					cla_user.first_name as first_name,
					cla_user.last_name as last_name,
					school.identifier AS school_identifier,
					school.name AS school_name,
					cla_user.job_title AS job_title
				FROM
					cla_user
					INNER JOIN school
						ON cla_user.school_id = school.id
				WHERE
					cla_user.email = $1
			`,
			[emailAddress]
		);
		if (userDetails.rowCount !== 1) {
			return;
		}
		const deets = userDetails.rows[0];
		deets.email = emailAddress;
		prospect = await pardot.addProspect(deets);
		if (!prospect) {
			return;
		}
	}
	const result = await ctx.appDbQuery(
		`
			UPDATE
				cla_user
			SET
				pardot_prospect_identifier = $1,
				date_edited = NOW()
			WHERE
				email = $2
			RETURNING
				receive_marketing_emails
		`,
		[prospect.id, emailAddress]
	);
	if (result.rowCount !== 1) {
		return;
	}
	await pardot.upsertListMembership(prospect.id, process.env.CLA_PARDOT_API_LIST_MEMBERSHIP_ID, result.rows[0].receive_marketing_emails);
};
