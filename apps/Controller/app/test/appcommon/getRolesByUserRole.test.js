const getRolesByUserRole = require("../../common/getRolesByUserRole");

let mockClaResult, mockSchoolResult, userRole;

function resetAll() {
	userRole = {
		claAdmin: "cla-admin",
		schoolAdmin: "school-admin",
	};
	mockClaResult = [
		{
			id: "teacher",
			name: "User",
		},
		{
			id: `cla-admin`,
			name: `CLA Admin`,
		},
		{
			id: "school-admin",
			name: "Institution Admin",
		},
	];
	mockSchoolResult = [
		{
			id: "teacher",
			name: "User",
		},
		{
			id: "school-admin",
			name: "Institution Admin",
		},
	];
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Return role when user login with cla-admin`, async () => {
	const item = getRolesByUserRole(userRole.claAdmin);
	expect(item).toEqual(mockClaResult);
});

test(`Return role when user login with school-admin`, async () => {
	const item = getRolesByUserRole(userRole.schoolAdmin);
	expect(item).toEqual(mockSchoolResult);
});

test(`Return null when not pass any current user role`, async () => {
	const item = getRolesByUserRole();
	expect(item).toEqual([]);
});
