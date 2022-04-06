const func = require("../../../core/search/assetSearch/augmentWithFragmentsAndRemoveIds");

test("Works correctly", async () => {
	const results = [
		{
			id: 10,
			title: "X",
		},
		{
			id: 20,
			title: "Y",
		},
		{
			id: 30,
			title: "Z",
		},
	];
	const fragments = [
		{
			asset_id: 10,
			title: "frag10",
			start_page: 100,
		},
		{
			asset_id: 20,
			title: "frag20",
			start_page: 200,
		},
		{
			asset_id: 10,
			title: "frag10b",
			start_page: 120,
		},
		{
			asset_id: 10,
			title: "frag10c",
			start_page: 110,
		},
	];
	await func(
		() => ({
			rows: fragments,
		}),
		results,
		"abc"
	);
	expect(results).toEqual([
		{
			title: "X",
			fragments: [
				{
					title: "frag10",
					start_page: 100,
				},
				{
					title: "frag10b",
					start_page: 120,
				},
				{
					title: "frag10c",
					start_page: 110,
				},
			],
		},
		{
			title: "Y",
			fragments: [
				{
					title: "frag20",
					start_page: 200,
				},
			],
		},
		{
			title: "Z",
		},
	]);
});

test("Works correctly fragment search", async () => {
	const results = [
		{
			id: 19896,
			title: "BBC History Revealed test 2",
		},
	];
	const fragments = [
		{
			asset_id: 19896,
			title: "BBC History Revealed test 2",
			start_page: 7,
			description: "BBC [[[History]]] Revealed test 2 description",
		},
		{
			asset_id: 19896,
			title: "BBC History Revealed test 1",
			start_page: 85,
			description: " [[[History]]] BBC  Revealed test 1 BBC description",
		},
	];
	await func(
		() => ({
			rows: fragments,
		}),
		results,
		"history"
	);
	expect(results).toEqual([
		{
			fragments: [
				{
					description: '"BBC <strong>History</strong> Revealed test 2 description"',
					start_page: 7,
					title: "BBC History Revealed test 2",
				},
				{
					description: '" <strong>History</strong> BBC Revealed test 1..."',
					start_page: 85,
					title: "BBC History Revealed test 1",
				},
			],
			title: "BBC History Revealed test 2",
		},
	]);
});

test("Works correctly fragment search with special charactors", async () => {
	const results = [
		{
			id: 19896,
			title: "BBC History Revealed test 2",
		},
	];
	const fragments = [
		{
			asset_id: 19896,
			title: "BBC History Revealed test 2",
			start_page: 7,
			description: ">BBC& [[[History]]] Revealed test 2 description",
		},
		{
			asset_id: 19896,
			title: "BBC History Revealed test 1",
			start_page: 85,
			description: ' [[[History]]] "BBC<  Revealed test 1 BBC description',
		},
	];
	await func(
		() => ({
			rows: fragments,
		}),
		results,
		'>history&<@"'
	);
	expect(results).toEqual([
		{
			fragments: [
				{
					description: '"&lt;BBC&amp; <strong>History</strong> Revealed test 2 description"',
					start_page: 7,
					title: "BBC History Revealed test 2",
				},
				{
					description: '" <strong>History</strong> &quot;BBC&lt; Revealed test 1..."',
					start_page: 85,
					title: "BBC History Revealed test 1",
				},
			],
			title: "BBC History Revealed test 2",
		},
	]);
});

test("Works correctly when fragment description is long", async () => {
	const results = [
		{
			id: 19896,
			title: "BBC History Revealed test 2",
		},
	];
	const fragments = [
		{
			asset_id: 19896,
			title: "BBC History Revealed test 2",
			start_page: 7,
			description: "BBC description description description bbc bbc [[[History]]] Revealed test 2 description",
		},
	];
	await func(
		() => ({
			rows: fragments,
		}),
		results,
		'>history&<@"'
	);
	expect(results).toEqual([
		{
			fragments: [
				{
					description: '"...description description bbc bbc <strong>History</strong> Revealed test 2 description"',
					start_page: 7,
					title: "BBC History Revealed test 2",
				},
			],
			title: "BBC History Revealed test 2",
		},
	]);
});
