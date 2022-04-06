export default {
	api: {
		schoolRequestApi: "/auth/get-schools",
		classSearch: "/public/course-search",
	},
	debounceTime: 200,
	noFileSelected: "Please select a file",
	noSchoolSelected: "Please select an institution",
	schoolAsyncDropDown: {
		schoolResultLimit: 25,
		noRecordsOptionMessage: "No results found",
		defaultSearchInputMessage: "Start typing to view results",
		continueSearchInputMessage: "Type at least 3 characters to view results",
	},
	ajaxSearchableDropDown: {
		resultLimit: 25,
		noRecordsOptionMessage: "No results found",
		defaultSearchInputMessage: "Start typing to view results",
	},
	NotificationIntervalTime: 60000,
	assetContentForm: {
		bo: "BO", // (book)
		mi: "MI", // (magazine issue)
		po: "PO", // (podcast)
		vi: "VI", // (video)
	},
	assetFileFormat: {
		pdf: "pdf",
		epub: "epub",
	},
	icons: {
		assetContentFormBook: "fal fa-book",
		assetContentFormMagazine: "fal fa-newspaper",
		assetFileFormatEpub: "fal fa-tablet-alt",
	},
	messages: {
		assetFileFormatEpubMessage:
			"The page numbers in the digital version of this book may not match the ones in your physical copy so please select your pages carefully.",
		assetTableOfContentNull: "Table of Contents not yet available for this title",
		assetOverviewNull: "An overview is not yet available for this title.",
	},
	hoverTitle: {
		assetFileFormatEpub: "This title is derived from an ebook and the page numbers may not match the ones in your physical copy.",
		assetContentFormMagazine: "This title is a magazine.",
		assetContentFormBook: "This title is a book.",
	},
	unlockAttemptStatus: {
		invalidIsbn: "invalid-isbn",
		doesNotExist: "does-not-exist",
		alreadyUnlocked: "already-unlocked",
		successfullyUnlocked: "successfully-unlocked",
		publisherRestricted: "publisher-restricted",
		notOwnedBySchool: "not-owned-by-school",
		tempUnlocked: "temp-unlocked",
		tempUnlockedMustConfirm: "temp-unlocked-must-confirm",
		tempUnlockedExpired: "temp-unlocked-expired",
	},
	homeScreenBox: {
		search: "home_search",
		unlock: "home_unlock",
		reviewCopies: "home_review_copies",
		reviewRollover: "home_review_rollover", //Rollover box when user expired copies count is 0 after rollover
	},
	extractStatus: {
		editable: "editable",
		active: "active",
		cancelled: "cancelled",
	},
	extractEditableGracePeriodLimit: 14,
	//this is duplicated in controller app
	emailNotificationCategories: [
		{ id: "user-not-unlocked-book", description: "Receive email reminders to unlock my first book" },
		{ id: "user-not-created-copies", description: "Receive email reminders to create my first copy" },
		{ id: "rollover-email", description: "Receive emails with information about the end of the Licence year (“Rollover”) annually" },
		{ id: "multiple-logins-detected", description: "Receive emails when I login with a new device" },
		{ id: "unlock-notification", description: "Receive emails about books I tried to unlock and are now available" },
	],

	contentRequestType: {
		bookRequest: "book-request",
		authorRequest: "author-request",
		publisherRequest: "publisher-request",
		contentTypeRequest: "content-type-request",
		otherRequest: "other-request",
	},
	//this is duplicated in controller app
	allowedPercentageForUserUploadedCopy: 20,
};
