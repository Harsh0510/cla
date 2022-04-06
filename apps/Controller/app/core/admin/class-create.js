/**
 * Allow institution admins to create new classes on the frontend
 */
const ensure = require("#tvf-ensure");
const { uploadSingleClass, getValidationMessagesForClass } = require("./lib/classCreate");

module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();

	const sessionData = await ctx.getSessionData();
	const userRole = sessionData.user_role;

	// Throw an error if non admins attempt to access this endpoint
	ctx.assert(userRole === "cla-admin" || userRole === "school-admin" || userRole === "teacher", 401, "Unauthorized");

	if (userRole === "cla-admin") {
		ensure.nonNegativeInteger(ctx, params.school_id, "Institution");
	}

	const klass = {
		title: params.title,
		year_group: params.year_group,
		number_of_students: params.number_of_students,
		exam_board: params.exam_board,
		key_stage: params.key_stage,
	};

	const errors = getValidationMessagesForClass(klass);

	ctx.assert(!errors.length, 400, errors.join("; "));

	const { error, id } = await uploadSingleClass(
		(...args) => ctx.appDbQuery(...args),
		userRole === "cla-admin" ? params.school_id : sessionData.school_id,
		sessionData.user_id,
		klass
	);

	ctx.assert(!error, 400, error);

	return {
		success: true,
		id: id,
	};
};
