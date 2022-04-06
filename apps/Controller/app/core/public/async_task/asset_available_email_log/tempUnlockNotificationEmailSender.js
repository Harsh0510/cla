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

const TEMPORARY_UNLOCK_BOOK_INFO_TEXT = `You can read about temporarily unlocking books on the Education Platform in this guide article: <a href="https://educationplatform.zendesk.com/hc/en-us/articles/360019367538-Temporarily-unlocking-books">Temporarily unlocking books</a>`;

const getViewUnlockedAssetsUrl = () => getUrl("/works?filter_misc=unlock_books");

/**
 * Unlock notifications when a book is temporarily unlocked
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
	} of the books you have previously tried to unlock on the Education Platform has recently been added to the Platform. As you have already told us that you own this and tried to temporarily unlock it, this is now available to you on a temporary basis. To gain full access, remember to unlock it once you have the physical book to hand.`;

	if (numberOfAsset === 1) {
		// Notifications to users when one of their attempted unlocked books are added to the Platform
		const assetList = getUserAvailableAssetsList(userAssetData);
		await sendEmail.sendTemplate(
			null,
			userEmail,
			`Education Platform: One of your books has just been temporarily unlocked for you`,
			{
				content: `${commonInforText}<br /><br />The book which has been added is:<br /><ul>${assetList}</ul><br /><br />${TEMPORARY_UNLOCK_BOOK_INFO_TEXT}`,
				secondary_content: SECONDARY_CONTENT,
			},
			null,
			emailNotificationCategory.unlockNotification + "-single-temp"
		);
	} else if (numberOfAsset >= 2 && numberOfAsset <= 10) {
		// Notifications to users when several (2-10) of their attempted unlocked books are are added to the Platform at once
		const assetList = getUserAvailableAssetsList(userAssetData);
		const viewAllUnlockBooksText = `You can view all of your unlocked books <a href="${getViewUnlockedAssetsUrl()}" target="_blank">here</a>, or see the below list for the newly available ones.`;
		await sendEmail.sendTemplate(
			null,
			userEmail,
			`Education Platform: New books have just been temporarily unlocked for you`,
			{
				content: `${commonInforText}.<br /><br /> ${viewAllUnlockBooksText}<br /><br />The books which have been added are:<br /><ul>${assetList.join(
					""
				)}</ul><br /><br />${TEMPORARY_UNLOCK_BOOK_INFO_TEXT}`,
				secondary_content: SECONDARY_CONTENT,
			},
			null,
			emailNotificationCategory.unlockNotification + "-multiple-1-temp"
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
		const viewAllUnlockBooksText = `You can view all of your unlocked books <a href="${getViewUnlockedAssetsUrl()}" target="_blank">here</a>.`;
		await sendEmail.sendTemplate(
			null,
			userEmail,
			`Education Platform: Several new books have just been temporarily unlocked for you`,
			{
				content: `${commonInforText}.<br /><br /> ${viewAllUnlockBooksText}<br /><br />The books which have been added are listed in the attached document. We hope you will find these books a useful addition to the Platform.<br /><br />${TEMPORARY_UNLOCK_BOOK_INFO_TEXT}`,
				secondary_content: SECONDARY_CONTENT,
			},
			attachment,
			emailNotificationCategory.unlockNotification + "-multiple-2-temp"
		);
	}
};
