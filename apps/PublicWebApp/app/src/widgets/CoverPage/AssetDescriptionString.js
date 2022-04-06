import React from "react";
import { getOrdinalSuffix, getLongFormContributors } from "../../common/misc";

export default function (props) {
	const authorsData = getLongFormContributors(props.work_authors);
	const editionString = props.edition > 1 ? `${getOrdinalSuffix(props.edition)} ed. ` : "";
	let prefix;
	if (authorsData) {
		if (authorsData.authors && !authorsData.editors) {
			prefix = (
				<>
					<span>{authorsData.authors}. </span>
					<em>{props.work_title}. </em>
				</>
			);
		} else if (!authorsData.authors && authorsData.editors) {
			const suffix = authorsData.raw.editors.length > 1 ? "eds" : "ed";
			prefix = (
				<>
					<span>
						{authorsData.editors}, {suffix}.{" "}
					</span>
					<em>{props.work_title}. </em>
				</>
			);
		} else if (authorsData.authors && authorsData.editors) {
			const eds = authorsData.raw.editors.length > 1 ? "Eds" : "Ed";
			prefix = (
				<>
					<span>{authorsData.authors}. </span>
					<em>{props.work_title}. </em>
					<span>
						{eds}. {authorsData.editors}.{" "}
					</span>
				</>
			);
		} else {
			prefix = <em>{props.work_title}. </em>;
		}
		if (authorsData.translators) {
			prefix = (
				<>
					{prefix}
					<span>Translated by {authorsData.translators}.&nbsp;</span>
				</>
			);
		}
	} else {
		prefix = <em>{props.work_title}. </em>;
	}
	const suffix = (
		<>
			{editionString}
			{props.work_publisher + (props.work_publication_date ? ", " : ". ")}
			{props.work_publication_date ? props.work_publication_date.slice(0, 4) + ". " : ""}
			The Education Platform.
		</>
	);

	return (
		<>
			{prefix}
			{suffix}
		</>
	);
}
