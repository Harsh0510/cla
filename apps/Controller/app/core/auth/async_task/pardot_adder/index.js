const pardot = require(`../../../../common/pardot/pardot`);
const notificationChecker = require("./notificationChecker");

async function upsertToPardot(userDetails) {
	let prospect = await pardot.getProspect(userDetails.email);
	if (!prospect) {
		prospect = await pardot.addProspect(userDetails);
		if (!prospect) {
			prospect = await pardot.getProspect(userDetails.email);
			if (!prospect) {
				return 0;
			}
		}
	}
	await pardot.upsertListMembership(prospect.id, process.env.CLA_PARDOT_API_LIST_MEMBERSHIP_ID, userDetails.receive_marketing_emails);
	return prospect.id;
}

module.exports = async function (taskDetails) {
	try {
		if (!process.env.CLA_PARDOT_API_PRIVATE_KEY) {
			return;
		}
		const result = await taskDetails.query(
			`
				SELECT
					cla_user.id AS id,
					cla_user.first_name AS first_name,
					cla_user.last_name AS last_name,
					cla_user.email AS email,
					school.identifier AS school_identifier,
					school.name AS school_name,
					cla_user.job_title AS job_title,
					cla_user.receive_marketing_emails AS receive_marketing_emails
				FROM
					cla_user
					INNER JOIN school
						ON cla_user.school_id = school.id
				WHERE
					cla_user.role IN ('teacher', 'school-admin')
					AND cla_user.activation_token IS NULL
					AND cla_user.pardot_prospect_identifier = 0
				ORDER BY
					cla_user.id ASC
				LIMIT 5
			`
		);
		if (result.rowCount == 0) {
			return;
		}
		const prospectIds = [];
		for (const row of result.rows) {
			prospectIds.push(await upsertToPardot(row));
		}
		const queryValues = [];
		for (let i = 0, len = prospectIds.length; i < len; ++i) {
			queryValues.push(`(${result.rows[i].id}, ${prospectIds[i]})`);
		}
		await taskDetails.query(`
			UPDATE
				cla_user AS m
			SET
				pardot_prospect_identifier = c.pardot_prospect_identifier,
				date_edited = NOW()
			FROM
				(VALUES ${queryValues.join(", ")})
				AS c (id, pardot_prospect_identifier)
			WHERE
				c.id = m.id
		`);
	} finally {
		await taskDetails.deleteSelf();
		await notificationChecker(taskDetails);
	}
};
