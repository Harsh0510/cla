import React from "react";

export default class DefaultIssueReportComponent extends React.PureComponent {
	render() {
		const props = this.props;
		if (!props.issues.array.length) {
			return null;
		}
		return (
			<>
				<div>Issues found</div>
				<ul>
					{props.issues.array.map((iss, idx) => (
						<li key={idx}>
							{iss.type}: {iss.message}
						</li>
					))}
				</ul>
			</>
		);
	}
}
