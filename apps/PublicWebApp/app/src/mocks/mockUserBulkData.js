const MockFileJsonData = [
	{
		"Last Name": "Patel",
		"First Name": "Mitanshu",
		Title: "Mr",
		"Job Title": "teacher",
		Email: "mitanshu.patel@radixweb.com",
	},
	{
		"Last Name": "Soni",
		"First Name": "Vaibhav",
		Title: "Mr",
		"Job Title": "teacher",
		Email: "vaibhav.soni@radixweb.com",
	},
	{
		"Last Name": "Test 12123@",
		"First Name": "@bhaskask",
		Title: "Mr",
		"Job Title": "asalsas",
		Email: "jigar.khalsh@radixweb.com",
	},
	{
		"Last Name": "Test ",
		"First Name": "test ",
		Title: "Mr",
		"Job Title": "test",
		Email: "asasasa",
	},
	{
		"Last Name": "Tarjani",
		"First Name": "Pandya",
		Title: "Ms",
		"Job Title": "teacher",
		Email: "tarjani.pandya@radixweb.com",
	},
];

const MockBulkUploadSuccessResult = [
	{
		success: true,
		origUser: {
			email: "mitanshu.patel@radixweb.com",
			first_name: "Mitanshu",
			job_title: "teacher",
			last_name: "Patel",
			role: "teacher",
			school_id: 65,
			title: "Mr",
		},
	},
];

const MockBulkUploadErrorsResult = [
	{
		index: 3,
		origUser: {
			last_name: "Test ",
			first_name: "test ",
			title: "Mr",
			job_title: "test",
			email: "asasasa",
			role: "teacher",
		},
		message: "A user with that email already exists",
	},
	{
		index: 4,
		origUser: {
			last_name: "Tarjani",
			first_name: "Pandya",
			title: "Ms",
			job_title: "teacher",
			email: "tarjani.pandya@radixweb.com",
			role: "teacher",
		},
		message: "First name should not contain special characters",
	},
];

const MockBulkUploadResult = {
	results: [
		{ success: true },
		{ success: true },
		{ success: true },
		{ success: false, message: "A user with that email already exists", httpcode: 400 },
		{ success: false, message: "First name should not contain special characters", httpcode: 400 },
		{ success: false, message: "Email not valid", httpcode: 400 },
	],
};

module.exports = { MockFileJsonData, MockBulkUploadSuccessResult, MockBulkUploadErrorsResult, MockBulkUploadResult };
