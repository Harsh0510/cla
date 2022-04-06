const pardot = require(`../../../../common/pardot/pardot`);
const notificationChecker = require("./notificationChecker");

/**
 * @param {object} data
 * @param {number} data.pardot_prospect_identifier
 * @param {boolean} data.receive_marketing_emails
 * @returns {Promise<bool>} Whether the update was successful.
 */
async function updatePardotListMembership(data) {
	try {
		await pardot.upsertListMembership(data.pardot_prospect_identifier, process.env.CLA_PARDOT_API_LIST_MEMBERSHIP_ID, data.receive_marketing_emails);
		return true;
	} catch (e) {
		return false;
	}
}

module.exports = async function (taskDetails) {
	try {
		if (!process.env.CLA_PARDOT_API_PRIVATE_KEY) {
			return;
		}
		const toUpdate = await taskDetails.query(`
			SELECT
				cla_user.pardot_prospect_identifier AS pardot_prospect_identifier,
				cla_user.receive_marketing_emails AS receive_marketing_emails,
				cla_user.receive_marketing_emails_update_counter AS counter,
				cla_user.id AS user_id
			FROM
				cla_user
				LEFT JOIN user_recv_emails_pardot_log
					ON cla_user.id = user_recv_emails_pardot_log.user_id
			WHERE
				(cla_user.receive_marketing_emails_update_counter > 0)
				AND (
					(user_recv_emails_pardot_log.last_update_counter IS NULL)
					OR (cla_user.receive_marketing_emails_update_counter <> user_recv_emails_pardot_log.last_update_counter)
				)
				AND (cla_user.pardot_prospect_identifier > 0)
				AND (cla_user.password_hash IS NOT NULL)
			LIMIT 5
		`);
		if (toUpdate.rowCount === 0) {
			return;
		}
		const didUpdate = [];
		for (const row of toUpdate.rows) {
			didUpdate.push(await updatePardotListMembership(row));
		}
		const values = [];
		for (let i = 0, len = toUpdate.rows.length; i < len; ++i) {
			if (didUpdate[i]) {
				const row = toUpdate.rows[i];
				values.push(`(${row.user_id}, '${row.counter}')`);
			}
		}
		if (values.length) {
			await taskDetails.query(`
				INSERT INTO
					user_recv_emails_pardot_log
					(user_id, last_update_counter)
				VALUES
					${values.join(", ")}
				ON CONFLICT
					(user_id)
				DO UPDATE
					SET last_update_counter = EXCLUDED.last_update_counter
			`);
		}
	} finally {
		await taskDetails.deleteSelf();
		await notificationChecker(taskDetails);
	}
};
