const tvfUtil = require("#tvf-util");
const ensure = require("#tvf-ensure");
const getInsertQueryObject = require("../../common/getInsertQueryObject");
const addDefaultClass = require("./common/addDefaultClass");
const getUsersListForNotification = require(`../../common/getUsersListForNotification`);
const { notificationCategories, notification } = require("../../common/staticValues");

const genPasswordHash = require("./common/genPasswordHash");

const fetchValidUser = async (querier, activationToken) => {
	const userResult = await querier(
		`
			SELECT
				cla_user.id AS id,
				cla_user.status AS status,
				cla_user.password_hash IS NOT NULL AS has_password,
				cla_user.email AS email,
				cla_user.school_id AS school_id,
				cla_user.first_name AS first_name,
				cla_user.last_name AS last_name,
				cla_user.title AS title,
				cla_user.activation_token AS activation_token,
				cla_user.activation_token_expiry < NOW() AS activation_token_expired,
				school.name AS school,
				school.id AS school_id,
				cla_user.default_class_year_group AS default_class_year_group,
				cla_user.default_class_exam_board AS default_class_exam_board,
				cla_user.trusted_domain_registered_with IS NOT NULL AS did_register_with_trusted_domain,
				cla_user.registered_with_approved_domain AS registered_with_approved_domain
			FROM
				cla_user
			LEFT JOIN school
				ON school.id = cla_user.school_id
			WHERE
				cla_user.activation_token = $1
		`,
		[activationToken]
	);
	if (!userResult.rowCount) {
		return {
			success: false,
			error: "user_not_found",
		};
	}
	const user = userResult.rows[0];
	if (user.status === "registered") {
		return {
			success: false,
			error: "already_registered",
			user: user,
		};
	}
	if (user.status !== "unverified" && user.status !== "approved") {
		return {
			success: false,
			error: "invalid_status",
			user: user,
		};
	}
	if (!user.activation_token) {
		return {
			success: false,
			error: "already_verified",
			user: user,
		};
	}
	if (user.activation_token_expired) {
		return {
			success: false,
			error: "token_expired",
			user: user,
		};
	}
	return {
		success: true,
		user: user,
	};
};

const validatePassword = (password) => {
	if (!password) {
		return {
			success: false,
			error: "password_not_provided",
		};
	}
	if (!tvfUtil.passwordIsStrong(password)) {
		return {
			success: false,
			error: "password_not_strong",
		};
	}
};

const progressRegistration = async (querier, activationToken, password, acceptedTerms) => {
	const userResult = await fetchValidUser(querier, activationToken);
	if (!userResult.success) {
		return userResult;
	}
	const user = userResult.user;
	let updateType;
	let updateResult;
	if (user.status === "unverified") {
		/**
		 * User status is unverified, so the user either signed up using the old user flow
		 * (before immediate password creation), or they signed up with an unapproved domain
		 * (i.e. unknown or merely 'trusted', but not approved).
		 */
		if (!user.has_password) {
			if (user.registered_with_approved_domain) {
				/**
				 * User is unverified, doesn't have a password and registered with an approved domain.
				 * So the user EITHER registered with an approved domain using the old legacy registration process,
				 * OR they were created in the admin section by a CLA admin or school admin,
				 * OR they were inserted via the Wonde user sync.
				 * Either way, a password must be supplied and they have to accept the T&Cs.
				 *
				 * NB: Technically legacy users don't have to accept the T&Cs because they already accepted them on
				 * the registration form, but it's difficult to detect this. Let's just require them to accept the
				 * T&Cs again. The number of legacy users is pretty minimal at this point anyway.
				 *
				 * Users who were created via the admin section (or via Wonde data sync) definitely DO need to
				 * accept the terms and conditions because they haven't done so yet.
				 */
				if (!acceptedTerms) {
					return {
						success: false,
						error: "terms_not_agreed",
						user: user,
					};
				}
				updateType = "legacy-activate";
				const pwValidation = validatePassword(password);
				if (pwValidation) {
					pwValidation.user = user;
					return pwValidation;
				}
			} else {
				updateType = "legacy-unverified";
			}
		} else if (user.did_register_with_trusted_domain) {
			updateType = "te-unverified"; // te = trusted email
		} else {
			updateType = "ue-unverified"; // ue = unknown email
		}
		const binds = [];
		const userIdBindIdx = binds.push(user.id);
		const updateFields = [
			`activation_token = NULL`,
			`activation_token_expiry = NULL`,
			`date_status_changed = NOW()`,
			`date_last_registration_activity = NOW()`,
			`date_edited = NOW()`,
			`modified_by_user_id = $${userIdBindIdx}`,
		];
		if (updateType === "legacy-activate") {
			const pwHash = await genPasswordHash(password);
			updateFields.push(
				`status = 'registered'`,
				`date_transitioned_to_registered = NOW()`,
				`date_created_initial_password = NOW()`,
				`password_hash = $${binds.push(pwHash.hash)}`,
				`password_salt = $${binds.push(pwHash.salt)}`,
				`password_algo = $${binds.push(pwHash.algo)}`
			);
		} else {
			updateFields.push(`status = 'pending'`, `date_transitioned_to_pending = NOW()`);
		}
		updateResult = await querier(
			`
				UPDATE
					cla_user
				SET
					${updateFields.join(", ")}
				WHERE
					id = $${userIdBindIdx}
					AND status = 'unverified'
				RETURNING
					id
			`,
			binds
		);
	} else if (user.has_password) {
		// User is approved and has password.
		// So they registered with an APPROVED domain with the new flow.
		// So: set them to 'registered'
		updateType = "finalise";
		updateResult = await querier(
			`
				UPDATE
					cla_user
				SET
					activation_token = NULL,
					activation_token_expiry = NULL,
					status = 'registered',
					date_status_changed = NOW(),
					date_last_registration_activity = NOW(),
					date_transitioned_to_registered = NOW(),
					date_edited = NOW(),
					modified_by_user_id = $1
				WHERE
					id = $1
					AND status = 'approved'
				RETURNING
					id
			`,
			[user.id]
		);
	} else {
		// user is approved but has no password set
		// so they registered with the old flow (or they were created in the CMS)
		const pwValidation = validatePassword(password);
		if (pwValidation) {
			pwValidation.user = user;
			return pwValidation;
		}
		updateType = "legacy-approve";
		const pwHash = await genPasswordHash(password);
		updateResult = await querier(
			`
				UPDATE
					cla_user
				SET
					activation_token = NULL,
					activation_token_expiry = NULL,
					password_hash = $2,
					password_salt = $3,
					password_algo = $4,
					status = 'registered',
					date_status_changed = NOW(),
					date_last_registration_activity = NOW(),
					date_transitioned_to_registered = NOW(),
					date_created_initial_password = NOW(),
					date_edited = NOW(),
					modified_by_user_id = $1
				WHERE
					id = $1
					AND status = 'approved'
				RETURNING
					id
			`,
			[user.id, pwHash.hash, pwHash.salt, pwHash.algo]
		);
	}
	if (!updateResult.rowCount) {
		return {
			success: false,
			error: "unknown_error",
			user: user,
		};
	}
	return {
		success: true,
		error: null,
		user: user,
		update_type: updateType,
	};
};

module.exports = async function (params, ctx) {
	ensure.validIdentifier(ctx, params.activation_token, "Activation token");
	const querier = ctx.appDbQuery.bind(ctx);
	let result;
	if (params.check_status_only) {
		result = await fetchValidUser(querier, params.activation_token);
	} else {
		result = await progressRegistration(querier, params.activation_token, params.password, params.terms_accepted);
	}
	if (result.success) {
		if (result.update_type === "legacy-approve" || result.update_type === "legacy-activate") {
			await addDefaultClass(ctx, result.user);
		} else if (result.update_type === "legacy-unverified" || result.update_type === "te-unverified" || result.update_type === "ue-unverified") {
			const user = result.user;
			//get the category details
			let category_id,
				category_name = null,
				hideable = false;
			const result_category = await ctx.appDbQuery(
				`
					SELECT
						id,
						name,
						hideable
					FROM
						notification_category
					WHERE
						code = $1
				`,
				[notificationCategories.awaitingApproval.code]
			);
			if (result_category && result_category.rows && result_category.rows.length === 1) {
				category_id = result_category.rows[0].id;
				category_name = result_category.rows[0].name;

				const data = await getUsersListForNotification(user.school_id, category_id, category_name, user.email, querier, hideable);
				if (data.length > 0) {
					const tableName = notification.tableName;
					const fields = notification.fields;
					const queryObject = getInsertQueryObject(tableName, fields, data);
					if (queryObject && queryObject.text && queryObject.values) {
						await ctx.appDbQuery(queryObject.text, queryObject.values);
					}
				}
			}
		}
	}
	if (result.error === "user_not_found") {
		ctx.throw(400, "Token NonExistent");
	} else if (result.error === "password_not_provided") {
		ctx.throw(400, "Password not provided.");
	} else if (result.error === "password_not_strong") {
		ctx.throw(400, "Password not strong enough.");
	} else if (result.error === "terms_not_agreed") {
		ctx.throw(400, "Please accept the terms & conditions.");
	} else if (!result.success) {
		ctx.throw(400, "Token Expired");
	}
	return {
		result: true,
		update_type: result.update_type,
	};
};
