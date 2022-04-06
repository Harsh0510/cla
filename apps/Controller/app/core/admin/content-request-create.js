const { userRoles, contentRequestType } = require("../../common/staticValues");
const getMaybeValidIsbn = require("../../common/getMaybeValidIsbn");

const mapContentRequestTypeByName = Object.create(null);
Object.keys(contentRequestType).forEach((key) => {
	mapContentRequestTypeByName[contentRequestType[key]] = contentRequestType[key];
});

/**
 *
 * @param {
 * isbn: "9876543210",
 * book_title: "test",
 * book_request_author: "test",
 * book_request_publisher: "test",
 * publication_year: 2021,
 * url: "test",
 * authors: ["Abc", "def"],
 * publishers: ["abc", "Def"],
 * content_type: [1, 2, 3],
 * content_type_note: "test",
 * other_note: "test"
 * request_types: ["test","test"]
 * } params
 * @param {*} ctx
 */
module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();
	const sessionData = await ctx.getSessionData();

	ctx.assert(sessionData.user_role === userRoles.schoolAdmin || sessionData.user_role === userRoles.teacher, 401, "Unauthorized");

	ctx.assert(sessionData.school_id, 401, "You must be associated with a school to create an asset request");

	ctx.assert(params.request_types.length, 400, "Request type is required");
	for (const tab of params.request_types) {
		ctx.assert(mapContentRequestTypeByName[tab], 400, "Request type " + tab + " is invalid");
	}

	const requestTypes = params.request_types;
	let isbn = null;
	let bookTitle = null;
	let authors = [];
	let bookRequestAuthor = null;
	let publishers = [];
	let bookRequestPublisher = null;
	let publicationYear = null;
	let url = null;
	let contentTypeNote = null;
	let otherNote = null;
	let contentType = [];

	requestTypes.forEach((requestType) => {
		if (requestType === contentRequestType.bookRequest) {
			let isBookRequestValid = false;
			if (params.isbn) {
				ctx.assert(typeof params.isbn === "string", 400, "Invalid isbn provided");
				const validIsbn = getMaybeValidIsbn(params.isbn);
				ctx.assert(validIsbn !== null, 400, "ISBN is not valid");
				isbn = params.isbn;
				isBookRequestValid = true;
			}

			if (params.book_title) {
				ctx.assert(typeof params.book_title === "string", 400, "Invalid book title provided");
				bookTitle = params.book_title;
				isBookRequestValid = true;
			}

			if (params.book_request_author) {
				ctx.assert(typeof params.book_request_author === "string", 400, "Invalid book_request_author provided");
				bookRequestAuthor = params.book_request_author;
				isBookRequestValid = true;
			}

			if (params.book_request_publisher) {
				ctx.assert(typeof params.book_request_publisher === "string", 400, "Invalid book_request_publisher provided");
				bookRequestPublisher = params.book_request_publisher;
				isBookRequestValid = true;
			}

			if (params.publication_year) {
				ctx.assert(typeof params.publication_year === "string", 400, "Invalid publication year provided");
				publicationYear = params.publication_year;
				isBookRequestValid = true;
			}

			if (params.url) {
				ctx.assert(typeof params.url === "string", 400, "Invalid url provided");
				ctx.assert(params.url.length <= 500, 400, "URL too long");
				url = params.url;
				isBookRequestValid = true;
			}

			if (!isBookRequestValid) {
				ctx.throw(400, "One of the field is required");
			}
		} else if (requestType === contentRequestType.authorRequest) {
			ctx.assert(params.authors, 400, "Authors is required");
			ctx.assert(Array.isArray(params.authors), 400, "Authors must be an array");
			if (params.authors.length) {
				params.authors.forEach((row) => {
					ctx.assert(typeof row === "string", 400, "Invalid authors provided");
				});
			}
			authors = params.authors;
		} else if (requestType === contentRequestType.publisherRequest) {
			ctx.assert(params.publishers, 400, "Publishers is required");
			ctx.assert(Array.isArray(params.publishers), 400, "Publishers must be an array");
			if (params.publishers.length) {
				params.publishers.forEach((row) => {
					ctx.assert(typeof row === "string", 400, "Invalid publishers provided");
				});
			}
			publishers = params.publishers;
		} else if (requestType === contentRequestType.contentTypeRequest) {
			let isContentTypeRequestValid = false;

			if (params.content_type) {
				ctx.assert(Array.isArray(params.content_type), 400, "Content type must be an array");
				if (params.content_type.length) {
					params.content_type.forEach((row) => {
						ctx.assert(typeof row === "number", 400, "Invalid content type provided");
					});
				}
				contentType = params.content_type;
				isContentTypeRequestValid = true;
			}

			if (params.content_type_note) {
				ctx.assert(typeof params.content_type_note === "string", 400, "Invalid content_type_note provided");
				contentTypeNote = params.content_type_note;
				isContentTypeRequestValid = true;
			}

			if (!isContentTypeRequestValid) {
				ctx.throw(400, "One of the field is required");
			}
		} else {
			//request type is "other-request"
			ctx.assert(params.other_note, 400, "Other note is required");
			ctx.assert(typeof params.other_note === "string", 400, "Invalid other_note provided");
			otherNote = params.other_note;
		}
	});

	let schoolName;
	{
		const results = await ctx.appDbQuery(
			`
				SELECT
					name AS school_name
				FROM
					school
				WHERE
					id = $1
			`,
			[sessionData.school_id]
		);

		schoolName = results.rows[0].school_name;
	}

	const resultCopyRequest = await ctx.appDbQuery(
		`
				INSERT INTO
					content_request
					(
						user_id,
						school_id,
						school_name_log,
						request_type,
						isbn,
						book_title,
						authors,
						book_request_author,
						publishers,
						book_request_publisher,
						publication_year,
						url,
						content_type_note,
						other_note
					)
				VALUES
					(
						$1,
						$2,
						$3,
						$4,
						$5,
						$6,
						$7,
						$8,
						$9,
						$10,
						$11,
						$12,
						$13,
						$14
					)
				RETURNING
					id
			`,
		[
			sessionData.user_id,
			sessionData.school_id,
			schoolName,
			requestTypes,
			isbn,
			bookTitle,
			JSON.stringify(authors),
			bookRequestAuthor,
			JSON.stringify(publishers),
			bookRequestPublisher,
			publicationYear,
			url,
			contentTypeNote,
			otherNote,
		]
	);

	const contentRequestId = resultCopyRequest.rows[0].id;
	if (contentRequestId > 0 && requestTypes.find((x) => x === contentRequestType.contentTypeRequest) && contentType.length > 0) {
		// Fetch content types based on params content type id
		const resultContentType = await ctx.appDbQuery(
			`
				SELECT
					id
				FROM
					content_type
				WHERE
					id IN (${contentType.join(", ")})
			`
		);

		if (resultContentType.rowCount) {
			const values = [];
			for (const contentType of resultContentType.rows) {
				values.push(`(${contentRequestId}, ${contentType.id})`);
			}
			// Add mapping into database for content type with content request type
			await ctx.appDbQuery(
				`
					INSERT INTO
						content_request_content_type_join
						(
							content_request_id,
							content_type_id
						)
					VALUES
						${values.join(",")}
					ON CONFLICT DO NOTHING
				`
			);
		}
	}
	return {
		created: resultCopyRequest.rowCount > 0,
	};
};
