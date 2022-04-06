const { statusById } = require(`../../../../common/getAllStatuses`); //../../common/getAllStatuses
const { userRoles, notificationCategories, notification } = require(`../../../../common/staticValues`);
const getInsertQueryObject = require(`../../../../common/getInsertQueryObject`);
const notificationChecker = require("./notificationChecker");
const NOTIFICATION_CATEGORY = notificationCategories;
const tvfUtil = require("#tvf-util");

/**
 * Exucute the function based on asynctaskRunner
 */
module.exports = async function (taskDetails) {
	let category_id,
		hideable_log = null;
	try {
		// get users which approval pending for more than or equals 2 days
		const result_category = await taskDetails.query(
			`
				SELECT
					id,
					hideable
				FROM notification_category
				WHERE code = $1
			`,
			[NOTIFICATION_CATEGORY.awaitingApproval.code]
		);

		if (result_category && result_category.rows && result_category.rows.length === 1) {
			category_id = result_category.rows[0].id;
			hideable_log = result_category.rows[0].hideable;
			// get users which approval pending for more than or equals 2 days
			const result = await taskDetails.query(
				`
					SELECT
						id,
						email,
						school_id
					FROM cla_user
					WHERE date_transitioned_to_pending IS NOT NULL
						AND cla_user.status = $1
						AND cla_user.date_transitioned_to_pending + interval '2 days' <= NOW()
						AND cla_user.id NOT IN (SELECT user_id FROM user_awaiting_approval_notification_log)
				`,
				[statusById.pending]
			);

			if (result.rows && result.rows.length > 0) {
				//based on usersBySchool with key add the user Pending Approval list
				const usersBySchool = Object.create(null);
				for (const row of result.rows) {
					if (!usersBySchool[row.school_id]) {
						usersBySchool[row.school_id] = {
							adminIds: [],
							usersPendingApproval: [],
						};
					}
					usersBySchool[row.school_id].usersPendingApproval.push(row);
				}

				const schoolIds = Object.keys(usersBySchool);
				//Get the school admin users which belong with the schoolIds
				const schoolIdResults = await taskDetails.query(`
					SELECT
						school_id,
						ARRAY_AGG(id) AS ids
					FROM
						cla_user
					WHERE
						role = '${userRoles.schoolAdmin}'
						AND school_id IN (${schoolIds.join(", ")})
						AND cla_user.id NOT IN (SELECT user_disabled_notification_categories.user_id FROM user_disabled_notification_categories WHERE category_id = ${category_id})
					GROUP BY school_id
				`);

				//based on usersBySchool with key add the school admin ids
				for (const row of schoolIdResults.rows) {
					usersBySchool[row.school_id].adminIds = row.ids;
				}

				const pendingUserIds = [];
				const insertNotificationData = [];

				for (const key in usersBySchool) {
					const data = usersBySchool[key];
					for (const user of data.usersPendingApproval) {
						const pendingUser = {
							user_id: user.id,
						};
						pendingUserIds.push(pendingUser);
						const user_email = user.email;
						const link = { static: false, value: user_email, type: NOTIFICATION_CATEGORY.awaitingApproval.code };
						const adminIdsWithOIds = await Promise.all(
							data.adminIds.map(async (adminId) => {
								const adminUserwithOid = {
									user_id: adminId,
									oId: await tvfUtil.generateObjectIdentifier(),
								};
								return adminUserwithOid;
							})
						);
						for (const user of adminIdsWithOIds) {
							const user_object = Object.create(null);
							user_object.user_id = user.user_id;
							user_object.oid = user.oId;
							user_object.category_id = category_id;
							user_object.title = user_email + " is awaiting approval";
							user_object.subtitle = "Approval pending for this user";
							user_object.description = "Approval pending for this user";
							user_object.link = link;
							user_object.hideable_log = hideable_log;
							user_object.high_priority = false;
							insertNotificationData.push(user_object);
						}
					}
				}

				//Insert into 'notification' table
				if (insertNotificationData.length > 0) {
					const queryObject = getInsertQueryObject(notification.tableName, notification.fields, insertNotificationData);
					if (queryObject && queryObject.text && queryObject.values) {
						await taskDetails.query(queryObject.text, queryObject.values);
					}
				}

				if (pendingUserIds.length > 0) {
					// insert into 'user_awaiting_approval_notification_log' table
					const tableName = "user_awaiting_approval_notification_log";
					const fields = ["user_id"];
					const onConflict = "ON CONFLICT (user_id) DO NOTHING";
					const queryObject = getInsertQueryObject(tableName, fields, pendingUserIds, onConflict);
					if (queryObject && queryObject.text && queryObject.values) {
						await taskDetails.query(queryObject.text, queryObject.values);
					}
				}
			}
		}
	} catch (e) {
		throw e;
	} finally {
		//delete task from asynctask
		await taskDetails.deleteSelf();
		// Push this task back into the queue so it runs itself in about 5 minutes.
		await notificationChecker(taskDetails);
	}
};
