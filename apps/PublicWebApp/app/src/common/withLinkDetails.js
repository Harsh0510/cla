import React from "react";
import { withRouter } from "react-router-dom";

export default function (WrappedComponent) {
	return withRouter(function WithLinkDetails(p) {
		const currPath = p.location.pathname;
		const targetPath = typeof p.to === "string" ? p.to : p.to.pathname;
		const inSection = currPath.indexOf(targetPath) === 0;
		const isCurrent = currPath === targetPath;
		return (
			<WrappedComponent
				className={p.className}
				to={p.to}
				in_section={inSection ? inSection : ""}
				is_current={isCurrent ? isCurrent : ""}
				children={p.children}
			/>
		);
	});
}
