/**
 * Mock Classes/Course data
 */
const Author = [
	{
		firstName: "Romes",
		lastName: "wille",
	},
	{
		firstName: "Jerry",
		lastName: "tom",
	},
];

const UnlockedTitle = [
	{
		title: "English",
		isbn13: "9781906622701",
		authors: Author,
		description: "this is book 1",
	},
	{
		title: "English",
		isbn13: "9781906622702",
		authors: Author,
		description: "this is book 2",
	},
];

export default {
	result: {
		unlocked: UnlockedTitle,
		errors: [
			{
				location: "A1",
				message: "Invalid ISBN",
				value: "1320007138784",
			},
		],
	},
};
