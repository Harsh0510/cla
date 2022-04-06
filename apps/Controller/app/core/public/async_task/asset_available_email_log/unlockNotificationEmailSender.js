const generateExcelFile = require("../../../../common/generateExcelFile");
const getUrl = require("../../../../common/getUrl");
const sendEmail = require("../../../../common/sendEmail");
const { COMMON_SECONDARY_CONTENT_SUFFIX } = require("../../../../common/sendEmailData");
const getAssetDetail = require("./getAssetDetail");
const getUserAvailableAssetsList = require("./getUserAvailableAssetsList");
const { emailNotificationCategory } = require("../../../../common/staticValues");
const SECONDARY_CONTENT = `<h3>What if I have a question?</h3>

We offer support to users through a dedicated <a href="mailto:support@educationplatform.zendesk.com">Customer Support team</a> and we can help you with any queries you might have. We can help you to find books that you use in the classroom and guide you to ensure that you get the most out of the Platform. You can also access our <a href="https://educationplatform.zendesk.com" target="_blank">Knowledgebase</a> for more information about how it all works.

<br/><br/>

If you would like to know more about the CLA copyright licence that applies to your institution please visit <a href="https://cla.co.uk/licencetocopy" target="_blank">https://cla.co.uk/licencetocopy</a>
<br/><br/>

We hope you enjoy using the Education Platform to support your teaching; if you like it please tell your colleagues!

${COMMON_SECONDARY_CONTENT_SUFFIX}

<br/><br/>
Regards
<br/><br/>

Education Platform Customer Support
<br/><br/>
Education Platform is on twitter <a href="https://twitter.com/EduPlatformUK">@EduPlatformUK</a>`;

const getViewUnlockedAssetsUrl = () => getUrl("/works?filter_misc=unlock_books");

/**
 * Unlock notifications when a book is unlocked
 * @param {*} userAssetData
 */
module.exports = async function (userAssetData = []) {
	const numberOfAsset = userAssetData.length;
	if (!numberOfAsset) {
		return;
	}
	const userEmail = userAssetData[0].email;
	const userFirstName = userAssetData[0].first_name;
	const commonInforText = `Dear ${userFirstName},<br /><br />We are pleased to let you know that ${
		numberOfAsset === 1 ? "one" : numberOfAsset
	} of the books you have previously tried to unlock on the Education Platform ${
		numberOfAsset === 1 ? "has" : "have"
	} recently been added to the Platform. As you have already told us that you own ${
		numberOfAsset === 1 ? "this" : "these books"
	} by trying to unlock ${numberOfAsset === 1 ? "it" : "them"}`;

	// Notifications to users when one of their attempted unlocked books are added to the Platform
	if (numberOfAsset === 1) {
		const assetList = getUserAvailableAssetsList(userAssetData);
		await sendEmail.sendTemplate(
			null,
			userEmail,
			`Education Platform: One of your books is now available to use`,
			{
				content: `${commonInforText}, we have automatically made it available to you so there is no need to try to unlock it again.<br /><br />The book which has been added is:<br /><ul>${assetList}</ul>`,
				secondary_content: SECONDARY_CONTENT,
			},
			null,
			emailNotificationCategory.unlockNotification + "-single"
		);
	} else if (numberOfAsset >= 2 && numberOfAsset <= 10) {
		// Notifications to users when several (2-10) of their attempted unlocked books are are added to the Platform at once
		const assetList = getUserAvailableAssetsList(userAssetData);
		const viewYourUnlockBooksInfoText = `You can view all of your unlocked books <a href="${getViewUnlockedAssetsUrl()}" target="_blank">here</a>, or see the below list for the newly available ones.`;
		await sendEmail.sendTemplate(
			null,
			userEmail,
			`Education Platform: New books are now available for you to use`,
			{
				content: `${commonInforText}, we have automatically made them available to you. ${viewYourUnlockBooksInfoText}<br /><br />The books which have been added are:<br /><ul>${assetList.join(
					""
				)}</ul>`,
				secondary_content: SECONDARY_CONTENT,
			},
			null,
			emailNotificationCategory.unlockNotification + "-multiple-1"
		);
	} else if (numberOfAsset >= 11) {
		// Notifications to users when several (11+) of their attempted unlocked books are are added to the Platform at once
		const assetData = [];
		for (const userAsset of userAssetData) {
			const assetDetail = getAssetDetail(userAsset);
			assetData.push(assetDetail);
		}

		//Export data for display fields in excel file
		const exportData = assetData.map((asset) => ({
			Title: asset.assetCitation,
			ISBN: asset.pdf_isbn13,
			URL: asset.assetUrl,
		}));
		//email content
		const fileName = "unlocked_titles.xlsx";
		const export_ExcelFile = generateExcelFile(exportData, fileName, "Titles Unlocked");
		const attachment = [
			{
				content: export_ExcelFile.attachFiledata,
				filename: export_ExcelFile.fileName,
				contentType: "application/vnd.ms-excel",
			},
		];
		const viewYourUnlockBooksInfoText = `You can view all of your unlocked books <a href="${getViewUnlockedAssetsUrl()}" target="_blank">here</a>.`;
		await sendEmail.sendTemplate(
			null,
			userEmail,
			`Education Platform: Several new books are now available for you to use`,
			{
				content: `${commonInforText}, we have automatically made them available to you. ${viewYourUnlockBooksInfoText}<br /><br />The books which have been added are listed in the attached document. We hope you will find these books a useful addition to the Platform.`,
				secondary_content: SECONDARY_CONTENT,
			},
			attachment,
			emailNotificationCategory.unlockNotification + "-multiple-2"
		);
	}
};
