export default function getMailto(p) {
	const to = p.email || "";
	const queryParts = [];
	if (p.subject) {
		queryParts.push(`subject=${encodeURIComponent(p.subject)}`);
	}
	if (p.body) {
		queryParts.push(`body=${encodeURIComponent(p.body)}`);
	}
	const qs = queryParts.length ? `?${queryParts.join("&")}` : "";
	return to + qs;
}
