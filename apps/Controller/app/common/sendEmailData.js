const sendEmailList = require("./sendEmailList");
const getUrl = require("./getUrl");
const SUPPORT_EMAIL_EP = sendEmailList.supportEP;
const UNLOCK_BOOK_URL = getUrl(`/works?filter_misc=unlock_books`);
const UNLOCK_URL = getUrl("/unlock");

const COMMON_SECONDARY_CONTENT_SUFFIX = `<br/><br/> To manage the notifications and emails you receive from us, login to the <a href="${getUrl(
	"/profile/my-details"
)}">My Details page</a>.`;

//**TO DO */
const EMAIL_FROM = null;
const EMAIL_ICON_BOOK = "book";

const NOT_VERIFIED_TITLE = "Complete your Registration";
const NOT_VERIFIED_BODY =
	"Thank you for signing up to the Education Platform. Finish setting up your account today using the link below and you can begin using the Platform right away to unlock digital versions of books your institution owns, make copies and share them with students.";
const NOT_VERIFIED_CTA_TITLE = "Verify Account";
const NOT_VERIFIED_SECONDARY_CONTENT = `If you need help with setting up your account please <a href="mailto:${SUPPORT_EMAIL_EP}" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable">contact us</a> for assistance.`;

module.exports = {
	COMMON_SECONDARY_CONTENT_SUFFIX,
	alertEmailHighRateUsage: {
		subject: "High Rate of Usage for Extract Accesses",
		from: EMAIL_FROM,
		to: SUPPORT_EMAIL_EP,
		body: "Please see attached spreadsheet for extracts that have been accessed more than 25 times per minute recently.",
	},
	alertEmailUserNotCreatedCopies: {
		subject: "Education Platform: Do you want to make some copies?",
		title: "Make a copy",
		from: EMAIL_FROM,
		body: `We noticed that you have not yet made any copies from the books on the Education Platform. To make a copy you simply need to choose the book and enter the class for which you want to make a copy, browse the book and select the pages you want to copy. If you can't find the book you want, you may need to <a style="text-decoration:underline;color:#ffffff;" href="${UNLOCK_URL}">unlock it</a>.`,
		cta: {
			title: `View my institution's books`,
			url: UNLOCK_BOOK_URL,
		},
		icon: EMAIL_ICON_BOOK,
		secondary_content:
			`If you need help making copies please <a href="mailto:${SUPPORT_EMAIL_EP}" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable">contact us</a> for assistance.` +
			COMMON_SECONDARY_CONTENT_SUFFIX,
	},
	alertEmailUserNotVerified: {
		subject: `Education Platform: Finish setting up your account`,
		title: NOT_VERIFIED_TITLE,
		from: EMAIL_FROM,
		body: NOT_VERIFIED_BODY,
		cta: {
			title: NOT_VERIFIED_CTA_TITLE,
		},
		secondary_content: NOT_VERIFIED_SECONDARY_CONTENT + COMMON_SECONDARY_CONTENT_SUFFIX,
	},
	alertEmailUserNotVerified_10_Days: {
		subject: `Remember to finish setting up your Education Platform account`,
		title: NOT_VERIFIED_TITLE,
		from: EMAIL_FROM,
		body: NOT_VERIFIED_BODY,
		cta: {
			title: NOT_VERIFIED_CTA_TITLE,
		},
		secondary_content: NOT_VERIFIED_SECONDARY_CONTENT + COMMON_SECONDARY_CONTENT_SUFFIX,
	},
	alertEmailUserNotVerified_17_Days: {
		subject: "Do you need help setting up your Education Platform account?",
		title: NOT_VERIFIED_TITLE,
		from: EMAIL_FROM,
		body:
			"We've noticed that you haven't finished setting up your account. Use the link below and you can begin using the Platform right away to unlock digital versions of books your school or college owns, make copies and share them with students.",
		cta: {
			title: NOT_VERIFIED_CTA_TITLE,
		},
		secondary_content: NOT_VERIFIED_SECONDARY_CONTENT + COMMON_SECONDARY_CONTENT_SUFFIX,
	},
	alertEmailUserNotUnlockedBook: {
		subject: "Education Platform: Do you want to unlock a book?",
		title: "Unlock a book",
		from: EMAIL_FROM,
		body:
			"Thank you for setting up your Education Platform account. We noticed that you haven't yet unlocked any books.<br/><br/>Unlocking is easy, all you need to do is scan the barcode of the physical book your school or college owns to make it available to copy from.",
		cta: {
			title: "Unlock a book",
			url: UNLOCK_URL,
		},
		icon: EMAIL_ICON_BOOK,
		secondary_content:
			`If you need help unlocking your books please <a href="mailto:${SUPPORT_EMAIL_EP}" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable">contact us</a> for assistance.` +
			COMMON_SECONDARY_CONTENT_SUFFIX,
	},
};
