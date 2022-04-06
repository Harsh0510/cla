import React from "react";
import styled, { css } from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faArrowUp, faArrowDown, faPlusCircle } from "@fortawesome/free-solid-svg-icons";

const InputWrap = styled.div`
	margin-bottom: 0.5em;
	display: flex;
`;

const Number = styled.span`
	display: inline-block;
	margin-right: 0.2em;
	flex-shrink: 0;
`;

const SmallInputWrap = styled.div`
	flex: 1;
`;

const SmallInput = styled.input`
	display: inline-block;
	padding: 0.25em 0.5em;
	font-size: 0.8em;
	width: calc(100% - 0.3em);
	box-sizing: border-box;
	${(p) =>
		!p.valid &&
		css`
			outline: 1px solid #ff0000;
		`}
`;

const InputRowIcon = styled.span`
	flex-shrink: 0;
	display: inline-block;
	cursor: pointer;
	padding: 0 0.2em;
	&:hover {
		opacity: 0.7;
	}
`;

const AddOne = styled.span`
	display: inline-block;
	cursor: pointer;
`;

export default class MultiRowTextField extends React.PureComponent {
	el = React.createRef();

	onChange = (e) => {
		if (this.props.onChange) {
			const idx = parseInt(e.target.getAttribute("data-index"), 10);
			const newItems = this.props.value.slice(0);
			newItems[idx] = e.target.value;
			this.props.onChange(e.target.name, newItems, this.fieldIsValid(newItems));
		}
	};

	onBlur = (e) => {
		if (this.props.onChange) {
			this.props.onChange(e.target.name, this.props.value, this.fieldIsValid(this.props.value));
		}
	};

	isValid = () => {
		return this.fieldIsValid(this.props.value);
	};

	fieldIsValid(items) {
		if (this.props.type === "template") {
			return items.map((str) => {
				if (!str) {
					return false;
				}
				return true;
			});
		}
		return items.map((i) => true);
	}

	doAddOne = (e) => {
		e.preventDefault();
		if (this.props.onChange) {
			const newItems = this.props.value.slice(0);
			newItems.push("");
			this.props.onChange(this.props.name, newItems, this.fieldIsValid(newItems));
		}
	};

	doDeleteOne = (e) => {
		e.preventDefault();
		if (this.props.onChange) {
			const idx = parseInt(e.currentTarget.getAttribute("data-index"), 10);
			const newItems = this.props.value.slice(0);
			newItems.splice(idx, 1);
			this.props.onChange(this.props.name, newItems, this.fieldIsValid(newItems));
		}
	};

	doMoveUp = (e) => {
		e.preventDefault();
		if (this.props.onChange) {
			const idx = parseInt(e.currentTarget.getAttribute("data-index"), 10);
			if (idx > 0) {
				let newItems = this.props.value.slice(0);
				const tmp = newItems[idx - 1];
				newItems[idx - 1] = newItems[idx];
				newItems[idx] = tmp;
				this.props.onChange(this.props.name, newItems, this.fieldIsValid(newItems));
			}
		}
	};

	doMoveDown = (e) => {
		e.preventDefault();
		if (this.props.onChange) {
			const idx = parseInt(e.currentTarget.getAttribute("data-index"), 10);
			if (idx < this.props.value.length - 1) {
				let newItems = this.props.value.slice(0);
				const tmp = newItems[idx + 1];
				newItems[idx + 1] = newItems[idx];
				newItems[idx] = tmp;
				this.props.onChange(this.props.name, newItems, this.fieldIsValid(newItems));
			}
		}
	};

	hasValue() {
		return this.props.value && Array.isArray(this.props.value) && this.props.value.length > 0;
	}

	canAddMore() {
		if (typeof this.props.maxItems !== "number") {
			return true;
		}
		if (!this.hasValue()) {
			return true;
		}
		return this.props.value.length < this.props.maxItems;
	}

	render() {
		const { movable = true } = this.props;

		return (
			<div ref={this.el}>
				{this.props.title ? <div>{this.props.title}</div> : null}
				{this.hasValue() ? (
					this.props.value.map((value, idx) => (
						<InputWrap key={idx}>
							<Number>{idx + 1}.</Number>
							<SmallInputWrap>
								<SmallInput
									valid={this.props.valid ? this.props.valid[idx] : true}
									type="text"
									data-index={idx}
									value={value}
									onChange={this.onChange}
									onBlur={this.onBlur}
								/>
							</SmallInputWrap>
							<InputRowIcon data-index={idx} onClick={this.doDeleteOne}>
								<FontAwesomeIcon icon={faTrash} size="sm" />
							</InputRowIcon>
							{movable ? (
								<>
									<InputRowIcon data-index={idx} onClick={this.doMoveUp}>
										<FontAwesomeIcon icon={faArrowUp} size="sm" />
									</InputRowIcon>
									<InputRowIcon data-index={idx} onClick={this.doMoveDown}>
										<FontAwesomeIcon icon={faArrowDown} size="sm" />
									</InputRowIcon>
								</>
							) : null}
						</InputWrap>
					))
				) : (
					<div style={{ marginBottom: "0.5em" }}>(No values added yet)</div>
				)}
				{this.canAddMore() && (
					<AddOne onClick={this.doAddOne}>
						<FontAwesomeIcon icon={faPlusCircle} size="sm" /> Add
					</AddOne>
				)}
			</div>
		);
	}
}
