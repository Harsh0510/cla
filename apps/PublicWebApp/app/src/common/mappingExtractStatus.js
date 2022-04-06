export default function mappingExtractStatus(extracts) {
	for (const extract of extracts) {
		extract.status = extract.expired ? "Expired" : extract.status.charAt(0).toUpperCase() + extract.status.slice(1);
		extract._orig_work_title = extract.work_title;
		extract._orig_work_authors = extract.work_authors;
		extract._orig_title = extract.title;
	}
	return extracts;
}
