const fs = require("fs");
const AppFile = require("#tvf-app").File;

const uploadToAzure = require("../../common/unlockImageUploadHelpers");
const isbnFromImageViaGoogleExtractor = require("../../common/isbnFromImageViaGoogleExtractorInstance");
const unlockByISBNImage = require("../../common/unlockByISBNImage");

module.exports = async function (params, ctx) {
	ctx.assert(params.unlock_image instanceof AppFile, 400, "Upload not provided");

	await ctx.ensureLoggedIn();
	const sessionData = await ctx.getSessionData();
	ctx.assert(sessionData.school_id > 0, 400, "Unauthorized");

	const googleResult = await isbnFromImageViaGoogleExtractor.parse(params.unlock_image.path);
	const unlockImageUploadId = await unlockByISBNImage(ctx.getAppDbPool(), sessionData.user_id, sessionData.user_id, googleResult.isbn);
	await uploadToAzure.uploadUnlockImage(params.unlock_image.path, unlockImageUploadId);
	fs.unlink(params.unlock_image.path, () => {});
	if (googleResult.error) {
		await ctx.appDbQuery(
			`
				INSERT INTO
					unlock_image_upload_ai_error_log
					(message, code, user_id, school_id, unlock_image_upload_id, ocr_text)
				VALUES
					($1, $2, $3, $4, $5, $6)
			`,
			[
				googleResult.error.message,
				googleResult.error.code,
				sessionData.user_id,
				sessionData.school_id,
				unlockImageUploadId,
				googleResult.error.text || null,
			]
		);
	}

	return {
		result: {
			created: true,
		},
	};
};
