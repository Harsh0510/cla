const validate = require("./validate");
const validateAndUpsert = require("./validateAndUpsert");

const routes = {
	forceAsyncTick: require("./force-async-tick"),
};

const pushTask = {
	fakeExtractAccessPurger: require("./async_task/fakeExtractAccessPurger/pushTask"),
	hwbSchoolSync: require("./async_task/hwbSchoolSync/pushTask"),
	unlockAttemptLogGenerator: require("./async_task/unlockAttemptLogGenerator/pushTask"),
	cachedLatestBlogPosts: require("./async_task/cachedLatestBlogPosts/pushTask"),
	emailActivitySpreadsheetGenerator: require("./async_task/emailActivitySpreadsheetGenerator/pushTask"),
	syncWondeSchoolData: require("./async_task/wonde/syncSchoolData/pushTask"),
	syncWondeUserData: require("./async_task/wonde/syncUserData/pushTask"),
	syncWondeClassData: require("./async_task/wonde/syncClassData/pushTask"),
	rollover: require("./async_task/rollover/pushTask"),
};

const IS_PRODUCTION = require("../../common/isProduction");

module.exports = async function (app, asyncRunner) {
	await pushTask.fakeExtractAccessPurger(asyncRunner);
	await pushTask.hwbSchoolSync(asyncRunner);
	await pushTask.unlockAttemptLogGenerator(asyncRunner);
	await pushTask.cachedLatestBlogPosts(asyncRunner);
	await pushTask.emailActivitySpreadsheetGenerator(asyncRunner);
	await pushTask.syncWondeSchoolData(asyncRunner);
	await pushTask.syncWondeUserData(asyncRunner);
	await pushTask.syncWondeClassData(asyncRunner);
	await pushTask.rollover(asyncRunner);

	asyncRunner.route(`/admin/fakeExtractAccessPurger`, require("./async_task/fakeExtractAccessPurger/route"));
	asyncRunner.route(`/admin/hwbSchoolSync`, require("./async_task/hwbSchoolSync/route"));
	asyncRunner.route(`/admin/unlockAttemptLogGenerator`, require("./async_task/unlockAttemptLogGenerator/route"));
	asyncRunner.route(`/admin/cachedLatestBlogPosts`, require("./async_task/cachedLatestBlogPosts/route"));
	asyncRunner.route(`/admin/emailActivitySpreadsheetGenerator`, require("./async_task/emailActivitySpreadsheetGenerator/route"));
	asyncRunner.route(`/admin/syncWondeSchoolData`, require("./async_task/wonde/syncSchoolData/route"));
	asyncRunner.route(`/admin/syncWondeUserData`, require("./async_task/wonde/syncUserData/route"));
	asyncRunner.route(`/admin/syncWondeClassData`, require("./async_task/wonde/syncClassData/route"));
	asyncRunner.route(`/admin/rollover`, require("./async_task/rollover/route"));

	app.route(`/admin/add-dummy-extract-accesses`, require("./add-dummy-extract-accesses"));
	app.route(`/admin/force-async-tick`, (params, ctx) => routes.forceAsyncTick(params, ctx, asyncRunner));

	/**
	 * Does not insert anything into the database. This endpoint only validates.
	 **/
	app.binaryRoute("/admin/validate", validate, {
		max_file_size: 768 * 1024 * 1024,
	});

	app.binaryRoute("/admin/validate-and-upsert/phase-one", validateAndUpsert.upsertPhaseOne, {
		max_file_size: 64 * 1024 * 1024,
	});
	app.route("/admin/validate-and-upsert/phase-two", validateAndUpsert.upsertPhaseTwo);

	// Classes
	app.route("/admin/class-get-all", require("./class-get-all"));
	app.route("/admin/class-create", require("./class-create"));
	app.route("/admin/class-create-bulk", require("./class-create-bulk"));
	app.route("/admin/class-update", require("./class-update"));
	app.route("/admin/class-delete", require("./class-delete"));
	app.route("/admin/class-get-filters", require("./class-get-filters"));

	// Schools
	app.route("/admin/school-get-filters", require("./school-get-filters"));
	app.route("/admin/school-get-all", require("./school-get-all"));
	app.route("/admin/school-create", require("./school-create"));
	app.route("/admin/school-update", require("./school-update"));
	app.route("/admin/school-delete", require("./school-delete"));

	// Misc
	app.route("/admin/unlock-attempt-get-all", require("./unlock-attempt-get-all"));
	app.route("/admin/extract-access-get-all", require("./extract-access-get-all"));
	app.route("/admin/extract-expiry", require("./extract-expiry"));

	// Assets
	app.route("/admin/asset-get-all", require("./asset-get-all"));
	app.route("/admin/asset-update", require("./asset-update"));

	// Asset Groups
	app.route("/admin/asset-group-get-all", require("./asset-group-get-all"));
	app.route("/admin/asset-group-update", require("./asset-group-update"));

	// Imprints
	app.route("/admin/imprint-get-all", require("./imprint-get-all"));
	app.route("/admin/imprint-update", require("./imprint-update"));

	// Approved Domains
	app.route("/admin/approved-domain-get-all", require("./approved-domain-get-all"));
	app.route("/admin/approved-domain-create", require("./approved-domain-create"));
	app.route("/admin/approved-domain-update", require("./approved-domain-update"));
	app.route("/admin/approved-domain-delete", require("./approved-domain-delete"));

	// Trusted Domains
	app.route("/admin/trusted-domain-get-all", require("./trusted-domain-get-all"));
	app.route("/admin/trusted-domain-create", require("./trusted-domain-create"));
	app.route("/admin/trusted-domain-update", require("./trusted-domain-update"));
	app.route("/admin/trusted-domain-delete", require("./trusted-domain-delete"));

	// Unlock Bulk
	app.route("/admin/unlock-bulk", require("./unlock-bulk"));

	// Publisher
	app.route("/admin/publisher-get-all", require("./publisher-get-all"));
	app.route("/admin/publisher-update", require("./publisher-update"));

	// Unlock Book By Image Upload
	app.route(
		"/admin/unlock-image-upload-update",
		require("./unlock-image-upload-update")
		//require("./unlock-image-update-by-function")
	);

	//carousel-slide
	app.route("/admin/carousel-slide-get-all", require("./carousel-slide-get-all"));
	app.route("/admin/carousel-slide-create", require("./carousel-slide-create"));
	app.route("/admin/carousel-slide-update", require("./carousel-slide-update"));
	app.route("/admin/carousel-slide-delete", require("./carousel-slide-delete"));

	//for Processing log
	app.route("/admin/asset-processing-log-get-all", require("./asset-processing-log-get-all"));
	app.route("/admin/asset-processing-log-get-filters", require("./asset-processing-log-get-filters"));
	app.route("/admin/asset-processing-log-get-export", require("./asset-processing-log-get-export"));

	app.route("/admin/unlock-image-upload-get-filters", require("./unlock-image-upload-get-filters"));
	app.route("/admin/unlock-image-upload-get-all", require("./unlock-image-upload-get-all"));
	app.route("/admin/home-screen-blog-get-categories", require("./home-screen-blog-get-categories"));
	app.route("/admin/home-screen-blog-category-update", require("./home-screen-blog-category-update"));
	app.route(`/admin/email-activity-get-url`, require("./email-activity-get-url"));
	app.route(`/admin/create-unlock-attempt-oids`, require("./create-unlock-attempt-oids"));
	app.route(`/admin/class-get-uneditable-fields`, require("./class-get-uneditable-fields"));
	app.route(`/admin/school-get-uneditable-fields`, require("./school-get-uneditable-fields"));
	app.route(`/admin/asset-favorite-get-all`, require("./asset-favorite-get-all"));
	app.route(`/admin/extract-favorite-get-all`, require("./extract-favorite-get-all"));
	app.route(`/admin/rollover-job-get-filters`, require("./rollover-job-get-filters"));
	app.route(`/admin/rollover-job-get-all`, require("./rollover-job-get-all"));
	app.route(`/admin/rollover-job-create`, require("./rollover-job-create"));
	app.route(`/admin/rollover-job-update`, require("./rollover-job-update"));
	app.route(`/admin/rollover-job-delete`, require("./rollover-job-delete"));
	app.route(`/admin/rollover-job-get-for-export`, require("./rollover-job-get-for-export"));
	app.route(`/admin/school-get-ids`, require("./school-get-ids"));

	app.route("/admin/content-request-create", require("./content-request-create"));
	app.route("/admin/content-request-get-all", require("./content-request-get-all"));
	app.route("/admin/content-type-get-all", require("./content-type-get-all"));

	const userReportRoutes = require("./user-report");

	app.route("/admin/user-report/all", userReportRoutes.getAllRoute);
	app.route("/admin/user-report/content-items", userReportRoutes.getContentItemsRoute);
	app.route("/admin/user-report/copies", userReportRoutes.getCopiesRoute);
	app.route("/admin/user-report/filters", userReportRoutes.getFiltersRoute);

	app.route("/admin/asset-user-upload-get-all", require("./asset-user-upload-get-all"));
	app.route("/admin/asset-user-upload-delete", require("./asset-user-upload-delete"));
	app.route("/admin/asset-user-upload-get-filters", require("./asset-user-upload-get-filters"));

	if (!IS_PRODUCTION) {
		// Endpoint: Dev-only helper methods that dump table data.
		app.route("/admin/get-subjects", async (params, ctx) => {
			await ctx.ensureClaAdminRequest();
			const subject = await ctx.appDbQuery("SELECT * FROM subject");
			return subject.rows;
		});
		app.route("/admin/get-publishers", async (params, ctx) => {
			await ctx.ensureClaAdminRequest();
			const data = await ctx.appDbQuery("SELECT * FROM publisher");
			return data.rows;
		});
		app.route("/admin/get-authors", async (params, ctx) => {
			await ctx.ensureClaAdminRequest();
			const data = await ctx.appDbQuery("SELECT * FROM author");
			return data.rows;
		});
		app.route("/admin/get-assets", async (params, ctx) => {
			await ctx.ensureClaAdminRequest();
			const data = await ctx.appDbQuery("SELECT * FROM asset");
			return data.rows;
		});
	}
};
