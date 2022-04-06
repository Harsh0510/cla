const tvfUtil = require("#tvf-util");
const { userRoles, notificationCategories } = require("./staticValues");
const USER_ROLE_SCHOOL_ADMIN = userRoles.schoolAdmin;
const NOTIFICATION_CATEGORY = notificationCategories;

/**
 * getUsersListForNotification
 * @param {number} school_id
 * @param {number} category_id
 * @param {string} category_name
 * @param {string} user_email
 * @param {any} dbClient client object
 */
async function getUsersListForNotification(school_id, category_id, category_name, user_email, querier, hideable = true) {
	if (school_id && category_id && category_name && user_email) {
		//get the school-admin users
		const getUsers = await querier(
			`
				SELECT
					cla_user.id AS user_id
				FROM
					cla_user
				WHERE
					cla_user.role = $1
					AND cla_user.school_id = $2
					AND cla_user.id NOT IN (SELECT user_disabled_notification_categories.user_id FROM user_disabled_notification_categories WHERE category_id = $3)
			`,
			[USER_ROLE_SCHOOL_ADMIN, school_id, category_id]
		);
		if (getUsers && getUsers.rows && getUsers.rows.length > 0) {
			const usersData = getUsers.rows;
			const data = [];
			const link = {
				static: false,
				value: user_email,
				type: NOTIFICATION_CATEGORY.awaitingApproval.code,
			};
			const oids = await Promise.all(usersData.map(() => tvfUtil.generateObjectIdentifier()));
			let i = 0;
			for (const user of usersData) {
				const user_object = Object.create(null);
				user_object.user_id = user.user_id;
				user_object.oid = oids[i];
				user_object.category_id = category_id;
				user_object.category_name = category_name;
				user_object.title = user_email + " is awaiting approval";
				user_object.description = "Approval pending for this user";
				user_object.link = link;
				user_object.hideable_log = hideable;
				user_object.high_priority = false;
				data.push(user_object);
				i++;
			}
			return data;
		}
	}
	return [];
}

module.exports = getUsersListForNotification;
