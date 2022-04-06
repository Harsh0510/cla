import fs from "fs";

import sax from "sax";
import XmlNode from "./XmlNode";

class XmlParser {
	parse(fileReadableStream: fs.ReadStream): Promise<XmlNode | null> {
		return new Promise((resolve, reject) => {
			const nodeStack: XmlNode[] = [];
			let nodeStackLen = 0;
			let rootNode: XmlNode | null = null;
			let finished = false;

			const saxStream = sax.createStream(true, {
				trim: false,
				normalize: false,
				lowercase: false,
				xmlns: true,
				position: true,
			});
			saxStream.on("end", () => {
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
						myNode.attribs[(node.attributes[key] as { name: string }).name] = (
							node.attributes[key] as { value: string }
						).value;
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
			saxStream.on("closetag", function () {
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
					const parentNode = nodeStack[nodeStackLen - 1] as XmlNode;
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

export default XmlParser;
