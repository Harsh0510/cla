const { getObj } = require("../../common/getUnlockAttemptFormattedObject");

const dummyData = {
	user_id: 765,
	user_email: "test@dummy.com",
	school_id: 7,
	school_name: "dummt School name",
	isbn: "123456789",
	status: "sucess",
	asset_id: 7796,
};

test("Returns formated object", () => {
	const passExrtaData = Object.assign(dummyData, {
		extraParam: 1,
		extraParam2: 2,
	});
	const response = getObj(passExrtaData);
	expect(response).not.toHaveProperty(["extraParam", "extraParam2"]);
});
