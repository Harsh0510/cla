import React from "react";
import PropTypes from "prop-types";

class IsCapsLockActive extends React.Component {
	state = {
		isCapsLockActive: false,
		isFocused: false,
	};

	componentDidMount() {
		window.addEventListener("keydown", this.doKeyToggle, false);
		window.addEventListener("keypress", this.doKeyCheck, false);
		if (this.props.inputRef && this.props.inputRef.current) {
			this.props.inputRef.current.addEventListener("focus", this.doFocus, false);
			this.props.inputRef.current.addEventListener("blur", this.doFocusOut, false);
		}
	}

	componentWillUnmount() {
		window.removeEventListener("keydown", this.doKeyToggle, false);
		window.removeEventListener("keypress", this.doKeyCheck, false);
		if (this.props.inputRef && this.props.inputRef.current) {
			this.props.inputRef.current.removeEventListener("focus", this.doFocus, false);
			this.props.inputRef.current.removeEventListener("blur", this.doFocusOut, false);
		}
	}

	doKeyToggle = (e) => {
		if (e.key === "CapsLock" || e.code === "CapsLock") {
			this.setState({
				isCapsLockActive: !this.state.isCapsLockActive,
			});
		}
	};

	doFocus = () => {
		if (document.activeElement === this.props.inputRef.current) {
			this.setState({
				isFocused: true,
			});
		}
	};

	doFocusOut = () => {
		if (document.activeElement !== this.props.inputRef.current) {
			this.setState({
				isFocused: false,
			});
		}
	};

	doKeyCheck = (e) => {
		if (e.key !== "CapsLock" && e.code !== "CapsLock") {
			this.setState({
				isCapsLockActive: !!e.getModifierState("CapsLock"),
			});
		}
	};

	render() {
		return this.props.children(this.state.isCapsLockActive && this.state.isFocused);
	}
}

IsCapsLockActive.propTypes = {
	children: PropTypes.func.isRequired,
};

export default IsCapsLockActive;
