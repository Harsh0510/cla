import React from "react";
import styled from "styled-components";
import ToggleSwitch from "./index";

const LabelStart = styled.span`
	display: inline-block;
	margin-right: 1em;
`;

const LabelEnd = styled.span`
	display: inline-block;
	margin-left: 1em;
`;

const TwoOptionSwitch = (props) => {
	return (
		<div>
			<LabelStart>{props.start_title}</LabelStart>
			<ToggleSwitch onChange={props.onChange} value={props.value} />
			<LabelEnd>{props.end_title}</LabelEnd>
		</div>
	);
};

export default TwoOptionSwitch;
