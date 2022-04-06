const MockNotification = {
	notificationCategories: {
		items: [
			{
				id: 1,
				description: "Receive notifications about users awaiting approval",
				hideable: true,
			},
			{
				id: 2,
				description: "Receive notifications about books I tried to unlock and are now available",
				hideable: true,
			},
			{
				id: 3,
				description: "Receive notifications about new classes being added",
				hideable: false,
			},
		],
	},
	disableCategories: {
		items: [],
	},
	formFieldsData: {
		disabled_categories: [],
		email: "",
		first_name: "",
		job_title: "",
		last_name: "",
		name_display_preference: "",
		title: "",
		receive_marketing_emails: false,
		flyout_enabled: true,
		email_opt_out: [],
	},
};
export default MockNotification;
