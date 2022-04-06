const getUserIdToAutoUnlockAssetMap = require("./getUserIdToAutoUnlockAssetMap");

/**
 * userAssetsAvailableEmailSender
 * send email to users based on available assets and return schoolAssetMap
 * @param {*} querier
 * @param {*} assets
 * @param {*} isTempUnlockAssets
 */
module.exports = async function (querier, autoUnlockAssets, emailSender) {
	const userIdAutoUnlockAssetMap = await getUserIdToAutoUnlockAssetMap(querier, autoUnlockAssets);
	const schoolAssetMap = Object.create(null);
	for (const userId in userIdAutoUnlockAssetMap) {
		const userUnlockAttemptAssets = userIdAutoUnlockAssetMap[userId]; // user may contain multiple assets which tried to unlock in past
		//send an email to user based on user should_receive_email where user disable the unlock notification or not
		if (userUnlockAttemptAssets[0].should_receive_email) {
			await emailSender(userUnlockAttemptAssets);
		}
		for (const userUnlockAttemptAsset of userUnlockAttemptAssets) {
			if (!schoolAssetMap[`${userUnlockAttemptAsset.school_id}_${userUnlockAttemptAsset.asset_id}`]) {
				schoolAssetMap[`${userUnlockAttemptAsset.school_id}_${userUnlockAttemptAsset.asset_id}`] = {
					school_id: userUnlockAttemptAsset.school_id,
					asset_id: userUnlockAttemptAsset.asset_id,
				};
			}
		}
	}
	return schoolAssetMap;
};
