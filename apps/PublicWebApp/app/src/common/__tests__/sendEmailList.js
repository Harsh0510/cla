import sendEmailList from "../sendEmailList";

/** returns Object correctly */
test(`Count Object size`, async () => {
	const item = Object.keys(sendEmailList);
	expect(item.length).toBe(2);
});

test(`Object have supportEP key`, async () => {
	const item = sendEmailList.hasOwnProperty("supportEP") ? true : false;
	expect(item).toBe(true);
});

test(`Object have supportCLA key`, async () => {
	const item = sendEmailList.hasOwnProperty("supportCLA") ? true : false;
	expect(item).toBe(true);
});
