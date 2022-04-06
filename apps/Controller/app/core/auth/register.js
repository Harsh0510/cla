/**
 * Allow School admins to create new users on the frontend
 */
const ensure = require("#tvf-ensure");
const tvfUtil = require("#tvf-util");
const titles = require("./common/getTitles")();
const inputStringIsValid = require("../../common/inputStringIsValid");
const sendNewVerifyEmail = require("./common/sendNewVerifyEmail");
const sendTrustedVerifyEmail = require("./common/sendTrustedVerifyEmail");
const RegExPatterns = require("../../common/RegExPatterns");
const availableStatuses = require("../../common/getAllStatuses");
const statusById = availableStatuses.statusById;
const validatePassword = require("../../common/validatePassword");
const addDefaultClass = require("./common/addDefaultClass");
const registeredDomainStatus = require("./common/getRegisteredDomainStatus");
const getBestTrustedDomainForEmail = require("./common/getBestTrustedDomainForEmail");

const genericErrorMsg = "Could not register";

module.exports = async function (params, ctx, sendEmail, genPasswordHash) {
	const token = await tvfUtil.generateObjectIdentifier();
	let fields = [];
	let binds = [];
	let values = [];

	// validate inputs
	ensure.nonEmptyStr(ctx, params.title, "Title");
	ctx.assert(titles[params.title], 400, "Title not found");

	ensure.nonEmptyStr(ctx, params.first_name, "First name");
	inputStringIsValid.nameIsValid(ctx, params.first_name, "First name", RegExPatterns.name);
	inputStringIsValid.lengthIsValid(ctx, params.first_name, "First name", 0, 100);

	ensure.nonEmptyStr(ctx, params.last_name, "Last name");
	inputStringIsValid.nameIsValid(ctx, params.last_name, "Last name", RegExPatterns.name);
	inputStringIsValid.lengthIsValid(ctx, params.last_name, "Last name", 0, 100);

	ensure.isEmail(ctx, params.email, "Email");
	inputStringIsValid.lengthIsValid(ctx, params.email, "Email", 0, 255);
	const email = params.email.toLowerCase();
	ensure.positiveInteger(ctx, params.school, "Institution");

	if (params.job_title) {
		inputStringIsValid.lengthIsValid(ctx, params.job_title, "Job title", 0, 150);
	}
	ctx.assert(params.terms_accepted, 400, `Please indicate that you accept the Terms and Conditions`);
	const passwordCheck = validatePassword(params.password);
	ctx.assert(!passwordCheck, 400, passwordCheck);
	ctx.assert(params.password === params.password_confirm, 400, "You have not entered a matching password, please try again.");

	// ensure the supplied institution exists
	let schoolId = params.school;
	let schoolName = null;
	let schoolResults = null;
	{
		schoolResults = await ctx.appDbQuery(
			`
				SELECT
					name
				FROM
					school
				WHERE
					id = $1
			`,
			[params.school]
		);
		// validate school
		if (!(schoolResults && schoolResults.rows && schoolResults.rows.length === 1)) {
			ctx.throw(400, "Institution not found");
		}
	}
	schoolName = schoolResults.rows[0].name;
	let result;
	const approvedDomain = await registeredDomainStatus(ctx, {
		email: email,
		schoolID: schoolId,
	});
	const trustedDomain = await (async () => {
		if (!approvedDomain) {
			return await getBestTrustedDomainForEmail(email, ctx.appDbQuery.bind(ctx));
		}
	})();
	const passwordHashDetail = await genPasswordHash(params.password);
	//If it's change in cla_user insertion fields, You may also need to change into the admin/async_task/wonde/syncSchoolData/route.js && apps/Controller/app/core/auth/register.js
	fields = [
		"title",
		"email",
		"first_name",
		"last_name",
		"job_title",
		"role",
		"source",
		"school_id",
		"activation_token",
		"activation_token_expiry",
		"is_pending_approval",
		"registered_with_approved_domain",
		"trusted_domain_registered_with",
		"date_status_changed",
		"date_last_registration_activity",
		"receive_marketing_emails",
		"password_hash",
		"password_salt",
		"password_algo",
		"date_created_initial_password",
	];
	binds = [
		params.title, // title
		email, // email
		params.first_name, // first_name
		params.last_name, // last_name
		params.job_title, // job_title
		"teacher", // role
		"local", // source
		schoolId, // school id
		token, // activation token
		!approvedDomain, // is_pending_approval
		approvedDomain, // registered_with_approved_domain
		trustedDomain ? trustedDomain.domain : null, // trusted_domain_registered_with
		!!params.receive_marketing_emails, // receive_marketing_emails
		passwordHashDetail.hash,
		passwordHashDetail.salt,
		passwordHashDetail.algo,
	];
	values = [
		"$1",
		"$2",
		"$3",
		"$4",
		"$5",
		"$6",
		"$7",
		"$8",
		"$9",
		"NOW() + interval '3 days'",
		"$10",
		"$11",
		"$12",
		"NOW()",
		"NOW()",
		"$13",
		"$14",
		"$15",
		"$16",
		"NOW()",
	];

	if (approvedDomain) {
		fields.push("status", "date_transitioned_to_approved");
		values.push("$17", "NOW()");
		binds.push(statusById.approved);
	}
	/* ---Note: We are updating date_status_changed and  date_last_registration_activity in below query first and then sending the email to user --- */
	try {
		result = await ctx.appDbQuery(
			`
				INSERT INTO
					cla_user
					(${fields.join(", ")})
				VALUES
				(${values.join(", ")})
				RETURNING
					id
			`,
			binds
		);
		// only one result should be returned
		ctx.assert(result.rows.length === 1, 400, genericErrorMsg);
	} catch (e) {
		// prevent users from having the same email address
		ctx.throw(400, genericErrorMsg);
	}
	// User values required to pass to the default class creation.
	const classParams = {
		title: params.title,
		last_name: params.last_name,
		school_id: schoolId,
		id: result.rows[0].id,
	};

	try {
		await addDefaultClass(ctx, classParams);
		if (approvedDomain || trustedDomain) {
			await sendTrustedVerifyEmail(sendEmail, email, token, params.first_name, schoolName);
		} else {
			await sendNewVerifyEmail(sendEmail, email, token, params.first_name);
		}
	} catch (e) {
		ctx.throw(400, genericErrorMsg);
	}

	return {
		result: true,
		auto_registered: approvedDomain || trustedDomain,
	};
};
