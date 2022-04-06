import getDocumentBody from "../../common/getDocumentBody";
/**
 * @brief Fetch an visible bounding box for the element.
 * If domElement is partly hidden by a parent (e.g. parent is overflow hidden),
 * then only the visible bounding box of `domElement` is returned.
 * @param {DOMElement} domElement
 */
const getBoundingBox = (domElement) => {
	let curr = domElement;
	let bb = curr.getBoundingClientRect();
	const ret = {
		left: bb.left,
		right: bb.right,
		top: bb.top,
		bottom: bb.bottom,
	};
	while (true) {
		curr = curr.parentNode;
		if (curr == getDocumentBody) {
			break;
		}
		let cc = curr.getBoundingClientRect();
		// intersect parent's bounding box with current bounding box
		if (cc.top > ret.top) {
			ret.top = cc.top;
		}
		if (cc.bottom < ret.bottom) {
			ret.bottom = cc.bottom;
		}
		if (cc.left > ret.left) {
			ret.left = cc.left;
		}
		if (cc.right < ret.right) {
			ret.right = cc.right;
		}
	}
	ret.width = ret.right - ret.left;
	ret.height = ret.bottom - ret.top;
	ret.x = ret.left;
	ret.y = ret.top;
	return ret;
};

export default getBoundingBox;
