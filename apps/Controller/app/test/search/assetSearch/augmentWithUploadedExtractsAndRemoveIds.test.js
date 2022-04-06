const func = require("../../../core/search/assetSearch/augmentWithUploadedExtractsAndRemoveIds");

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
	const extracts = [
		{
			asset_id: 10,
			upload_name: "frag10",
			pages: [1, 2],
			oid: "8223b713aa71415463f183856681f9ab6033",
		},
		{
			asset_id: 20,
			upload_name: "frag20",
			pages: [1, 2],
			oid: "8223b713aa71415463f183856681f9ab6033",
		},
		{
			asset_id: 10,
			upload_name: "frag10b",
			pages: [1, 2],
			oid: "8223b713aa71415463f183856681f9ab6033",
		},
		{
			asset_id: 10,
			upload_name: "frag10c",
			pages: [1, 2],
			oid: "8223b713aa71415463f183856681f9ab6033",
		},
	];
	await func(
		() => ({
			rows: extracts,
		}),
		results
	);
	expect(results).toEqual([
		{
			title: "X",
			uploadedExtracts: [
				{ title: "frag10", page_range: [1, 2], oid: "8223b713aa71415463f183856681f9ab6033" },
				{
					title: "frag10b",
					page_range: [1, 2],
					oid: "8223b713aa71415463f183856681f9ab6033",
				},
				{
					title: "frag10c",
					page_range: [1, 2],
					oid: "8223b713aa71415463f183856681f9ab6033",
				},
			],
		},
		{
			title: "Y",
			uploadedExtracts: [
				{
					title: "frag20",
					page_range: [1, 2],
					oid: "8223b713aa71415463f183856681f9ab6033",
				},
			],
		},
		{
			title: "Z",
		},
	]);
});

test("Works correctly with search", async () => {
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
	const extracts = [
		{
			asset_id: 10,
			upload_name: "test",
			pages: [1, 2],
			oid: "8223b713aa71415463f183856681f9ab6033",
		},
	];
	await func(
		() => ({
			rows: extracts,
		}),
		results,
		"test"
	);
	expect(results).toEqual([
		{
			title: "X",
			uploadedExtracts: [{ title: "test", page_range: [1, 2], oid: "8223b713aa71415463f183856681f9ab6033" }],
		},
		{
			title: "Y",
		},
		{
			title: "Z",
		},
	]);
});
