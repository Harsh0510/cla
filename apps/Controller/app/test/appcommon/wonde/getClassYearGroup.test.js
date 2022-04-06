const yg = require("../../../common/wonde/getClassYearGroup");

const DEFAULT = "Wonde class";

test(`Defaults`, async () => {
	expect(yg(null)).toBe(DEFAULT);
	expect(yg({})).toBe(DEFAULT);
	expect(
		yg({
			students: null,
		})
	).toBe(DEFAULT);
	expect(
		yg({
			students: {},
		})
	).toBe(DEFAULT);
	expect(
		yg({
			students: {
				data: null,
			},
		})
	).toBe(DEFAULT);
	expect(
		yg({
			students: {
				data: [],
			},
		})
	).toBe(DEFAULT);
});

test(`Single class`, async () => {
	expect(
		yg({
			students: {
				data: [
					{
						year: {
							data: {
								description: "My class",
							},
						},
					},
				],
			},
		})
	).toBe("My class");

	expect(
		yg({
			students: {
				data: [
					{
						year: {
							data: {
								type: "YEAR",
								name: "12",
							},
						},
					},
				],
			},
		})
	).toBe("Year 12");

	// Description takes priority
	expect(
		yg({
			students: {
				data: [
					{
						year: {
							data: {
								description: "My description",
								type: "YEAR",
								name: "4",
							},
						},
					},
				],
			},
		})
	).toBe("My description");
});

test(`Multiple classes`, async () => {
	expect(
		yg({
			students: {
				data: [
					{
						year: {
							data: {
								description: "First class",
							},
						},
					},
					{
						year: {
							data: {
								description: "Second class",
							},
						},
					},
				],
			},
		})
	).toBe("First class");

	expect(
		yg({
			students: {
				data: [
					{
						year: {
							data: {
								type: "YEAR",
								name: "12",
							},
						},
					},
					{
						year: {
							data: {
								type: "YEAR",
								name: "10",
							},
						},
					},
				],
			},
		})
	).toBe("Years 10 and 12");

	expect(
		yg({
			students: {
				data: [
					{
						year: {
							data: {
								type: "YEAR",
								name: "7",
							},
						},
					},
					{
						year: {
							data: {
								description: "First class",
							},
						},
					},
					{
						year: {
							data: {
								type: "YEAR",
								name: "8",
							},
						},
					},
				],
			},
		})
	).toBe("Years 7 and 8");

	expect(
		yg({
			students: {
				data: [
					{
						year: {
							data: {
								type: "YEAR",
								name: "12",
							},
						},
					},
					{
						year: {
							data: {
								type: "YEAR",
								name: "3",
							},
						},
					},
					{
						year: {
							data: {
								type: "YEAR",
								name: "10",
							},
						},
					},
				],
			},
		})
	).toBe("Years 3, 10 and 12");
});
