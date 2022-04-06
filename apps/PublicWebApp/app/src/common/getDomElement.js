import ReactDOM from "react-dom";

export default function getDomElement(reactRef) {
	if (!reactRef.current) {
		return null;
	}
	if (reactRef.current instanceof Element) {
		return reactRef.current;
	}
	return ReactDOM.findDOMNode(reactRef.current);
}
