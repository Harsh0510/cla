const htmlEncode = require("html-entities").encode;

const tvfUtil = require("#tvf-util");

const validateRequestParams = require("./validateRequestParams");
const fetchPublisherId = require("./fetchPublisherId");
const fetchAuthors = require("./fetchAuthors");
const upsertAsset = require("./upsertAsset");
const upsertAssetAuthors = require("./upsertAssetAuthors");
const upsertAssetUserUpload = require("./upsertAssetUserUpload");
const uploadPdf = require("./uploadPdf");
const removeFile = require("./removeFile");
const createExtract = require("./createExtract");
const downloadImage = require("./downloadImage");
const moveCoverImageToAzure = require("./moveCoverImageToAzure");
const unlockAssetForSchool = require("./unlockAssetForSchool");
const getPermissionsStatus = require("../common/getPermissionsStatus");
const sendEmail = require("../../../common/sendEmail");
const getUrl = require("../../../common/getUrl");
const { supportEP } = require("../../../common/sendEmailList");
const getPdfPageCount = require("../../admin/lib/getPdfPageCount/index");
const getNormalizedAuthors = require("./getNormalizedAuthors");

// call check permissions api for being excluded, store covered and not found in asset-user-upload

module.exports = async function (params, ctx, asyncRunner) {
	validateRequestParams(ctx, params);
	const sessionData = await ctx.getSessionData();
	await ctx.ensureLoggedIn();
	ctx.assert(sessionData.school_id > 0, 400, "Unauthorized");
	const schoolId = sessionData.school_id;

	const imageTmpPath = await (async () => {
		if (!params.image) {
			return null;
		}
		try {
			return await downloadImage(params.image);
		} catch (e) {
			return null;
		}
	})();

	const coverStatus = await getPermissionsStatus(params.isbn);

	ctx.assert(coverStatus !== "Excluded", 400, "Title is excluded");

	const normalizedAuthors = getNormalizedAuthors(params.authors);

	if (coverStatus === "Not Found") {
		const results = await ctx.appDbQuery(`SELECT name FROM school WHERE id = $1`, [sessionData.school_id]);

		const schoolName = results.rows[0].name;
		const redirectUrl = getUrl("/profile/admin/user-uploaded-extracts");
		const subject = `EP check permissions alert: Permissions not found for ${params.isbn} by ${schoolName}, ${sessionData.school_id}`;
		const emailContent = {
			title: `Permissions not found for ${params.isbn}`,
			content: `The user ${sessionData.user_id} from ${htmlEncode(schoolName)} (${sessionData.school_id}) has uploaded a PDF for ${
				params.isbn
			}: ${htmlEncode(params.title)} where a 'Not found' result was returned by Check Permissions.
<br/><br/>To review this further, <a href='${redirectUrl}'>click here</a> or see below for relevant book metadata.
<br/>
<br/>- ISBN: ${params.isbn}
<br/>- Title: ${htmlEncode(params.title)}
<br/>- Author: ${htmlEncode(normalizedAuthors.map((author) => author.firstName + " " + author.lastName).join("; "))}
<br/>- Publisher: ${htmlEncode(params.publisher)}
<br/>- Publication year: ${params.publication_year}`,
			cta: {
				title: "Review",
				url: redirectUrl,
			},
		};
		await sendEmail.sendTemplate(null, supportEP, subject, emailContent, null, "user-upload-cover-status-not-found");
	}

	const pdfPageCount = await (async () => {
		try {
			return await getPdfPageCount("/usr/bin/gs", params.asset.path);
		} catch (e) {
			ctx.throw(400, "Could not determine upload page count");
		}
	})();

	const querier = ctx.appDbQuery.bind(ctx);

	const publisherId = await fetchPublisherId(querier, sessionData.user_id, params.publisher);
	const authors = await fetchAuthors(querier, sessionData.user_id, normalizedAuthors);
	const asset = await upsertAsset(querier, sessionData.user_id, publisherId, authors, params);
	if (asset.did_insert) {
		if (imageTmpPath) {
			await moveCoverImageToAzure(imageTmpPath, params.isbn);
		}
		await upsertAssetAuthors(
			querier,
			sessionData.user_id,
			asset.id,
			authors.map((author) => author.id)
		);
	}

	const copyRatio = (() => {
		const { pages } = params;
		const pageCount = asset.copyable_page_count;
		if (pageCount > 0) {
			const ratio = pages.length / pageCount;
			if (ratio > 1) {
				ctx.throw(400, "Copy ratio should be between 0 to 1");
			}
			return ratio;
		}
		return 0;
	})();

	const [userFirstName, userLastName] = await (async () => {
		const user = await querier(
			`
				SELECT
					first_name,
					last_name
				FROM
					cla_user
				WHERE
					id = $1
			`,
			[sessionData.user_id]
		);
		if (!user.rowCount) {
			return [null, null];
		}
		return [user.rows[0].first_name, user.rows[0].last_name];
	})();
	await unlockAssetForSchool(querier, asset.id, schoolId, sessionData.user_id);

	if (params.is_created_extract) {
		const oid = await tvfUtil.generateObjectIdentifier();
		const azureFileName = params.isbn + "_" + oid + ".pdf";
		const assetUserUploadId = await upsertAssetUserUpload(querier, {
			asset_id: asset.id,
			user_id: sessionData.user_id,
			pages: params.pages,
			title: params.title,
			file_name: azureFileName,
			upload_name: params.upload_name,
			is_copying_full_chapter: params.is_copying_full_chapter,
			file_size: params.asset.size,
			copy_ratio: copyRatio,
			oid: oid,
			asset_authors: asset.authors_string,
			user_first_name: userFirstName,
			user_last_name: userLastName,
			pdf_page_count: pdfPageCount,
			cover_status: coverStatus,
		});

		await uploadPdf(params.asset.path, azureFileName);
		await removeFile(params.asset.path);
		if (params.is_created_copy) {
			let extractOid = null;

			if (params.course_oid) {
				extractOid = await createExtract(
					querier,
					asyncRunner.pushTask.bind(asyncRunner),
					asset,
					assetUserUploadId,
					sessionData.user_id,
					params.course_oid,
					schoolId,
					params.pages,
					params.upload_name || params.title,
					params.students_in_course,
					params.exam_board
				);
			}

			return {
				extract_oid: extractOid,
				oid: extractOid ? oid : null,
			};
		}
	}

	return {
		created: true,
	};
};
