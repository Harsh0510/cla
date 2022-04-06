module.exports = function (product, productNode) {
	product.authors = [];
	if (productNode.queryOne(`> DescriptiveDetail > NoContributor`)) {
		return;
	}
	const nodes = productNode.query(`
		> DescriptiveDetail
		> Contributor:has(> ContributorRole:not(:empty))
	`);
	for (const node of nodes) {
		const roleCode = node.queryOne(`> ContributorRole`).getInnerText();

		let sequenceNumber = null;
		const sequenceNumberNode = node.queryOne(`> SequenceNumber`);
		if (sequenceNumberNode) {
			const sequenceNumberText = sequenceNumberNode.getInnerText();
			if (sequenceNumberText) {
				sequenceNumber = parseInt(sequenceNumberText, 10);
			}
		}
		if (sequenceNumber === null) {
			// no sequence number - generate a random one
			sequenceNumber = Math.floor(Math.random() * 1000 * 1000 * 1000);
		}
		const author = Object.create(null);
		author.roleCode = roleCode;
		author.sequenceNumber = sequenceNumber;
		let found = false;
		if (!found) {
			const namesBeforeKeyNode = node.queryOne(`> NamesBeforeKey:not(:empty)`);
			const keyNames = node.queryOne(`> KeyNames:not(:empty)`);
			if (namesBeforeKeyNode && keyNames) {
				author.lastName = keyNames.getInnerText() || "";
				author.firstName = namesBeforeKeyNode.getInnerText() || "";
				found = true;
			}
		}
		if (!found) {
			const personNameNode = node.queryOne(`> PersonName`);
			if (personNameNode) {
				let nameText = personNameNode.getInnerText();
				if (nameText) {
					nameText = nameText.trim();
					const nameParts = nameText.split(/\s+/);
					if (nameParts.length > 1) {
						author.firstName = nameParts.shift();
						author.lastName = nameParts.join(" ");
					} else {
						author.firstName = nameText;
						author.lastName = "";
					}
					found = true;
				}
			}
		}
		if (!found) {
			const nameInvertedNode = node.queryOne(`> PersonNameInverted`);
			if (nameInvertedNode) {
				const nameInvertedText = nameInvertedNode.getInnerText();
				if (nameInvertedText && nameInvertedText.indexOf(",") !== -1) {
					const parts = nameInvertedText.split(",");
					author.lastName = parts[0].trim();
					author.firstName = parts[1].trim();
					if (author.lastName && author.firstName) {
						found = true;
					}
				}
			}
		}
		if (found) {
			product.authors.push(author);
		}
	}
};
