let annotateImageResult = null;

class MockImageAnnotatorClient {
	constructor(opts) {
		this._opts = opts;
	}
	async annotateImage(opts) {
		if (annotateImageResult && annotateImageResult instanceof Error) {
			throw annotateImageResult;
		}
		return annotateImageResult;
	}
}

jest.mock("@google-cloud/vision", () => ({
	ImageAnnotatorClient: MockImageAnnotatorClient,
}));

const IsbnFromImageViaGoogleExtractor = require("../../common/IsbnFromImageViaGoogleExtractor");

beforeEach(() => {
	annotateImageResult = null;
});

const quickTest = (name, result, expected) =>
	test(name, async () => {
		const client = new IsbnFromImageViaGoogleExtractor();
		const old = annotateImageResult;
		annotateImageResult = result;
		const res = await client.parse();
		annotateImageResult = old;
		expect(res).toEqual(expected);
	});

quickTest(
	"Simplest possible ISBN 13",
	[
		{
			fullTextAnnotation: {
				text: "9780590135115",
			},
			localizedObjectAnnotations: [
				{
					name: "1D barcode",
					score: 0.85,
				},
			],
		},
	],
	{
		isbn: "9780590135115",
	}
);

quickTest(
	"Simple ISBN 13 with some hyphens but no surrounding text",
	[
		{
			fullTextAnnotation: {
				text: "978-3-16-148410-0",
			},
			localizedObjectAnnotations: [
				{
					name: "1D barcode",
					score: 0.85,
				},
			],
		},
	],
	{
		isbn: "9783161484100",
	}
);

quickTest(
	"Simplest possible ISBN 10",
	[
		{
			fullTextAnnotation: {
				text: "1402704100",
			},
			localizedObjectAnnotations: [
				{
					name: "1D barcode",
					score: 0.8,
				},
			],
		},
	],
	{
		isbn: "9781402704109",
	}
);

quickTest(
	"Simplest possible ISBN 10 (2)",
	[
		{
			fullTextAnnotation: {
				text: "0198534531",
			},
			localizedObjectAnnotations: [
				{
					name: "1D barcode",
					score: 0.8,
				},
			],
		},
	],
	{
		isbn: "9780198534532",
	}
);

quickTest(
	"ISBN 10 with some hyphens but no surrounding text",
	[
		{
			fullTextAnnotation: {
				text: "0-19-853453-1",
			},
			localizedObjectAnnotations: [
				{
					name: "1D barcode",
					score: 0.8,
				},
			],
		},
	],
	{
		isbn: "9780198534532",
	}
);

quickTest(
	"Multiple unique valid ISBN 10s should be rejected",
	[
		{
			fullTextAnnotation: {
				text: `0-19-853453-1 1402704100`,
			},
			localizedObjectAnnotations: [
				{
					name: "1D barcode",
					score: 0.8,
				},
			],
		},
	],
	{
		error: {
			message: "More than one ISBN10 found [before replacement]",
			code: 70,
			text: `0-19-853453-1 1402704100`,
		},
	}
);

quickTest(
	"Multiple unique valid ISBN 13s should be rejected",
	[
		{
			fullTextAnnotation: {
				text: "9780590135115, 978-3-16-148410-0",
			},
			localizedObjectAnnotations: [
				{
					name: "1D barcode",
					score: 0.8,
				},
			],
		},
	],
	{
		error: {
			message: "More than one ISBN13 found [before replacement]",
			code: 70,
			text: `9780590135115, 978-3-16-148410-0`,
		},
	}
);

quickTest(
	"Multiple valid ISBN 13s are fine if they're all the same",
	[
		{
			fullTextAnnotation: {
				text: "9-78-3-16-148-4-10-0, 9783161484100, 978-3-16-148410-0",
			},
			localizedObjectAnnotations: [
				{
					name: "1D barcode",
					score: 0.8,
				},
			],
		},
	],
	{
		isbn: `9783161484100`,
	}
);

quickTest(
	"Multiple valid ISBN 10s and ISBN 13s are fine if they all convert to the same",
	[
		{
			fullTextAnnotation: {
				text: "0-19-853453-1 9780198534532",
			},
			localizedObjectAnnotations: [
				{
					name: "1D barcode",
					score: 0.8,
				},
			],
		},
	],
	{
		isbn: `9780198534532`,
	}
);

quickTest(
	"ISBN 10 with no surrounding text, but with similar characters",
	[
		{
			fullTextAnnotation: {
				text: "O|98-534-531", // O for 0, | for one of the 1s
			},
			localizedObjectAnnotations: [
				{
					name: "1D barcode",
					score: 0.8,
				},
			],
		},
	],
	{
		isbn: "9780198534532",
	}
);

quickTest(
	"ISBN 13 with no surrounding text, but with similar characters",
	[
		{
			fullTextAnnotation: {
				text: "9783|614841O0", // O for 0, | for one of the 1s
			},
			localizedObjectAnnotations: [
				{
					name: "1D barcode",
					score: 0.8,
				},
			],
		},
	],
	{
		isbn: "9783161484100",
	}
);

quickTest(
	"ISBN 10 that starts after lots of numbers",
	[
		{
			fullTextAnnotation: {
				text: "23-45-26 263-4 56-47 5 O|98-534-531 fiooo sdfh9825h soifio",
			},
			localizedObjectAnnotations: [
				{
					name: "1D barcode",
					score: 0.8,
				},
			],
		},
	],
	{
		isbn: "9780198534532",
	}
);

quickTest(
	"ISBN 13 that starts after lots of numbers",
	[
		{
			fullTextAnnotation: {
				text: "23-45-26 263-4 56-27 5 97-8316-1484-1-00 fiooo sdfh9825h soifio",
			},
			localizedObjectAnnotations: [
				{
					name: "1D barcode",
					score: 0.8,
				},
			],
		},
	],
	{
		isbn: "9783161484100",
	}
);

quickTest(
	"Realistic ISBN with lots of surrounding text (1)",
	[
		{
			fullTextAnnotation: {
				text: "000 SHOT ON MI 9\nAI TRIPLE CAMERA\nre ad m ore\nISBN 0-713--99677-3\n9780713 996777\npenguin com\n",
			},
			localizedObjectAnnotations: [
				{
					name: "1D barcode",
					score: 0.8,
				},
			],
		},
	],
	{
		isbn: "9780713996777",
	}
);

quickTest(
	"Realistic ISBN with lots of surrounding text (2)",
	[
		{
			fullTextAnnotation: {
				text: '000 RIPLE CAMERA\nSHOT ON MI 9\nAI\nISBN 0-590-13511-2\n9 780590"135115">\n',
			},
			localizedObjectAnnotations: [
				{
					name: "1D barcode",
					score: 0.8,
				},
			],
		},
	],
	{
		isbn: "9780590135115",
	}
);

quickTest(
	"Realistic ISBN with lots of surrounding text (3)",
	[
		{
			fullTextAnnotation: {
				text:
					"THE DEFINITIVE GUIDE TO THE ENNEAGRAM\nOVER 350,000 COPIES SOLD WORLDWIDE\nPersonality Types has become the indispensable resource in the field of Ennea-\ngram studies, as well as a cherished classic in the literature of personal growth\naround the world. This second edition is not only a monumental intellectual\nachievement representing the culmination of more than twenty years of work, it is\na landmark in the history of psychology and human understanding.\nFor the first time, the landscape of human personality has been completely\nmapped out - from the high-functioning states of ego transcendence to the\ndepths of pathology. Unequaled in the Enneagram field, the authors provide pre-\ncise and comprehensive systematic descriptions of each personality type, as\nwell as new, expanded descriptions of each type's two major subtypes and its\nDirections of Integration and Disintegration. Augmented by more than 150 pages,\nthis entirely revised edition reveals new insights that have never been published\nbefore, including the authors' revolutionary discovery, the Core Dynamics, Which\ngive the specific motivations, attitudes, fears, and desires at each of the nine in-\nternal Levels of Development for each type, as well as the parental influgnees on\neach type, an expanded history of the Enneagram, new material on the Instino-\ntual Variants, and much, much more.\nThe Peacemaker\nThe Leader .\n1 The Reformer\nThe Enthusiast 7\n2 The Helper\nThe Loyalist 6\n3 The Motivator\nThe Investigator 5\n4 The Individualist\n\"No Enneagram teachers I've come across offer such a rich and dynamic picture\nof how each personality type expresses itself in the world, and the process by\nwhich we can move through progressive stages of psychological and spiritual\ngrowth.\"- Tony Schwartz, author of What Really Matters: Searching for\nWisdom in America\nISBN 0-395-79867-1\nCover design:\nO CHfford Stoltze Design\n90000\n6-94691\n1096\n9 780395 798676\nSHOT ON MI9\nAI TRIPLE CAMERA\n",
			},
			localizedObjectAnnotations: [
				{
					name: "1D barcode",
					score: 0.8,
				},
			],
		},
	],
	{
		isbn: "9780395798676",
	}
);

quickTest("Syntactically malformed google response", 12345, {
	error: {
		message: `Unexpected response - the response is not an array`,
		code: 20,
	},
});

quickTest(
	"No OCR text detected whatsoever (1)",
	[
		{
			localizedObjectAnnotations: [
				{
					name: "1D barcode",
					score: 0.8,
				},
			],
		},
	],
	{
		error: {
			message: `No text detected`,
			code: 30,
		},
	}
);

quickTest(
	"No OCR text detected whatsoever (2)",
	[
		{
			fullTextAnnotation: {
				text: "", // no text
			},
			localizedObjectAnnotations: [
				{
					name: "1D barcode",
					score: 0.8,
				},
			],
		},
	],
	{
		error: {
			message: `No text detected`,
			code: 30,
		},
	}
);

quickTest(
	"Not a barcode at all",
	[
		{
			fullTextAnnotation: {
				text: "9780395798676",
			},
			localizedObjectAnnotations: [
				{
					name: "text",
					score: 0.67,
				},
			],
		},
	],
	{
		error: {
			message: `No 1D barcodes found`,
			code: 50,
			text: "9780395798676",
		},
	}
);

quickTest(
	"Not confident enough it's barcode",
	[
		{
			fullTextAnnotation: {
				text: "9780395798676",
			},
			localizedObjectAnnotations: [
				{
					name: "nature",
					score: 0.7,
				},
				{
					name: "1D barcode",
					score: 0.19, // not confident enough
				},
			],
		},
	],
	{
		error: {
			message: `No 1D barcodes of sufficient confidence found`,
			code: 60,
			text: "9780395798676",
		},
	}
);

quickTest(
	"No tags detected whatsoever",
	[
		{
			fullTextAnnotation: {
				text: "9780395798676",
			},
			localizedObjectAnnotations: null,
		},
	],
	{
		error: {
			message: `Unexpected response - no localizedObjectAnnotations`,
			code: 40,
			text: "9780395798676",
		},
	}
);

const e = new Error("abc123");
e.stack = "def456";
quickTest("Unexpected exception thrown", e, {
	error: {
		message: `Exception thrown: abc123 [def456]`,
		code: 10,
	},
});
