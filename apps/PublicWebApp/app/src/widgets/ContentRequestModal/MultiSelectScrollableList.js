import React from "react";
import styled from "styled-components";
import { colours } from "../../common/theme";
import CheckBoxField from "../Form/fields/CheckboxField";

const SelectListWrapper = styled.div`
	border: 1px solid ${colours.primaryLight};
	padding: 10px;
	max-height: 200px;
	overflow-y: auto;
	::-webkit-scrollbar {
		width: 10px;
	}
	::-webkit-scrollbar-track {
		background: transparent;
	}
	::-webkit-scrollbar-thumb {
		background: ${colours.primaryLight};
		border-radius: 10px;
	}
	::-webkit-scrollbar-thumb:hover {
		background: ${colours.primaryLight};
	}
`;

const Label = styled.div`
	margin: 0.5em 0;
`;

export default class MultiSelectScrollableList extends React.PureComponent {
	onChange = () => {
		const checkedIds = Array.prototype.slice
			.call(this.props.refGroup.current.querySelectorAll(`[type=checkbox]:checked`))
			.map((el) => parseInt(el.getAttribute("data-value"), 10));
		this.props.onChange(checkedIds);
	};

	render() {
		const p = this.props;
		const values = Object.create(null);
		for (const option of p.options) {
			values[option.id] = true;
		}
		for (const id of p.value) {
			values[id] = false;
		}
		return (
			<>
				{p.placeholder && <Label>{p.placeholder}</Label>}
				<SelectListWrapper ref={this.props.refGroup}>
					{p.options.map((item) => {
						const v = !values[item.id];
						const k = `${item.id}_${v}`;
						return (
							<div key={k}>
								<CheckBoxField content={item.title} value={v} onChange={this.onChange} data-value={item.id} />
							</div>
						);
					})}
				</SelectListWrapper>
			</>
		);
	}
}
