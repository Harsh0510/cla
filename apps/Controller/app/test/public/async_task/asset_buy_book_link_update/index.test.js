const assetBuyBookLinkUpdateRaw = require("../../../../core/public/async_task/asset_buy_book_link_update/index");

let mockResultData = null;
let isPushedtoNotificationTask = false;
let isCalledTaskDeleted = false;
let isGetAssetData = false;
let isGetAssetGroupData = false;
let isGetImprintData = false;
let mockImprintData = null;
let isGetPublisherData = false;
let mockPublisherData = null;
let mockAssetGroupData = null;
let mockLink;
let mockTaskDetail = new (class TaskDetail {
	async deleteSelf() {
		isCalledTaskDeleted = true;
	}

	async query(query, data) {
		query = query.replace(/\s+/g, " ");
		if (query.indexOf(`SELECT id, buy_book_rules, isbn13, pdf_isbn13`) !== -1) {
			isGetAssetData = true;
			return mockResultData;
		} else if (query.indexOf(`SELECT id, buy_book_rules FROM asset_group`) !== -1) {
			isGetAssetGroupData = true;
			return mockAssetGroupData;
		} else if (query.indexOf(`SELECT id, buy_book_rules FROM imprint`) !== -1) {
			isGetImprintData = true;
			return mockImprintData;
		} else if (query.indexOf(`SELECT id, buy_book_rules FROM publisher`) !== -1) {
			isGetPublisherData = true;
			return mockPublisherData;
		} else if (query.indexOf(`UPDATE asset SET buy_book_link = v.link,`) !== -1) {
			return null;
		}
	}
})();

jest.mock(`../../../../core/public/async_task/asset_buy_book_link_update/pushTask`, () => {
	return function (task) {
		isPushedtoNotificationTask = true;
	};
});

jest.mock(`../../../../core/public/async_task/asset_buy_book_link_update/getFirstWorkingLink`, () => {
	return async function (...args) {
		return typeof mockLink === "function" ? mockLink(...args) : mockLink;
	};
});

/**
 * Reset function - called before each test.
 */
function resetAll() {
	isPushedtoNotificationTask = false;
	isCalledEnqueueAssetBuyBookLinkUpdate = false;
	isCalledTaskDeleted = false;
	isGetAssetData = false;
	isGetAssetGroupData = false;
	mockLink = "https://google.com";
	mockResultData = {
		rows: [
			{
				id: 1001,
				buy_book_rules: ["http://localhost:16000/products/{{it.asset.isbn13}}"],
				isbn13: "987654321001",
				pdf_isbn13: "987654321001",
				imprint_id: 2001,
				publisher_id: 3001,
				parent_asset_group_id: 0,
				parent_asset_group_identifier_log: null,
			},
			{
				id: 1002,
				buy_book_rules: "",
				isbn13: "987654321001",
				pdf_isbn13: "987654321001",
				imprint_id: 2002,
				publisher_id: 3002,
				parent_asset_group_id: 1,
				parent_asset_group_identifier_log: "XXXXXX",
			},
		],
		rowCount: 2,
	};
	mockImprintData = {
		rows: [
			{ id: 2001, buy_book_rules: ["http://localhost:16000/products/{{it.asset.isbn13}}"] },
			{ id: 2002, buy_book_rules: null },
		],
		rowCount: 2,
	};
	mockPublisherData = {
		rows: [
			{ id: 3001, buy_book_rules: ["http://localhost:16000/products/{{it.asset.isbn13}}"] },
			{ id: 3002, buy_book_rules: null },
		],
		rowCount: 2,
	};
	mockAssetGroupData = {
		rows: [{ id: 1, buy_book_rules: null }],
		rowCount: 1,
	};
	isGetImprintData = false;
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function assetBuyBookLinkUpdate() {
	let err = null;
	try {
		result = await assetBuyBookLinkUpdateRaw(mockTaskDetail);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Function render correctly`, async () => {
	expect(await assetBuyBookLinkUpdate()).toEqual(null);
	expect(isGetAssetData).toEqual(true);

	expect(isPushedtoNotificationTask).toEqual(true);
	expect(isGetAssetData).toEqual(true);
	expect(isCalledTaskDeleted).toEqual(true);
});

test(`Not getting the data for update the buy book link`, async () => {
	mockResultData = { rows: [] };
	expect(await assetBuyBookLinkUpdate()).toEqual(null);
	expect(isGetAssetData).toEqual(true);
	expect(isPushedtoNotificationTask).toEqual(true);
	expect(isGetAssetData).toEqual(true);
	expect(isCalledTaskDeleted).toEqual(true);
});

test(`update asset buy book link based on imprint rules`, async () => {
	mockResultData = {
		rows: [
			{ id: 1001, imprint_id: 2001, publisher_id: 3001 },
			{ id: 1002, imprint_id: 2002, publisher_id: 3002 },
		],
		rowCount: 2,
	};
	mockAssetGroupData = {
		rows: [{ id: 1, buy_book_rules: ["https://amazon.co.uk"] }],
		rowCount: 1,
	};
	mockLink = (rules) => (Array.isArray(rules) && rules.length > 0 ? "https://google.com" : null);
	expect(await assetBuyBookLinkUpdate()).toEqual(null);
	expect(isGetAssetData).toEqual(true);
	expect(isPushedtoNotificationTask).toEqual(true);
	expect(isGetAssetData).toEqual(true);
	expect(isCalledTaskDeleted).toEqual(true);
});

test(`Unknown error`, async () => {
	mockResultData = {
		rows: [
			{ id: 1001, imprint_id: 2001, publisher_id: 3001 },
			{ id: 1002, imprint_id: 2002, publisher_id: 3002 },
		],
		rowCount: 2,
	};
	mockAssetGroupData = {
		rows: [{ id: 1, buy_book_rules: ["https://amazon.co.uk"] }],
		rowCount: 1,
	};
	mockLink = (rules) => (Array.isArray(rules) && rules.length > 0 ? "https://google.com" : null);
	mockTaskDetail.query = (query, data) => {
		query = query.replace(/\s+/g, " ");
		if (query.indexOf(`SELECT id, buy_book_rules, isbn13, pdf_isbn13`) !== -1) {
			isGetAssetData = true;
			return mockResultData;
		} else if (query.indexOf(`SELECT id, buy_book_rules FROM asset_group`) !== -1) {
			isGetAssetGroupData = true;
			return mockAssetGroupData;
		} else if (query.indexOf(`SELECT id, buy_book_rules FROM imprint`) !== -1) {
			isGetImprintData = true;
			return mockImprintData;
		} else if (query.indexOf(`SELECT id, buy_book_rules FROM publisher`) !== -1) {
			isGetPublisherData = true;
			return mockPublisherData;
		} else if (query.indexOf(`UPDATE asset SET buy_book_link = v.link,`) !== -1) {
			throw new Error("Unknown error");
		}
	};

	expect(await assetBuyBookLinkUpdate()).toEqual(new Error("Unknown error"));
});

test(`Ensure modified_by_user_id and date_edited updated successfully in database`, async () => {
	let isIncludeDateEditedTimes = 0;
	mockResultData = {
		rows: [
			{ id: 1001, imprint_id: 2001, publisher_id: 3001 },
			{ id: 1002, imprint_id: 2002, publisher_id: 3002 },
		],
		rowCount: 2,
	};
	mockAssetGroupData = {
		rows: [{ id: 1, buy_book_rules: ["https://amazon.co.uk"] }],
		rowCount: 1,
	};
	mockLink = (rules) => (Array.isArray(rules) && rules.length > 0 ? "https://google.com" : null);
	mockTaskDetail.query = (query, data) => {
		query = query.replace(/\s+/g, " ");
		if (query.indexOf(`SELECT id, buy_book_rules, isbn13, pdf_isbn13`) !== -1) {
			isGetAssetData = true;
			return mockResultData;
		} else if (query.indexOf(`SELECT id, buy_book_rules FROM asset_group`) !== -1) {
			isGetAssetGroupData = true;
			return mockAssetGroupData;
		} else if (query.indexOf(`SELECT id, buy_book_rules FROM imprint`) !== -1) {
			isGetImprintData = true;
			return mockImprintData;
		} else if (query.indexOf(`SELECT id, buy_book_rules FROM publisher`) !== -1) {
			isGetPublisherData = true;
			return mockPublisherData;
		} else if (query.indexOf(`UPDATE asset SET`) !== -1) {
			query.indexOf("date_edited") !== -1 ? isIncludeDateEditedTimes++ : null;
			return null;
		}
	};
	expect(await assetBuyBookLinkUpdate()).toEqual(null);
	expect(isGetAssetData).toEqual(true);
	expect(isPushedtoNotificationTask).toEqual(true);
	expect(isGetAssetData).toEqual(true);
	expect(isCalledTaskDeleted).toEqual(true);
	expect(isIncludeDateEditedTimes).toEqual(2);
});

test(`Ensure modified_by_user_id and date_edited updated successfully in database when unknown error occured`, async () => {
	let isIncludeDateEditedTimes = 0;
	mockResultData = {
		rows: [
			{ id: 1001, imprint_id: 2001, publisher_id: 3001 },
			{ id: 1002, imprint_id: 2002, publisher_id: 3002 },
		],
		rowCount: 2,
	};
	mockAssetGroupData = {
		rows: [{ id: 1, buy_book_rules: ["https://amazon.co.uk"] }],
		rowCount: 1,
	};
	mockLink = (rules) => (Array.isArray(rules) && rules.length > 0 ? "https://google.com" : null);
	mockTaskDetail.query = (query, data) => {
		query = query.replace(/\s+/g, " ");
		if (query.indexOf(`SELECT id, buy_book_rules, isbn13, pdf_isbn13`) !== -1) {
			isGetAssetData = true;
			return mockResultData;
		} else if (query.indexOf(`SELECT id, buy_book_rules FROM asset_group`) !== -1) {
			isGetAssetGroupData = true;
			return mockAssetGroupData;
		} else if (query.indexOf(`SELECT id, buy_book_rules FROM imprint`) !== -1) {
			isGetImprintData = true;
			return mockImprintData;
		} else if (query.indexOf(`SELECT id, buy_book_rules FROM publisher`) !== -1) {
			isGetPublisherData = true;
			return mockPublisherData;
		} else if (query.indexOf(`UPDATE asset SET buy_book_link_began_updating = NOW()`) !== -1) {
			query.indexOf("date_edited") !== -1 ? isIncludeDateEditedTimes++ : null;
			return null;
		} else if (query.indexOf(`UPDATE asset SET buy_book_link = v.link`) !== -1) {
			query.indexOf("date_edited") !== -1 ? isIncludeDateEditedTimes++ : null;
			throw new Error("");
		} else if (query.indexOf(`UPDATE asset SET buy_book_link_began_updating = NULL`) !== -1) {
			query.indexOf("date_edited") !== -1 ? isIncludeDateEditedTimes++ : null;
			return null;
		}
	};
	expect(await assetBuyBookLinkUpdate()).toEqual(new Error(""));
	expect(isIncludeDateEditedTimes).toEqual(3);
});
