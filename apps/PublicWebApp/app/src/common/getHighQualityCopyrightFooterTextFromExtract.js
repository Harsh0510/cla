import date from "./date";
export default (extract) => {
	const expiryDate = date.sqlToJsDate(extract.date_expired);
	const expiryDateNice = date.rawToNiceDate(expiryDate);
	return `${extract.teacher}, ${extract.school_name}. Licence expires ${expiryDateNice}.`;
};
