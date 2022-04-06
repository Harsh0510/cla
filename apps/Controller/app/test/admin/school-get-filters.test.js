const schoolGetFiltersRaw = require("../../core/admin/school-get-filters");
const Context = require("../common/Context");

let ctx, data;

/**
 * Reset function - called before each test.
 */
function resetAll() {
	ctx = new Context();
	data = getValidRequest();
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

const resultForClaAdmin = {
	result: [
		{
			id: "territory",
			title: "Territory",
			data: [
				{
					id: "england",
					title: "England",
				},
				{
					id: "guernsey",
					title: "Guernsey",
				},
				{
					id: "jersey",
					title: "Jersey",
				},
				{
					id: `isle-of-man`,
					title: `Isle of Man`,
				},
				{
					id: `northern-ireland`,
					title: `Northern Ireland`,
				},
				{
					id: `scotland`,
					title: `Scotland`,
				},
				{
					id: `wales`,
					title: `Wales`,
				},
			],
		},
		{
			id: "school_level",
			title: "Institution Level",
			data: [
				{
					id: `nursery`,
					title: `Nursery`,
				},
				{
					id: `first`,
					title: `First`,
				},
				{
					id: `primary`,
					title: `Primary`,
				},
				{
					id: `infant`,
					title: `Infant`,
				},
				{
					id: `junior`,
					title: `Junior`,
				},
				{
					id: `middle`,
					title: `Middle`,
				},
				{
					id: `secondary`,
					title: `Secondary`,
				},
				{
					id: `high`,
					title: `High`,
				},
				{
					id: `allthrough`,
					title: `All-through`,
				},
				{
					id: `post-16`,
					title: `Post 16`,
				},
				{
					id: `other`,
					title: `Other`,
				},
			],
		},
		{
			id: "school_type",
			title: "Institution Type",
			data: [
				{
					id: `academy`,
					title: `Academy`,
				},
				{
					id: `college`,
					title: `College`,
				},
				{
					id: `free-school`,
					title: `Free school`,
				},
				{
					id: `independent`,
					title: `Independent`,
				},
				{
					id: `la-maintained`,
					title: `LA maintained`,
				},
				{
					id: `special-school`,
					title: `Special school`,
				},
				{
					id: `welsh-school`,
					title: `Welsh school`,
				},
				{
					id: `state-fe`,
					title: `State FE`,
				},
				{
					id: `independent-fe`,
					title: `Independent FE`,
				},
				{
					id: `sixth-form`,
					title: `6th Form`,
				},
				{
					id: `general-fe`,
					title: `General FE`,
				},
				{
					id: `land-college`,
					title: `Land college`,
				},
				{
					id: "adult-learning",
					title: "Adult Learning / Council-run services",
				},
				{
					id: "art-college",
					title: "Art, design and performing arts college",
				},
				{
					id: `other`,
					title: `Other`,
				},
			],
		},
		{
			data: [],
			id: "schools",
			title: "Institutions",
		},
	],
};

async function schoolGetFilters(data) {
	let err = null;
	try {
		ctx.body = await schoolGetFiltersRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function getValidRequest() {
	return {};
}

test(`Error when user not logged in`, async () => {
	ctx.sessionData = null;
	expect(await schoolGetFilters(data)).toEqual(new Error("401 ::: Unauthorized"));
});

test(`Error when user role is not 'cla-admin'`, async () => {
	ctx.sessionData.user_role = "school-admin";
	expect(await schoolGetFilters(data)).toEqual(new Error("401 ::: Unauthorized"));
});

test(`Success when user with cla-admin`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	ctx.doAppQuery = (query, values) => {
		return { rows: [], rowCount: 0 };
	};
	expect(await schoolGetFilters(data)).toBeNull();
	expect(ctx.body).toEqual(resultForClaAdmin);
});

test(`when School Param is provided`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	ctx.doAppQuery = (query, values) => {
		return {
			rows: [
				{ id: 1, title: "test1" },
				{ id: 2, title: "test2" },
			],
			rowCount: 0,
		};
	};
	data.filter_schools = "8,10";
	expect(await schoolGetFilters(data)).toBeNull();
	expect(ctx.body.result[3].data.length).toEqual(2);
});
