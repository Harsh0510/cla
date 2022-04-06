import React from "react";

export default function HelpLink(props) {
	const { link, title, isInfoIcon } = props;
	return (
		<a href={link} title={title}>
			{title ? title : "Need help?"} {isInfoIcon ? <i className="fa fa-info-circle" aria-hidden="true"></i> : ""}{" "}
		</a>
	);
}
