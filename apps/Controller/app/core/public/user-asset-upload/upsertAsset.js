const fetchFromIsbnDb = require("../../../common/fetchFromIsbnDb");
const ISBN = require("../../../common/isbn").ISBN;

const rawSymbol = Symbol();

module.exports = async (querier, currUserId, publisherId, authors, params) => {
	const book = (await fetchFromIsbnDb(params.isbn)).find((book) => {
		const i = ISBN.parse(book.isbn13 || book.isbn);
		return i && i.isValid() && i.asIsbn13() === params.isbn;
	});
	{
		const insertValueMap = {
			active: true,
			is_ep: true,
			date_system_created: {
				[rawSymbol]: "NULL",
			},
			date_user_created: {
				[rawSymbol]: "NOW()",
			},
			title: params.title,
			description: book ? book.overview || book.synopsys || book.excerpt : null,
			dewey_class: book ? book.dewey_decimal : null,
			page_count: params.page_count,
			copyable_page_count: params.page_count,
			isbn13: params.isbn,
			pdf_isbn13: params.isbn,
			file_format: "pdf",
			modified_by_user_id: currUserId,
			publisher_id: publisherId,
			publisher_name_log: params.publisher,
			publication_date: {
				[rawSymbol]: params.publication_date ? "TO_TIMESTAMP(" + params.publication_date + ")" : "NULL",
			},
			authors_log: JSON.stringify(
				authors.map((author) => ({
					firstName: author.first_name,
					lastName: author.last_name,
					role: "A",
				}))
			),
			authors_string: authors.map((author) => author.first_name + " " + author.last_name).join("; "),
		};

		const dbFields = Object.keys(insertValueMap);
		const binds = [];
		const values = [];
		for (const field of dbFields) {
			if (insertValueMap[field] && insertValueMap[field][rawSymbol]) {
				values.push(insertValueMap[field][rawSymbol]);
			} else {
				values.push("$" + binds.push(insertValueMap[field]));
			}
		}

		// updating asset if already exists based on isbn13 or pdf_isbn13
		let result = await querier(
			`
				UPDATE
					asset
				SET
					date_edited = NOW(),
					date_user_created = COALESCE(asset.date_user_created, NOW()),
					active = TRUE,
					is_ep = TRUE
				WHERE
					isbn13 = $1
					OR pdf_isbn13 = $1
					OR alternate_isbn13 = $1
				RETURNING
					id
			`,
			[params.isbn]
		);

		// if asset does not exists then insert
		if (!result.rowCount) {
			result = await querier(
				`
					INSERT INTO
						asset
						(${dbFields.join(", ")})
					VALUES
						(${values.join(", ")})
					RETURNING
						id
			`,
				binds
			);
		}

		if (result.rowCount) {
			return {
				id: result.rows[0].id,
				did_insert: true,
				copyable_page_count: params.page_count,
				authors_string: insertValueMap.authors_string,
			};
		}
	}
	const result = await querier(
		`
			SELECT
				id,
				copyable_page_count,
				pdf_isbn13,
				authors_string
			FROM
				asset
			WHERE
				pdf_isbn13 = $1
				OR isbn13 = $1
				OR alternate_isbn13 = $1
		`,
		[params.isbn]
	);
	if (!result.rowCount) {
		throw new Error("Unexpected [1]");
	}
	return {
		id: result.rows[0].id,
		did_insert: false,
		copyable_page_count: result.rows[0].copyable_page_count,
		authors_string: result.rows[0].authors_string,
	};
};
