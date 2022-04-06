const XmlNode = require("../lib/XmlNode");

class XmlParser {
	constructor(parser) {
		this.parser = parser;
	}

	parse(fileReadableStream) {
		return new Promise((resolve, reject) => {
			const nodeStack = [];
			let nodeStackLen = 0;
			let rootNode = null;
			let finished = false;

			const saxStream = this.parser.createStream(true, {
				trim: false,
				normalize: false,
				lowercase: false,
				xmlns: true,
				position: true,
				strictEntities: true,
			});
			saxStream.on("end", (_) => {
				if (!finished) {
					finished = true;
					fileReadableStream.destroy();
					resolve(rootNode);
				}
			});
			saxStream.on("error", (e) => {
				if (!finished) {
					finished = true;
					fileReadableStream.destroy();
					reject(e);
				}
			});
			saxStream.on("opentag", function (node) {
				if (finished) {
					return;
				}
				const myNode = new XmlNode();
				myNode.type = "tag";
				myNode.name = node.name;
				myNode.children = [];
				myNode.attribs = {};
				for (const key in node.attributes) {
					if (node.attributes.hasOwnProperty(key)) {
						myNode.attribs[node.attributes[key].name] = node.attributes[key].value;
					}
				}

				const parentNode = nodeStackLen > 0 ? nodeStack[nodeStackLen - 1] : null;
				if (parentNode) {
					let prevNode = null;
					if (parentNode.children.length > 0) {
						prevNode = parentNode.children[parentNode.children.length - 1];
					}
					parentNode.children.push(myNode);
					if (prevNode) {
						prevNode.next = myNode;
						myNode.prev = prevNode;
					}
					myNode.parent = parentNode;
				} else {
					rootNode = myNode;
				}

				nodeStack.push(myNode);
				nodeStackLen++;
			});
			saxStream.on("closetag", function (_) {
				if (finished) {
					return;
				}
				nodeStackLen--;
				nodeStack.pop();
			});
			saxStream.on("text", function (text) {
				if (finished) {
					return;
				}
				if (nodeStackLen > 0) {
					const parentNode = nodeStack[nodeStackLen - 1];
					let prevNode = null;
					if (parentNode.children.length > 0) {
						prevNode = parentNode.children[parentNode.children.length - 1];
					}
					if (prevNode && prevNode.type === "text") {
						prevNode.data += text;
					} else {
						const myNode = new XmlNode();
						myNode.type = "text";
						myNode.data = text;
						myNode.parent = parentNode;
						myNode.prev = prevNode;
						myNode.next = null;
						parentNode.children.push(myNode);
						if (prevNode) {
							prevNode.next = myNode;
						}
					}
				}
			});
			fileReadableStream.pipe(saxStream);
		});
	}
}

module.exports = XmlParser;
