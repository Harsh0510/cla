const XmlNode = require("../../../core/admin/lib/XmlNode");
const parseXmlString = require("../../common/parseXmlString");
//const cssSelect = require('css-select');

let p, xmlValue, xmlValue_Multi, actualXMlData;

function resetAll() {
	p = {};
	xmlValue = `<Product>
		<Parent1>
			<abc>Hi, Today is great day!</abc>
		</Parent1>
	</Product>`;
	xmlValue_Multi = `<Product>
		<Parent1>
			<Header>Header Title 1</Header>
			<abc>Row 1</abc>
		</Parent1>
		<Parent2>
			<Header>Header Title 2</Header>
			<abc>Row 2</abc>
		</Parent2>
	</Product>`;
	actualXMlData = `
	<TextContent>
		<TextType>04</TextType>
		<ContentAudience>05</ContentAudience>
		<Text textformat="05">
			<div class="toc">
				<ul>
					<li>
					<span class="label">Introduction</span>
					<span class="page">7</span>
					</li>
					<li>
					<span class="label">Some notes on Chaucer's usage of Middle English</span>
					<span class="page">30</span>
					</li>
				</ul>
			</div>
		</Text>
	</TextContent>`;
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Test 1`, async () => {
	xmlValue = `<Product><abc>Hi, Today is great day!</abc></Product>`;
	const myXmlNode = await parseXmlString(xmlValue);
	const objXmlNode = new XmlNode(myXmlNode);
	objXmlNode.type = myXmlNode.type;
	objXmlNode.name = myXmlNode.name;
	objXmlNode.children = myXmlNode.children;
	objXmlNode.attribs = myXmlNode.attribs;

	let result = null,
		error = null,
		selector = "abc";
	try {
		result = objXmlNode.query(selector);
	} catch (e) {
		error = e;
	}

	expect(result).not.toBeNull();
	expect(result[0].name).toEqual(selector);
	expect(result[0].children[0].data).toEqual("Hi, Today is great day!");
	expect(error).toBeNull();
});

test(`Error invalid xml`, async () => {
	let result = null,
		error = null,
		selector = "abc";
	try {
		xmlValue = `<Product>abc> Hi, Today is great day!</abc></Product>`;
		const myXmlNode = await parseXmlString(xmlValue);
	} catch (e) {
		error = e.toString().trim().replace(/\s+/g, " ");
	}

	expect(result).toBeNull();
	expect(error).toEqual(`Error: Unexpected close tag Line: 0 Column: 43 Char: >`);
});

describe("Query", () => {
	test(`Find the selector as 'abc'`, async () => {
		let result = null,
			error = null,
			selector = "abc";
		try {
			const myXmlNode = await parseXmlString(xmlValue);
			const objXmlNode = new XmlNode(myXmlNode);

			objXmlNode.type = myXmlNode.type;
			objXmlNode.name = myXmlNode.name;
			objXmlNode.children = myXmlNode.children;
			objXmlNode.attribs = myXmlNode.attribs;

			result = objXmlNode.query(selector);
		} catch (e) {
			error = e;
		}

		expect(result).not.toBeNull();
		expect(result[0].name).toEqual(selector);
		expect(result[0].children[0].data).toEqual("Hi, Today is great day!");
		expect(error).toBeNull();
	});

	test(`Find the selector as 'Test'`, async () => {
		let result = null,
			error = null,
			selector = "Test";
		try {
			const myXmlNode = await parseXmlString(xmlValue);
			const objXmlNode = new XmlNode(myXmlNode);

			objXmlNode.type = myXmlNode.type;
			objXmlNode.name = myXmlNode.name;
			objXmlNode.children = myXmlNode.children;
			objXmlNode.attribs = myXmlNode.attribs;

			result = objXmlNode.query(selector);
		} catch (e) {
			error = e;
		}

		expect(result.toString()).toEqual("");
		expect(error).toBeNull();
	});
});

describe("queryAsRoot", () => {
	test(`Find the selector as 'abc'`, async () => {
		let result = null,
			error = null,
			selector = "abc";
		try {
			const myXmlNode = await parseXmlString(xmlValue);
			const objXmlNode = new XmlNode(myXmlNode);

			objXmlNode.type = myXmlNode.type;
			objXmlNode.name = myXmlNode.name;
			objXmlNode.children = myXmlNode.children;
			objXmlNode.attribs = myXmlNode.attribs;

			result = objXmlNode.queryAsRoot(selector);
		} catch (e) {
			error = e;
		}

		expect(result).not.toBeNull();
		expect(result[0].name).toEqual(selector);
		expect(result[0].children[0].data).toEqual("Hi, Today is great day!");
		expect(result[0].parent.type).toEqual("tag");
		expect(result[0].parent.name).toEqual("Parent1");
		expect(error).toBeNull();
	});

	test(`Find the selector as 'Test'`, async () => {
		let result = null,
			error = null,
			selector = "Test";
		try {
			const myXmlNode = await parseXmlString(xmlValue);
			const objXmlNode = new XmlNode(myXmlNode);

			objXmlNode.type = myXmlNode.type;
			objXmlNode.name = myXmlNode.name;
			objXmlNode.children = myXmlNode.children;
			objXmlNode.attribs = myXmlNode.attribs;

			result = objXmlNode.queryAsRoot(selector);
		} catch (e) {
			error = e;
		}

		expect(result.toString()).toEqual("");
		expect(error).toBeNull();
	});
});

describe("queryOne", () => {
	test(`Find the selector as 'abc'`, async () => {
		let result = null,
			error = null,
			selector = "abc";
		try {
			const myXmlNode = await parseXmlString(xmlValue);
			const objXmlNode = new XmlNode(myXmlNode);

			objXmlNode.type = myXmlNode.type;
			objXmlNode.name = myXmlNode.name;
			objXmlNode.children = myXmlNode.children;
			objXmlNode.attribs = myXmlNode.attribs;

			result = objXmlNode.queryOne(selector);
		} catch (e) {
			error = e;
		}

		expect(result).not.toBeNull();
		expect(result.name).toEqual(selector);
		expect(result.children[0].data).toEqual("Hi, Today is great day!");
		expect(result.parent.type).toEqual("tag");
		expect(result.parent.name).toEqual("Parent1");
		expect(error).toBeNull();
	});

	test(`Find the selector as 'Test'`, async () => {
		let result = null,
			error = null,
			selector = "Test";
		try {
			const myXmlNode = await parseXmlString(xmlValue);
			const objXmlNode = new XmlNode(myXmlNode);

			objXmlNode.type = myXmlNode.type;
			objXmlNode.name = myXmlNode.name;
			objXmlNode.children = myXmlNode.children;
			objXmlNode.attribs = myXmlNode.attribs;

			result = objXmlNode.queryOne(selector);
		} catch (e) {
			error = e;
		}

		expect(result).toBeNull();
		expect(error).toBeNull();
	});
});

describe("queryOneAsRoot", () => {
	test(`Find the selector as 'abc'`, async () => {
		let result = null,
			error = null,
			selector = "abc";
		try {
			const myXmlNode = await parseXmlString(xmlValue);
			const objXmlNode = new XmlNode(myXmlNode);

			objXmlNode.type = myXmlNode.type;
			objXmlNode.name = myXmlNode.name;
			objXmlNode.children = myXmlNode.children;
			objXmlNode.attribs = myXmlNode.attribs;

			result = objXmlNode.queryOneAsRoot(selector);
		} catch (e) {
			error = e;
		}

		expect(result).not.toBeNull();
		expect(result.name).toEqual(selector);
		expect(result.children[0].data).toEqual("Hi, Today is great day!");
		expect(result.parent.type).toEqual("tag");
		expect(result.parent.name).toEqual("Parent1");
		expect(result.prev).not.toBeNull();
		expect(result.next).not.toBeNull();
		expect(error).toBeNull();
	});

	test(`Find the selector as 'Test'`, async () => {
		let result = null,
			error = null,
			selector = "Test";
		try {
			const myXmlNode = await parseXmlString(xmlValue);
			const objXmlNode = new XmlNode(myXmlNode);

			objXmlNode.type = myXmlNode.type;
			objXmlNode.name = myXmlNode.name;
			objXmlNode.children = myXmlNode.children;
			objXmlNode.attribs = myXmlNode.attribs;

			result = objXmlNode.queryOneAsRoot(selector);
		} catch (e) {
			error = e;
		}

		expect(result).toBeNull();
		expect(error).toBeNull();
	});
});

describe("containsOnlyText", () => {
	test(`Return false if node children length > 1`, async () => {
		let result = null,
			error = null;
		try {
			const myXmlNode = await parseXmlString(xmlValue);
			const objXmlNode = new XmlNode(myXmlNode);

			objXmlNode.type = myXmlNode.type;
			objXmlNode.name = myXmlNode.name;
			objXmlNode.children = myXmlNode.children;
			objXmlNode.attribs = myXmlNode.attribs;

			result = objXmlNode.containsOnlyText();
		} catch (e) {
			error = e;
		}

		expect(result).toEqual(false);
		expect(error).toBeNull();
	});

	test(`Return true if its dont have any childeren element`, async () => {
		let result = null,
			error = null,
			selector = "Test";
		xmlValue = `<Product>Test</Product>`;
		try {
			const myXmlNode = await parseXmlString(xmlValue);
			const objXmlNode = new XmlNode(myXmlNode);

			objXmlNode.type = myXmlNode.type;
			objXmlNode.name = myXmlNode.name;
			objXmlNode.children = myXmlNode.children;
			objXmlNode.attribs = myXmlNode.attribs;

			result = objXmlNode.containsOnlyText();
		} catch (e) {
			error = e;
		}

		expect(result).toEqual(true);
		expect(error).toBeNull();
	});

	test(`Return false if node type !== 'tag'`, async () => {
		let result = null,
			error = null,
			selector = "Test";
		xmlValue = `<Product>Test</Product>`;
		try {
			const myXmlNode = await parseXmlString(xmlValue);
			const objXmlNode = new XmlNode(myXmlNode);

			objXmlNode.type = "text";
			objXmlNode.name = myXmlNode.name;
			objXmlNode.children = myXmlNode.children;
			objXmlNode.attribs = myXmlNode.attribs;

			result = objXmlNode.containsOnlyText();
		} catch (e) {
			error = e;
		}

		expect(result).toEqual(false);
		expect(error).toBeNull();
	});

	test(`Return null if node with only text`, async () => {
		let result = null,
			error = null,
			selector = "Test";
		xmlValue = `Test`;
		try {
			const myXmlNode = await parseXmlString(xmlValue);
			const objXmlNode = new XmlNode(myXmlNode);

			objXmlNode.type = myXmlNode.type;
			objXmlNode.name = myXmlNode.name;
			objXmlNode.children = [];
			objXmlNode.attribs = myXmlNode.attribs;

			result = objXmlNode.containsOnlyText();
		} catch (e) {
			error = e.toString().trim().replace(/\s+/g, " ");
		}

		expect(result).toEqual(null);
		expect(error).toEqual(`Error: Non-whitespace before first tag. Line: 0 Column: 1 Char: T`);
	});

	test(`Return false if node children length is 0`, async () => {
		let result = null,
			error = null,
			selector = "Test";
		xmlValue = `<Product></Product>`;
		try {
			const myXmlNode = await parseXmlString(xmlValue);
			const objXmlNode = new XmlNode(myXmlNode);

			objXmlNode.type = myXmlNode.type;
			objXmlNode.name = myXmlNode.name;
			objXmlNode.children = myXmlNode.children;
			objXmlNode.attribs = myXmlNode.attribs;

			result = objXmlNode.containsOnlyText();
		} catch (e) {
			error = e;
		}

		expect(result).toEqual(true);
		expect(error).toBeNull();
	});

	test(`Return false if node children length is 1`, async () => {
		let result = null,
			error = null,
			selector = "Test";
		xmlValue = `<Product><Parent1>Test</Parent1></Product>`;
		try {
			const myXmlNode = await parseXmlString(xmlValue);
			const objXmlNode = new XmlNode(myXmlNode);

			objXmlNode.type = myXmlNode.type;
			objXmlNode.name = myXmlNode.name;
			objXmlNode.children = myXmlNode.children;
			objXmlNode.attribs = myXmlNode.attribs;

			result = objXmlNode.containsOnlyText();
		} catch (e) {
			error = e;
		}

		expect(result).toEqual(false);
		expect(error).toBeNull();
	});

	test(`Return true if node children length is 1`, async () => {
		let result = null,
			error = null,
			selector = "Test";
		xmlValue = `<Product><Parent1>Test</Parent1></Product>`;
		try {
			const myXmlNode = await parseXmlString(xmlValue);
			const objXmlNode = new XmlNode(myXmlNode);

			objXmlNode.type = myXmlNode.type;
			objXmlNode.name = myXmlNode.name;
			objXmlNode.children = [{ type: "text" }];
			objXmlNode.attribs = myXmlNode.attribs;

			result = objXmlNode.containsOnlyText();
		} catch (e) {
			error = e;
		}

		expect(result).toEqual(true);
		expect(error).toBeNull();
	});
});

describe("getInnerText", () => {
	test(`Return null when node type != 'Tag'`, async () => {
		let result = null,
			error = null,
			testString = "Test this is text element.";
		xmlValue = `<Product>${testString}</Product>`;
		try {
			const myXmlNode = await parseXmlString(xmlValue);
			const objXmlNode = new XmlNode(myXmlNode);

			objXmlNode.type = "text";

			result = objXmlNode.getInnerText();
		} catch (e) {
			error = e;
		}

		expect(result).toEqual(null);
		expect(error).toBeNull();
	});

	test(`Return null when multi childerens`, async () => {
		let result = null,
			error = null;
		try {
			const myXmlNode = await parseXmlString(xmlValue_Multi);
			const objXmlNode = new XmlNode(myXmlNode);

			objXmlNode.type = myXmlNode.type;
			objXmlNode.name = myXmlNode.name;
			objXmlNode.children = myXmlNode.children;
			objXmlNode.attribs = myXmlNode.attribs;

			result = objXmlNode.getInnerText();
		} catch (e) {
			error = e;
		}
		expect(result).toEqual(null);
		expect(error).toBeNull();
	});

	test(`Return null when childeren node length is 0`, async () => {
		let result = null,
			error = null,
			testString = "Test this is text element.";
		xmlValue = `<Product></Product>`;
		try {
			const myXmlNode = await parseXmlString(xmlValue);
			const objXmlNode = new XmlNode(myXmlNode);
			objXmlNode.type = myXmlNode.type;
			objXmlNode.name = myXmlNode.name;
			objXmlNode.children = myXmlNode.children;
			objXmlNode.attribs = myXmlNode.attribs;

			result = objXmlNode.getInnerText();
		} catch (e) {
			error = e;
		}

		expect(result).toEqual(null);
		expect(error).toBeNull();
	});

	test(`Return null when child element whithout text`, async () => {
		let result = null,
			error = null,
			testString = "Test this is text element.";
		xmlValue = `<Product><Test></Test></Product>`;
		try {
			const myXmlNode = await parseXmlString(xmlValue);
			const objXmlNode = new XmlNode(myXmlNode);

			objXmlNode.type = myXmlNode.type;
			objXmlNode.name = myXmlNode.name;
			objXmlNode.children = myXmlNode.children;
			objXmlNode.attribs = myXmlNode.attribs;

			result = objXmlNode.getInnerText();
		} catch (e) {
			error = e;
		}

		expect(result).toEqual(null);
		expect(error).toBeNull();
	});

	test(`Return test string when child element type as 'text'`, async () => {
		let result = null,
			error = null,
			testString = "Test this is text element.";
		xmlValue = `<Product>${testString}</Product>`;
		try {
			const myXmlNode = await parseXmlString(xmlValue);
			const objXmlNode = new XmlNode(myXmlNode);

			objXmlNode.type = myXmlNode.type;
			objXmlNode.name = myXmlNode.name;
			objXmlNode.children = myXmlNode.children;
			objXmlNode.attribs = myXmlNode.attribs;

			result = objXmlNode.getInnerText();
		} catch (e) {
			error = e;
		}

		expect(result).toEqual(testString);
		expect(error).toBeNull();
	});
});

describe("getInnerText", () => {
	test(`Return string when child element type as 'text'`, async () => {
		let result = null,
			error = null,
			testString = "Test this is text element.";
		xmlValue = `<Product>${testString}</Product>`;
		try {
			const myXmlNode = await parseXmlString(xmlValue);
			const objXmlNode = new XmlNode(myXmlNode);

			objXmlNode.type = myXmlNode.type;
			objXmlNode.name = myXmlNode.name;
			objXmlNode.children = myXmlNode.children;
			objXmlNode.attribs = myXmlNode.attribs;

			result = objXmlNode.getInnerXml();
		} catch (e) {
			error = e;
		}

		expect(result).toEqual(testString);
		expect(error).toBeNull();
	});

	test(`Return string when multi child element`, async () => {
		let result = null,
			error = null;
		try {
			const myXmlNode = await parseXmlString(xmlValue_Multi);
			const objXmlNode = new XmlNode(myXmlNode);

			objXmlNode.type = myXmlNode.type;
			objXmlNode.name = myXmlNode.name;
			objXmlNode.children = myXmlNode.children;
			objXmlNode.attribs = myXmlNode.attribs;

			result = objXmlNode.getInnerXml();
		} catch (e) {
			error = e;
		}

		expect(result).not.toBeNull();
		expect(error).toBeNull();
	});

	test(`Return string when element have atrributes`, async () => {
		let result = null,
			error = null;
		try {
			const myXmlNode = await parseXmlString(actualXMlData);
			const objXmlNode = new XmlNode(myXmlNode);

			objXmlNode.type = myXmlNode.type;
			objXmlNode.name = myXmlNode.name;
			objXmlNode.children = myXmlNode.children;
			objXmlNode.attribs = myXmlNode.attribs;

			result = objXmlNode.getInnerXml();
		} catch (e) {
			error = e;
		}

		expect(result).not.toBeNull();
		expect(error).toBeNull();
	});
});

describe("getOuterXml", () => {
	test(`Return string when child element type as 'text'`, async () => {
		let result = null,
			error = null,
			testString = "Test this is text element.";
		xmlValue = `<Product>${testString}</Product>`;
		try {
			const myXmlNode = await parseXmlString(xmlValue);
			const objXmlNode = new XmlNode(myXmlNode);

			objXmlNode.type = myXmlNode.type;
			objXmlNode.name = myXmlNode.name;
			objXmlNode.children = myXmlNode.children;
			objXmlNode.attribs = myXmlNode.attribs;

			result = objXmlNode.getOuterXml();
		} catch (e) {
			error = e;
		}

		expect(result).toEqual(xmlValue);
		expect(error).toBeNull();
	});

	test(`Return string when multi child element`, async () => {
		let result = null,
			error = null;
		try {
			const myXmlNode = await parseXmlString(xmlValue_Multi);
			const objXmlNode = new XmlNode(myXmlNode);

			objXmlNode.type = myXmlNode.type;
			objXmlNode.name = myXmlNode.name;
			objXmlNode.children = myXmlNode.children;
			objXmlNode.attribs = myXmlNode.attribs;

			result = objXmlNode.getOuterXml();
		} catch (e) {
			error = e;
		}
		expect(result).not.toBeNull();
		expect(error).toBeNull();
	});

	test(`Return string when element have atrributes`, async () => {
		let result = null,
			error = null;
		try {
			const myXmlNode = await parseXmlString(actualXMlData);
			const objXmlNode = new XmlNode(myXmlNode);

			objXmlNode.type = myXmlNode.type;
			objXmlNode.name = myXmlNode.name;
			objXmlNode.children = myXmlNode.children;
			objXmlNode.attribs = myXmlNode.attribs;

			result = objXmlNode.getOuterXml();
		} catch (e) {
			error = e;
		}
		expect(result).not.toBeNull();
		expect(error).toBeNull();
	});
});
