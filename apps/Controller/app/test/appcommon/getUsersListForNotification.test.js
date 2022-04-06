const getUsersListForNotification = require("../../common/getUsersListForNotification");

let props;
let isGetUserList = false;
let mockResultUsersList, mockResult;

const mockTaskDetail = new (class TaskDetail {
	async query(query, data) {
		query = query.replace(/\s+/g, " ");
		if (query.indexOf(`SELECT cla_user.id AS user_id FROM cla_user`) !== -1) {
			isGetUserList = true;
			return mockResultUsersList;
		}
		return;
	}
})();

function resetAll() {
	isGetUserList = false;
	mockResultUsersList = {
		rows: [{ user_id: 3 }],
	};
	mockResult = [
		{
			category_id: 1,
			category_name: "awaiting approval",
			description: "Approval pending for this user",
			link: { static: false, type: "awaiting-approval", value: "test@email.com" },
			oid: "c41b4ecb73e16e2b6e893db0d85174bbb3dd",
			title: "test@email.com",
			user_id: 3,
		},
	];
	props = {
		school_id: 1,
		category_id: 1,
		category_name: "awaiting approval",
		user_email: "test@email.com",
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Get users list for send the notification`, async () => {
	const data = await getUsersListForNotification(
		props.school_id,
		props.category_id,
		props.category_name,
		props.user_email,
		mockTaskDetail.query.bind(mockTaskDetail)
	);
	expect(data.length).toEqual(1);
	expect(data[0].oid).not.toEqual(null);
});

test(`Return balnk array when no argument`, async () => {
	const data = await getUsersListForNotification();
	expect(data).toEqual([]);
});
