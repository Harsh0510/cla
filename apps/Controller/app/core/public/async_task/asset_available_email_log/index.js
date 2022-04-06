const pushTask = require("./pushTask");
const { unlockAttemptStatus } = require(`../../../../common/staticValues`);
const unlockNotifierEmailSenderAndFetchSchoolAssetMap = require("./unlockNotifierEmailSenderAndFetchSchoolAssetMap");
const tempUnlockNotificationEmailSender = require("./tempUnlockNotificationEmailSender");
const unlockNotificationEmailSender = require("./unlockNotificationEmailSender");
const { emailNotificationCategory } = require("../../../../common/staticValues");

module.exports = async function (taskDetails) {
	try {
		const results = await taskDetails.query(
			`
				SELECT
					MAX(unlock_attempt.user_id) AS user_id,
					MAX(unlock_attempt.school_id) AS school_id,
					cla_user.role AS user_role,
					cla_user.email AS email,
					cla_user.first_name AS first_name,
					MAX(unlock_attempt.status) AS status,
					MAX(asset_school_info.expiration_date) AS expiration_date,
					MAX(asset_school_info.asset_id) AS asset_id,
					asset.authors_log AS authors_log,
					asset.publisher_name_log AS publisher,
					asset.publication_date AS publication_date,
					asset.edition AS edition,
					asset.title AS title,
					asset.pdf_isbn13 AS pdf_isbn13,
					(NOT ('{${emailNotificationCategory.unlockNotification}}'::TEXT[] <@ cla_user.email_opt_out)) AS should_receive_email
				FROM
					asset_school_info
				INNER JOIN asset
					ON asset_school_info.asset_id = asset.id
				INNER JOIN unlock_attempt
					ON unlock_attempt.isbn IN (asset.pdf_isbn13, asset.isbn13, asset.alternate_isbn13)
					AND asset_school_info.school_id = unlock_attempt.school_id
				LEFT JOIN cla_user
					ON unlock_attempt.user_id = cla_user.id
				WHERE
					asset_school_info.is_auto_unlocked = true
					AND asset_school_info.email_processed = false
					AND unlock_attempt.status = $1
					AND asset.active
					AND asset.is_ep
				GROUP BY
					cla_user.id,
					asset.id
			`,
			[unlockAttemptStatus.doesNotExist]
		);
		if (!results.rowCount) {
			return;
		}
		// fetch data for Unlock notification emails when a book is unlocked
		const resultAutoUnlockAssets = results.rows.filter((r) => r.expiration_date === null);
		// fetch data for Unlock notification emails when a book is temporarily unlocked
		const resultTempAutoUnlockAssets = results.rows.filter((r) => r.expiration_date !== null);
		const schoolAssetMap = Object.create(null);
		const querier = taskDetails.query.bind(taskDetails);

		if (resultAutoUnlockAssets.length) {
			const assetSchool = await unlockNotifierEmailSenderAndFetchSchoolAssetMap(querier, resultAutoUnlockAssets, unlockNotificationEmailSender);
			Object.assign(schoolAssetMap, assetSchool);
		}
		if (resultTempAutoUnlockAssets.length) {
			const tempAssetSchool = await unlockNotifierEmailSenderAndFetchSchoolAssetMap(
				querier,
				resultTempAutoUnlockAssets,
				tempUnlockNotificationEmailSender
			);
			Object.assign(schoolAssetMap, tempAssetSchool);
		}

		if (Object.keys(schoolAssetMap).length) {
			//Update email_processed falg as true
			const updateAssetSchoolValues = [];
			const bindAssetSchoolValues = [];
			for (const schoolAsset in schoolAssetMap) {
				const data = schoolAssetMap[schoolAsset];
				updateAssetSchoolValues.push(
					`($${bindAssetSchoolValues.push(data.school_id)}::integer, $${bindAssetSchoolValues.push(data.asset_id)}::integer)`
				);
			}
			await taskDetails.query(
				`
					UPDATE
						asset_school_info
					SET
						email_processed = TRUE,
						date_edited = NOW()
					FROM
						(VALUES ${updateAssetSchoolValues.join(",")})
						AS v(school_id, asset_id)
					WHERE
						asset_school_info.school_id = v.school_id
						AND asset_school_info.asset_id = v.asset_id
				`,
				bindAssetSchoolValues
			);
		}
	} finally {
		//delete task from asynctask
		await taskDetails.deleteSelf();
		await pushTask(taskDetails);
	}
};
