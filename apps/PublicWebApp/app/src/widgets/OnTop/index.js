import React from "react";
import ReactDOM from "react-dom";

class OnTop extends React.PureComponent {
	constructor(props) {
		super(props);
		this._el = document.createElement("div");
	}
	componentDidMount() {
		document.body.appendChild(this._el);
	}
	componentWillUnmount() {
		document.body.removeChild(this._el);
	}
	render() {
		return ReactDOM.createPortal(this.props.children, this._el);
	}
}

export default OnTop;
