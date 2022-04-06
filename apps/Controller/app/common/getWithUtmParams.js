const { parse } = require("node-html-parser");

const allowedHostNamesRegex = /(^|\.)(cla\.co\.uk|educationplatform\.co\.uk|stage-schoolingplatform\.com|occclaepblog\.azurewebsites\.net)$/;

const getContent = (item) => {
	let content = item.rawText;
	if (content) {
		content = content.trim();
		if (content) {
			return content;
		}
	}
	content = item.getAttribute("title");
	if (content) {
		content = content.trim();
		if (content) {
			return content;
		}
	}
	const el = item.querySelector("img");
	if (el) {
		content = el.getAttribute("title");
		if (content) {
			return content;
		}
		content = el.getAttribute("alt");
		if (content) {
			return content;
		}
	}
	return (item.textContent || item.text || item.innerHTML || "").trim();
};

/**
 * @brief Given a HTML string containing <a> tags (links), it returns another
 * string where the links to EP have Analytics UTM parameters added.
 *
 * @param {string} htmlBody
 * @param {string} category
 */
module.exports = (htmlBody, category) => {
	const tree = parse(htmlBody, {
		comment: true,
	});
	const items = tree.querySelectorAll("a");
	for (const item of items) {
		const href = item.getAttribute("href");
		if (!href) {
			continue;
		}
		let u;
		try {
			u = new URL(item.getAttribute("href"));
		} catch (e) {}
		if (!u) {
			continue;
		}
		if (!allowedHostNamesRegex.test(u.host)) {
			continue;
		}
		u.searchParams.append("utm_source", "sendgrid-ep");
		u.searchParams.append("utm_medium", "email");
		u.searchParams.append("utm_campaign", category);
		const content = getContent(item)
			.toString()
			.toLowerCase()
			.replace(/\s+/g, "-")
			.replace(/[^a-zA-Z0-9_-]/g, "")
			.slice(0, 30);
		u.searchParams.append("utm_content", content);
		item.setAttribute("href", u.href);
	}
	return tree.toString();
};
