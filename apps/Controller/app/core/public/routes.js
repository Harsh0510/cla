const fs = require("fs");

let generateExtractViewUrls;

// This is required for the high quality previews to appear in development mode
if (process.env.NODE_ENV === "development" && fs.existsSync(__dirname + "/.key")) {
	process.env.AZURE_STORAGE_CONNECTION_STRING = fs
		.readFileSync(__dirname + "/.key")
		.toString()
		.trim();
}
if (process.env.AZURE_STORAGE_CONNECTION_STRING) {
	generateExtractViewUrls = require("./generateAzureExtractViewUrls");
} else {
	generateExtractViewUrls = require("./generateExtractViewUrls");
}
const extractCreate = require("./extract-create");
const extractUpdate = require("./extract-update");

const userAssetUpload = require("./user-asset-upload/index");

const extractViewOne = require("./extract-view-one");
const school_extract_limit_email_sender = require("./async_task/school_extract_limit_email_sender");

const pushExtractAccessSendEmailCheckerTask = require("./async_task/extract_access_email_sender/pushExtractAccessSendEmailCheckerTask");
const extractAccessSendEmailChecker = require("./async_task/extract_access_email_sender/extractAccessSendEmailChecker");

const pushAssetBuyBookLinkUpdateCheckerTask = require("./async_task/asset_buy_book_link_update/pushTask");
const assetBuyBookLinkUpdate = require("./async_task/asset_buy_book_link_update/index");

const pushAssetTempUnlockReminderEmailSenderCheckerTask = require("./async_task/asset_temp_unlock_reminder_email_sender/pushTask");
const assetTempUnlockReminderEmailSender = require("./async_task/asset_temp_unlock_reminder_email_sender/index");

const pushExractStatusUpdateCheckerTask = require("./async_task/extract_status_update/pushTask");
const exractStatusUpdate = require("./async_task/extract_status_update/index");

const pushAssetAvailableEmailLogCheckerTask = require("./async_task/asset_available_email_log/pushTask");
const assetAvailableEmailLog = require("./async_task/asset_available_email_log/index");

module.exports = async function (app, asyncRunner) {
	asyncRunner.route(`ExtractAccessSendEmailChecker`, extractAccessSendEmailChecker);
	await pushExtractAccessSendEmailCheckerTask(asyncRunner);
	asyncRunner.route(`AssetBuyBookLinkUpdate`, assetBuyBookLinkUpdate);
	await pushAssetBuyBookLinkUpdateCheckerTask(asyncRunner);
	asyncRunner.route(`assetTempUnlockReminderEmailSender`, assetTempUnlockReminderEmailSender);
	await pushAssetTempUnlockReminderEmailSenderCheckerTask(asyncRunner);
	asyncRunner.route(`ExractStatusUpdate`, exractStatusUpdate);
	await pushExractStatusUpdateCheckerTask(asyncRunner);
	asyncRunner.route(`AssetAvailableEmailLog`, assetAvailableEmailLog);
	await pushAssetAvailableEmailLogCheckerTask(asyncRunner);

	app.route("/public/asset-get-one", require("./asset-get-one"));
	app.route("/public/unlock", require("./unlock"));
	app.route("/public/course-get-one", require("./course-get-one"));
	app.route("/public/course-get-all-for-school", require("./course-get-all-for-school"));
	app.route("/public/course-create", require("./course-create"));
	app.route("/public/course-edit", require("./course-edit"));
	app.route("/public/course-delete", require("./course-delete"));
	app.route("/public/course-search", require("./course-search"));
	app.route("/public/extract-create", (params, ctx) => extractCreate(params, ctx, generateExtractViewUrls, asyncRunner));
	app.route("/public/extract-update", (params, ctx) => extractUpdate(params, ctx, generateExtractViewUrls, asyncRunner));
	app.route(`/public/extract-cancel`, require("./extract-cancel"));
	app.route("/public/extract-share-add", require("./extract-share-add"));
	app.route("/public/extract-share-deactivate", require("./extract-share-deactivate"));
	app.route("/public/extract-get-share-links", require("./extract-get-share-links"));
	app.route("/public/extract-search", require("./extract-search"));
	app.route("/public/extract-view-one", (params, ctx) => extractViewOne(params, ctx, generateExtractViewUrls));
	app.route("/public/get-extract-limits", require("./get-extract-limits"));
	app.route("/public/subjects-get-all", require("./subjects-get-all"));
	app.route("/public/extract-title-update", require("./extract-title-update"));
	app.route("/public/extract-status-update", require("./extract-status-update"));
	app.route("/public/extract-get-filters", require("./extract-get-filters"));
	app.route("/public/first-time-user-experience-get-mine-seen", require("./first-time-user-experience-get-mine-seen"));
	app.route("/public/first-time-user-experience-get-all-mine-seen", require("./first-time-user-experience-get-all-mine-seen"));
	app.route("/public/first-time-user-experience-update", require("./first-time-user-experience-update"));
	app.route("/public/extract-share-reset-accesscode", require("./extract-share-reset-accesscode"));
	app.route("/public/extract-note-get-all", require("./extract-note-get-all"));
	app.route("/public/extract-note-create", require("./extract-note-create"));
	app.route("/public/extract-note-delete", require("./extract-note-delete"));
	app.route("/public/extract-note-update", require("./extract-note-update"));
	app.route("/public/extract-page-join-get-all", require("./extract-page-join-get-all"));
	app.route("/public/extract-highlight-create", require("./extract-highlight-create"));
	app.route("/public/extract-highlight-update", require("./extract-highlight-update"));
	app.route("/public/extract-highlight-delete", require("./extract-highlight-delete"));
	app.route("/public/extract-highlight-get-all", require("./extract-highlight-get-all"));
	app.route("/public/extract-get-review-count", require("./extract-get-review-count"));
	app.route("/public/asset-favorite", require("./asset-favorite"));
	app.route("/public/extract-favorite", require("./extract-favorite"));
	app.route("/public/asset-favorite-delete-all", require("./asset-favorite-delete-all"));
	app.route("/public/asset-check-permissions", require("./asset-check-permissions"));
	app.route("/public/extract-favorite-delete-all", require("./extract-favorite-delete-all"));
	app.route("/public/carousel-slide-get-all", require("./carousel-slide-get-all"));
	app.route("/public/get-temp-unlocked-assets", require("./get-temp-unlocked-assets"));
	app.route("/public/sendgrid-event-delivery/webhook", require("./sendgrid-event-delivery"), {
		require_csrf_token: false,
		include_unparsed: true,
	});
	app.route(`/public/asset-get-metadata`, require(`./asset-get-metadata`));
	app.route(`/public/asset-processing-log-insert`, require(`./asset-processing-log-insert`));
	app.route("/public/extract-reactivate", require("./extract-reactivate"));
	app.route("/public/get-home-flyout-info", require("./get-home-flyout-info"));
	app.route("/public/asset-user-upload-get-all", require("./asset-user-upload-get-all"));
	app.route("/public/course-get-one-for-school", require("./course-get-one-for-school"));
	app.route(`/public/intent-to-copy-update`, require(`./intent-to-copy-update`));
	//called by asyncRunner
	asyncRunner.route("sendAssetAlertExtractLimit", school_extract_limit_email_sender);

	app.binaryRoute("/public/unlock-via-image-upload", require("./unlock-via-image-upload"));
	app.binaryRoute("/public/user-asset-upload", (params, ctx) => userAssetUpload(params, ctx, asyncRunner), {
		max_file_size: 32 * 1024 * 1024, // 32MB
	});

	// get Blog Posts
	app.route("/public/blog-post-get", require("./blog-post-get"));

	app.route("/public/ping", async () => ({ success: true }));
};
