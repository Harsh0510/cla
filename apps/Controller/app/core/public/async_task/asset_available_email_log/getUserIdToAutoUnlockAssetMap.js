const { userRoles } = require("../../../../common/staticValues");
const { emailNotificationCategory } = require("../../../../common/staticValues");
/**
 * getUserIdToAutoUnlockAssetMap
 * @param {*} querier
 * @param {*} autoUnlockAssets
 */
module.exports = async function (querier, autoUnlockAssets) {
	const userIdToAutoUnlockAssetMap = Object.create(null);
	const schoolIdToAutoUnlockAssetMap = Object.create(null);
	for (const asset of autoUnlockAssets) {
		if (asset.user_role && asset.user_role !== userRoles.claAdmin) {
			// user has previously attempted to unlock some of the books, either manually (scanned barcode or submitted image) or in bulk
			if (!userIdToAutoUnlockAssetMap[asset.user_id]) {
				userIdToAutoUnlockAssetMap[asset.user_id] = [];
			}
			userIdToAutoUnlockAssetMap[asset.user_id].push(asset);
		} else {
			// Unlock notification emails when the original user no longer exists on EP
			// Or
			// Unlock notification emails when CLA attempts to unlock books for an institution
			if (!schoolIdToAutoUnlockAssetMap[asset.school_id]) {
				schoolIdToAutoUnlockAssetMap[asset.school_id] = [];
			}
			schoolIdToAutoUnlockAssetMap[asset.school_id].push(asset);
		}
	}

	for (const school in schoolIdToAutoUnlockAssetMap) {
		const schoolId = parseInt(school, 10);
		const availableAssetData = [...schoolIdToAutoUnlockAssetMap[school]];
		const schoolAdminUsersResult = await querier(
			`
					SELECT
						id,
						email,
						first_name,
						role,
						(NOT ('{${emailNotificationCategory.unlockNotification}}'::TEXT[] <@ cla_user.email_opt_out)) AS should_receive_email
					FROM
						cla_user
					WHERE
						school_id = $1
						AND role = $2
				`,
			[schoolId, userRoles.schoolAdmin]
		);
		schoolAdminUsersResult.rows.forEach((user) => {
			const availableAssetDataMap = [];
			availableAssetData.forEach((r) => {
				const newRow = { ...r };
				newRow.email = user.email;
				newRow.first_name = user.first_name;
				newRow.user_id = user.id;
				newRow.user_role = user.role;
				newRow.should_receive_email = user.should_receive_email;
				availableAssetDataMap.push({ ...newRow });
			});
			if (!userIdToAutoUnlockAssetMap[user.id]) {
				userIdToAutoUnlockAssetMap[user.id] = [];
			}
			userIdToAutoUnlockAssetMap[user.id].push(...availableAssetDataMap);
		});
	}
	return userIdToAutoUnlockAssetMap;
};
