const genPasswordHash = require("./common/genPasswordHash");

const oauthHwb = require("./oauth/hwb/routes");
const userGetAll = require("./user-get-all");
const userCreate = require("./user-create");
const userCreateBulk = require("./user-create-bulk");
const userUpdate = require("./user-update");
const userInitPasswordReset = require("./user-init-password-reset");
const userCompletePasswordReset = require("./user-complete-password-reset");
const register = require("./register");
const userApprove = require("./user-approve");
const userReject = require("./user-reject");
const userResendSetPassword = require("./user-resend-set-password");
const userResendRegistration = require("./user-resend-registration");
const login = require("./login");
const disableSecurityEmails = require("./disable-security-emails");
const getNotification = require("./get-notification");
const updateNotification = require("./update-notification");
const deleteNotification = require("./delete-notification");
const progressRegistration = require("./progress-registration");

const IS_PRODUCTION = require("../../common/isProduction");

let sendEmail = require("../../common/sendEmail");

const push_user_awaiting_approval_notification_checker = require("./async_task/user_awaiting_approval_notification/notificationChecker");
const push_user_not_created_copies_email_sender_checker = require("./async_task/user_not_created_copies_email_sender/pushTask");
const push_user_not_verified_email_sender_checker = require("./async_task/user_not_verified_email_sender/pushTask");
const push_user_not_unlocked_email_sender_checker = require("./async_task/user_not_unlocked_email_sender/pushTask");

const UserAwaitingApprovalNotification = require("./async_task/user_awaiting_approval_notification");
const UserNotCreateCopiesEmailSender = require("./async_task/user_not_created_copies_email_sender");
const UserNotVerifiedEmailSender = require("./async_task/user_not_verified_email_sender");
const UserNotUnlockedEmailSender = require("./async_task/user_not_unlocked_email_sender");

const pardotAdderPusher = require("./async_task/pardot_adder/notificationChecker");
const pardotAdderRoute = require("./async_task/pardot_adder/index");

const pardotMarketingEmailUpdaterPusher = require("./async_task/pardot_marketing_email_updater/notificationChecker");
const pardotMarketingEmailUpdaterRoute = require("./async_task/pardot_marketing_email_updater/index");

const activationEmailReminderPusher = require("./async_task/activation_reminder_email/pushTask");
const activationEmailReminderRoute = require("./async_task/activation_reminder_email/index");

module.exports = async function (app, asyncRunner) {
	asyncRunner.route("MaxmindDbUpdater", require("./async_task/maxmind_db_updater/index"));
	await require("./async_task/maxmind_db_updater/pushTask")(asyncRunner);

	asyncRunner.route(`UserAwaitingApprovalNotification`, UserAwaitingApprovalNotification);
	await push_user_awaiting_approval_notification_checker(asyncRunner);

	asyncRunner.route(`UserNotCreateCopiesEmailSender`, UserNotCreateCopiesEmailSender);
	await push_user_not_created_copies_email_sender_checker(asyncRunner);

	asyncRunner.route(`UserNotVerifiedEmailSender`, UserNotVerifiedEmailSender);
	await push_user_not_verified_email_sender_checker(asyncRunner);

	asyncRunner.route(`UserNotUnlockedEmailSender`, UserNotUnlockedEmailSender);
	await push_user_not_unlocked_email_sender_checker(asyncRunner);

	asyncRunner.route(`PardotAdder`, pardotAdderRoute);
	await pardotAdderPusher(asyncRunner);

	asyncRunner.route(`PardotMarketingEmailUpdater`, pardotMarketingEmailUpdaterRoute);
	await pardotMarketingEmailUpdaterPusher(asyncRunner);

	asyncRunner.route(`ActivationEmailReminder`, activationEmailReminderRoute);
	await activationEmailReminderPusher(asyncRunner);

	app.route("/auth/user-create", async (params, ctx) => {
		return await userCreate(params, ctx, sendEmail);
	});
	app.route("/auth/user-create-bulk", async (params, ctx) => {
		return await userCreateBulk(params, ctx, sendEmail);
	});
	app.route("/auth/user-update", async (params, ctx) => {
		return await userUpdate(params, ctx, sendEmail);
	});

	app.route("/auth/user-delete", require("./user-delete"));
	app.route("/auth/user-init-password-reset", async (params, ctx) => {
		return await userInitPasswordReset(params, ctx, sendEmail);
	});
	app.route("/auth/user-complete-password-reset", async (params, ctx) => {
		return await userCompletePasswordReset(params, ctx, genPasswordHash, sendEmail);
	});

	{
		// Endpoint: Login
		const allowedPasswordAlgorithms = Object.create(null);
		allowedPasswordAlgorithms.sha256 = true;

		app.route("/auth/login", async (params, ctx) => {
			return await login(params, ctx, allowedPasswordAlgorithms, sendEmail);
		});
	}
	app.route("/auth/logout", require("./logout"));
	app.route("/auth/verify", progressRegistration);
	app.route("/auth/approved-verify", progressRegistration);
	app.route("/auth/activate", progressRegistration);

	app.route("/auth/disable-security-emails", async (params, ctx) => {
		return await disableSecurityEmails(params, ctx);
	});

	app.route("/auth/get-notification-categories", require("./get-notification-categories"));
	app.route("/auth/get-my-disabled-notification-categories", require("./get-my-disabled-notification-categories"));
	app.route("/auth/get-my-details", require("./get-my-details"));
	app.route("/auth/update-my-details", require("./update-my-details"));
	app.route("/auth/user-confirm-email-change", require("./user-confirm-email-change"));
	app.route("/auth/user-get-filters", require("./user-get-filters"));
	app.route("/auth/user-get-all", async (params, ctx) => {
		return await userGetAll(params, ctx);
	});
	app.route("/auth/get-my-school-details", require("./get-my-school-details"));
	app.route("/auth/school-edit", require("./school-edit"));
	app.route("/auth/get-countries", require("./get-countries"));
	app.route("/auth/get-schools", require("./get-schools"));
	app.route("/auth/register", async (params, ctx) => {
		return await register(params, ctx, sendEmail, genPasswordHash);
	});
	app.route("/auth/user-resend-set-password", async (params, ctx) => {
		return await userResendSetPassword(params, ctx, sendEmail);
	});
	app.route("/auth/user-resend-registration", async (params, ctx) => {
		return await userResendRegistration(params, ctx, sendEmail);
	});
	app.route("/auth/user-approve", async (params, ctx) => {
		return await userApprove(params, ctx, sendEmail);
	});
	app.route("/auth/user-reject", async (params, ctx) => {
		return await userReject(params, ctx, sendEmail);
	});

	app.route("/auth/get-notification", async (params, ctx) => {
		return await getNotification(params, ctx);
	});
	app.route("/auth/update-notification", async (params, ctx) => {
		return await updateNotification(params, ctx);
	});
	app.route("/auth/delete-notification", async (params, ctx) => {
		return await deleteNotification(params, ctx);
	});
	app.route("/auth/get-is-domain-mapped-with-school", require("./get-is-domain-mapped-with-school"));
	app.route("/auth/user-get-uneditable-fields", require("./user-get-uneditable-fields"));
	app.route("/auth/notification-get-filters", require("./notification-get-filters"));
	if (!IS_PRODUCTION) {
		// Endpoint: Dev-only helper method that dumps the user and role tables.
		app.route("/auth/get-stuff", async (params, ctx) => {
			const pool = ctx.getAppDbPool();
			const [users, roles, schools] = (
				await Promise.all([pool.query("SELECT * FROM cla_user"), pool.query("SELECT * FROM cla_role"), pool.query("SELECT * FROM school")])
			).map((res) => res.rows);
			return {
				users,
				roles,
				schools,
			};
		});
	}
	await oauthHwb(app, asyncRunner);
};
