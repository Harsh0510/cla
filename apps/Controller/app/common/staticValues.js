module.exports = {
	userRoles: {
		claAdmin: "cla-admin",
		schoolAdmin: "school-admin",
		teacher: "teacher",
		viewers: "viewers",
	},
	notificationCategories: {
		awaitingApproval: {
			code: "awaiting-approval",
		},
		unlocked: {
			code: "unlocked",
		},
		classAdded: {
			code: "class-added",
		},
		unlock_book_by_image: {
			code: "book-unlock",
		},
	},
	notification: {
		tableName: "notification",
		fields: ["user_id", "oid", "category_id", "title", "subtitle", "description", "link", "hideable_log", "high_priority"],
	},
	unlockEvents: {
		userCamera: "user-camera",
		userImage: "user-image",
		userCla: "user-cla",
		userBulkSchool: "bulk-school",
		userBulkCla: "bulk-cla",
		userTempUnlock: "temp-unlock",
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

	//this is duplicated in PublicWebApp app
	// these MUST be SQL safe - i.e. no quotes, just letters, numbers, dashes and underscores
	emailNotificationCategory: {
		userNotUnlockedBook: "user-not-unlocked-book",
		userNotCreatedCopies: "user-not-created-copies",
		rolloverEmail: "rollover-email",
		multipleLoginsDetected: "multiple-logins-detected",
		unlockNotification: "unlock-notification",
	},

	contentRequestType: {
		bookRequest: "book-request",
		authorRequest: "author-request",
		publisherRequest: "publisher-request",
		contentTypeRequest: "content-type-request",
		otherRequest: "other-request",
	},
	activationReminderEmailCategory: {
		reminder1A: "activation-reminder-email-1A",
		reminder1B: "activation-reminder-email-1B",
		reminder2A: "activation-reminder-email-2A",
		reminder2B: "activation-reminder-email-2B",
		reminder3A: "activation-reminder-email-3A",
		reminder3B: "activation-reminder-email-3B",
	},
	activationTokenExpiryLimitInDays: 7,
	userStatus: {
		unverified: "unverified",
		approved: "approved",
		registered: "registered",
		pending: "pending",
	},
	//this is duplicated in PublicWebApp app
	allowedPercentageForUserUploadedCopy: 20,
};
