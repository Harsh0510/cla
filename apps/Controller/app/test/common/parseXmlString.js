const Readable = require("stream").Readable;
const XmlParser = require("../../core/admin/parseUploads/XmlParser");
const sax = require("sax");

module.exports = async function parseXmlString(xmlString) {
	const s = new Readable();
	s.push(xmlString);
	s.push(null);
	const xmlParser = new XmlParser(sax);
	return await xmlParser.parse(s);
};
