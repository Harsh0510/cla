import React from "react";
import CheckBoxField from "../../widgets/Form/fields/CheckboxField";

export default class CheckboxSetField extends React.PureComponent {
	onChange = () => {
		if (typeof this.props.onChange === "function") {
			const checkedIds = Array.prototype.slice
				.call(this.props.refGroup.current.querySelectorAll(`[type=checkbox]:not(:checked)`))
				.map((el) => el.getAttribute("data-value"));
			this.props.onChange(checkedIds);
		}
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
			<div ref={this.props.refGroup}>
				{p.options.map((item) => {
					const v = !!values[item.id];
					const k = `${item.id}_${v}`;
					return (
						<div key={k}>
							<CheckBoxField content={item.description} value={v} onChange={this.onChange} data-value={item.id} />
						</div>
					);
				})}
			</div>
		);
	}
}
