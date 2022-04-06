module.exports = (rawAuthors) => {
	const authors = rawAuthors
		.map((author) => {
			if (typeof author === "string") {
				// "John Smith" or "Smith, John"
				if (author.indexOf(",") < 0) {
					// "John Smith"
					const parts = author.trim().split(/\s+/);
					const len = parts.length;
					return {
						firstName: parts[0],
						lastName: len > 1 ? parts[len - 1] : null,
					};
				}
				// "Smith, John"
				const parts = author.trim().split(",");
				return {
					firstName: parts[parts.length - 1].trim(),
					lastName: parts[0].trim(),
				};
			}
			if (Array.isArray(author)) {
				// ["John", "Smith"]
				const len = author.length;
				return {
					firstName: author[0].trim(),
					lastName: len > 1 ? author[len - 1].trim() : null,
				};
			}
			// assume: { firstName: "John", lastName: "Smith" }
			return author;
		})
		.filter((author) => !!author.lastName);
	return [...new Set(authors)];
};
