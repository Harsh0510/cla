import date from "./date";
import { getLongFormContributors } from "./misc";

export default function shareExtractBodyContentString(data, accessCode) {
	let assetAuthors = "";
	let authorsData = getLongFormContributors(data.work_authors);
	if (authorsData && authorsData.authors) {
		assetAuthors = authorsData.authors;
	}
	let accessCodeText = `For this copy you will also need the access code: ${accessCode}\n`;
	const lineData = [];
	lineData.push(`${data.work_title}, ${assetAuthors}`);
	lineData.push(`Total pages in copy: ${data.page_count}`);
	lineData.push(`School: ${data.school_name}`);
	lineData.push(`Created by: ${data.teacher}`);
	lineData.push(`Creation date: ${date.rawToNiceDate(data.date_created)}`);
	lineData.push(`Licensed until: ${date.rawToNiceDate(data.date_expired)}`);
	if (accessCode) {
		lineData.push(`${accessCodeText}`);
	}
	lineData.push(`Licensed for use under the terms of the CLA Education Licence: https://www.cla.co.uk/cla-schools-licence`);
	lineData.push(`For use only by members of ${data.school_name}`);
	const bodyContentString = lineData.join("\n");
	return bodyContentString;
}
