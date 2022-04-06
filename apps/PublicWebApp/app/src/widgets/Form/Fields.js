import React from "react";
import Issue from "./Issue";

export default function Fields(props) {
	const fieldCount = props.fields.length;
	return (
		<>
			{props.fields.map((field, idx) => {
				const Component = field;
				const { ...rest } = field;
				rest.value = props.values ? props.values[field.name] : "";
				rest.onChange = (value) => props.onChange(value, idx);
				rest.issue = props.issues[field.name] ? props.issues[field.name] : new Issue();
				rest.field_index = idx;
				rest.field_count = fieldCount;
				const comp = <Component key={idx} {...rest} />;
				if (props.wrap) {
					const WrapComponent = props.wrap;
					return (
						<WrapComponent key={field.name + idx} value={rest.value} issue={rest.issue} field_index={rest.field_index} field_count={rest.field_count}>
							{comp}
						</WrapComponent>
					);
				}
				return comp;
			})}
		</>
	);
}
