const Stream = require("stream");
const Readable = Stream.Readable;
const sax = require("sax");

const XmlParserRaw = require("../../../core/admin/parseUploads/XmlParser");

let openTagTimesCalled = 0;
let closeTagTimesCalled = 0;
let callbackHistory = [];

function getReadable(str) {
	const s = new Readable();
	s.push(str);
	s.push(null);
	return s;
}

async function parseXmlExplicit(saxOverride, str) {
	return await new XmlParserRaw(saxOverride).parse(getReadable(str));
}

async function parseXml(str) {
	return await parseXmlExplicit(sax, str);
}

beforeEach(function () {
	openTagTimesCalled = 0;
	closeTagTimesCalled = 0;
	callbackHistory = [];
});

test("invalid", async () => {
	let rootNode;
	let lastError;
	try {
		rootNode = await parseXml("<invalid></in>");
	} catch (e) {
		lastError = e;
	}
	expect(lastError.message).toMatch(/unexpected close tag/i);
	expect(rootNode).toBeUndefined();
});

test("empty xml", async () => {
	let rootNode = null;
	let lastError;
	try {
		rootNode = await parseXml("");
	} catch (e) {
		lastError = e;
	}
	expect(rootNode).toBeNull();
	expect(lastError).not.toBeNull();
});

test("xml tree", async () => {
	let rootNode;
	let lastError;
	try {
		rootNode = await parseXml(
			`
<?xml version="1.0" encoding="UTF-8"?>
<test>hello there<nested attri="bute"> nested <another/>tag here! </nested></test>
`.trim()
		);
	} catch (e) {
		lastError = e;
	}
	expect(lastError).toBeUndefined();
	expect(rootNode.type).toBe("tag");
	expect(rootNode.name).toBe("test");
	expect(rootNode.children.length).toBe(2);
	expect(rootNode.children[0].type).toBe("text");
	expect(rootNode.children[1].type).toBe("tag");
	expect(rootNode.children[1].name).toBe("nested");
	expect(rootNode.children[1].attribs).toEqual({ attri: "bute" });
	expect(rootNode).toMatchSnapshot();
});
