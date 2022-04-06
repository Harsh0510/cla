const moment = require("moment");
const customTimeout = require("../../../../common/customSetTimeout");
const interval = require("./interval");
const { emailNotificationCategory } = require("../../../../common/staticValues");
const numEmailsPerRun = Math.ceil(interval / 1000); // 1 email every 1s

const wait = (ms) => new Promise((resolve) => customTimeout(resolve, ms));

module.exports = async (querier, rolloverJobId, targetExecutionDate, rolloverStatus, nextStatus, nextExecutionDate, emailSendFunc) => {
	const users = await querier(
		`
				SELECT
					cla_user.id AS id,
					cla_user.email AS email,
					cla_user.first_name AS first_name,
					(NOT ('{${emailNotificationCategory.rolloverEmail}}'::TEXT[] <@ cla_user.email_opt_out)) AS should_receive_email
				FROM
					cla_user
				INNER JOIN school
					ON cla_user.school_id = school.id
				WHERE
					school.rollover_job_id = $1
					AND cla_user.status = 'registered'
					AND cla_user.id NOT IN (
						SELECT
							user_id
						FROM
							rollover_progress
						WHERE
							rollover_job_id = $1
							AND status = $2
					)
				ORDER BY
					cla_user.id ASC
				LIMIT
					$3
			`,
		[rolloverJobId, rolloverStatus, numEmailsPerRun]
	);
	if (users.rowCount) {
		const m = moment(targetExecutionDate);
		const userIdsDone = [];
		for (const user of users.rows) {
			try {
				//When user enabled the "Receive emails with information about the end of the Licence year (“Rollover”) annually"
				if (user.should_receive_email) {
					await emailSendFunc(user.email, user.first_name, m);
				}
				userIdsDone.push(user.id);
			} catch (e) {
				console.error(rolloverJobId, rolloverStatus, e.stack, e.message, e);
			}
			await wait(200);
		}
		if (userIdsDone.length) {
			const binds = [];
			await querier(
				`
					INSERT INTO
						rollover_progress
						(
							rollover_job_id,
							status,
							user_id
						)
					VALUES
						${userIdsDone.map((id) => `(${rolloverJobId}, $${binds.push(rolloverStatus)}, ${id})`).join(", ")}
					ON CONFLICT
						DO NOTHING
				`,
				binds
			);
		}
	} else {
		await querier(
			`
				UPDATE
					rollover_job
				SET
					status = $1,
					next_execution_date = ${nextExecutionDate}
				WHERE
					id = $2
			`,
			[nextStatus, rolloverJobId]
		);
	}
};
