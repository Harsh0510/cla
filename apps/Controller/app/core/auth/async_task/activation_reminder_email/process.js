const sendEmail = require("../../../../common/sendEmail");
const emailSender = require("./emailSender");
const getUrl = require("../../../../common/getUrl");
const getInsertQueryObject = require(`../../../../common/getInsertQueryObject`);
const { activationReminderEmailCategory, activationTokenExpiryLimitInDays, userStatus } = require("../../../../common/staticValues");

const SEND_EMAIL_INTERVAL_DAYS = 4; // must be a positive integer
const MAX_REMINDERS_SENT = 3; // 3 reminders, so sent at roughly 4, 8 and 12 days
const SECONDS_IN_DAY = 24 * 60 * 60;

const shouldSendReminderA = () => {
	return Math.random() < 0.5;
};

const SEND_EMAIL_INTERVAL_SECONDS = SEND_EMAIL_INTERVAL_DAYS * SECONDS_IN_DAY;

module.exports = async function (querier) {
	const userData = await querier(
		`
			UPDATE
				cla_user
			SET
				activation_token = encode(gen_random_bytes(18), 'hex'),
				activation_token_expiry = NOW() + INTERVAL '${activationTokenExpiryLimitInDays} days',
				date_last_registration_activity = NOW(),
				date_edited = NOW(),
				date_last_activation_reminder_sent = NOW()
			FROM
				cla_user old_tbl
			WHERE
				cla_user.id = old_tbl.id
				AND cla_user.status = $1
				AND cla_user.password_hash IS NULL
				AND COALESCE(cla_user.date_last_activation_reminder_sent, cla_user.date_last_activation_token_set) + INTERVAL '${
					SEND_EMAIL_INTERVAL_SECONDS + 600 /* 10 minute grace period */
				} seconds' <= NOW()
				AND cla_user.date_last_activation_token_set + INTERVAL '${SEND_EMAIL_INTERVAL_SECONDS} seconds' <= NOW()
				AND cla_user.date_last_activation_token_set + INTERVAL '${
					SEND_EMAIL_INTERVAL_SECONDS * (MAX_REMINDERS_SENT + 1) - SECONDS_IN_DAY * 0.5
				} seconds' > NOW()
			RETURNING
				cla_user.id AS id,
				cla_user.email AS email,
				cla_user.last_name AS last_name,
				cla_user.title AS title,
				FLOOR(EXTRACT(EPOCH FROM (NOW() - old_tbl.date_last_activation_token_set)) / ${SEND_EMAIL_INTERVAL_SECONDS}) AS reminder_email_index,
				cla_user.activation_token AS activation_token
		`,
		[userStatus.approved]
	);

	if (!userData.rowCount) {
		return;
	}

	const userSendEmailLogs = [];

	for (const user of userData.rows) {
		const sendEmailLog = {
			invite_email_type: "",
			user_id: user.id,
		};
		const url = getUrl(`/auth/activate/${user.activation_token}`);

		if (user.reminder_email_index <= 1) {
			// send the first reminder email
			if (shouldSendReminderA()) {
				sendEmailLog.invite_email_type = activationReminderEmailCategory.reminder1A;
				emailSender.firstEmailReminderA(sendEmail, user.email, user.title, user.last_name, url);
			} else {
				sendEmailLog.invite_email_type = activationReminderEmailCategory.reminder1B;
				emailSender.firstEmailReminderB(sendEmail, user.email, user.title, user.last_name, url);
			}
		} else if (user.reminder_email_index === 2) {
			// send the second reminder email
			if (shouldSendReminderA()) {
				sendEmailLog.invite_email_type = activationReminderEmailCategory.reminder2A;
				emailSender.secondEmailReminderA(sendEmail, user.email, user.title, user.last_name, url);
			} else {
				sendEmailLog.invite_email_type = activationReminderEmailCategory.reminder2B;
				emailSender.secondEmailReminderB(sendEmail, user.email, user.title, user.last_name, url);
			}
		} else {
			// send the third reminder email (and fourth, fifth, etc. emails - if MAX_REMINDERS_SENT > 3)
			if (shouldSendReminderA()) {
				sendEmailLog.invite_email_type = activationReminderEmailCategory.reminder3A;
				emailSender.thirdEmailReminderA(sendEmail, user.email, user.title, user.last_name);
			} else {
				sendEmailLog.invite_email_type = activationReminderEmailCategory.reminder3B;
				emailSender.thirdEmailReminderB(sendEmail, user.email, user.title, user.last_name);
			}
		}
		userSendEmailLogs.push(sendEmailLog);
	}

	await querier(getInsertQueryObject("activation_reminder_email_send_log", ["user_id", "invite_email_type"], userSendEmailLogs));
};
