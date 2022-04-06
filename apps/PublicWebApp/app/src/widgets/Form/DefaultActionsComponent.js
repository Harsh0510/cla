import React from "react";

export default function DefaultActionsComponent(props) {
	const ButtonComponent = props.ButtonComponent;
	return (
		<ButtonComponent type="submit" disabled={props.disabled}>
			{props.submit_text || "Submit"}
		</ButtonComponent>
	);
}
