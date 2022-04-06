import { Pool, Client } from "pg";

import TJsonValue from "../TJsonValue";
import ITocItem from "./ITocItem";

const unlockEvents = {
	userCamera: "user-camera",
	userImage: "user-image",
	userCla: "user-cla",
	userBulkSchool: "bulk-school",
	userBulkCla: "bulk-cla",
	userTempUnlock: "temp-unlock",
};
const unlockAttemptStatus = {
	invalidIsbn: "invalid-isbn",
	doesNotExist: "does-not-exist",
	alreadyUnlocked: "already-unlocked",
	successfullyUnlocked: "successfully-unlocked",
	publisherRestricted: "publisher-restricted",
	notOwnedBySchool: "not-owned-by-school",
	tempUnlocked: "temp-unlocked",
	tempUnlockedMustConfirm: "temp-unlocked-must-confirm",
	tempUnlockedExpired: "temp-unlocked-expired",
};

const arrayChunk = <T>(arr: T[], chunkSize: number): T[][] => {
	const chunked: T[][] = [];
	for (let i = 0, len = arr.length; i < len; i += chunkSize) {
		const max = Math.min(len, i + chunkSize);
		const chunk: T[] = [];
		for (let j = i; j < max; ++j) {
			chunk.push(arr[j] as T);
		}
		chunked.push(chunk);
	}
	return chunked;
};

const getShortAuthorRole = (role?: string | null | undefined) => {
	if (role === "B06") {
		// translator
		return "T";
	}
	if (!role) {
		return "A";
	}
	return (role[0] as string).toUpperCase();
};

interface IAuthor {
	firstName?: string | null | undefined;
	lastName?: string | null | undefined;
	roleCode?: string | null | undefined;
	sequenceNumber: number;
}

export interface IProduct {
	title?: string;
	subtitle?: string;
	description?: string;
	edition?: number;
	extent?: string;
	recordReference?: string;
	toc?: string;
	publicationDate?: number;
	isbn13: string;
	alternateIsbn13?: string;
	pdfIsbn13?: string;
	pageOffsetRoman?: number;
	pageOffsetArabic?: number;
	copyExcludedPages?: (string | number)[];
	doi?: string;
	issueNumber?: number;
	volumeNumber?: number;
	publisher?: string;
	imprint?: string;
	subjects?: string[];
	authors?: IAuthor[];
	parentAsset?: {
		identifier?: string;
		title?: string;
	};
	contentForm?: string;
	fileFormat?: string;
	educationalYearGroup?: string[];
	exam?: string[];
	examBoard?: string[];
	keyStage?: string[];
	level?: string[];
	scottishLevel?: string[];
	collection?: string[];
	language?: string[];
	channel?: "EP" | "BD";
	_parsedToc?: ITocItem[];
}

const getAuthorHash = (author: { firstName?: string | null | undefined; lastName?: string | null | undefined }) => {
	return author.firstName + "@@" + author.lastName;
};

export default class DataUpserter {
	private databaseQuerier: Pool | Client;

	constructor(databaseQuerier: Pool | Client) {
		this.databaseQuerier = databaseQuerier;
	}

	private async _handlePublisher(product: IProduct) {
		const results = await this.databaseQuerier.query(
			`
				INSERT INTO
					publisher
					(name)
				VALUES
					($1)
				ON CONFLICT
					(name)
				DO UPDATE SET
					name = EXCLUDED.name,
					date_edited = NOW()
				RETURNING
					id
			`,
			[product.publisher]
		);
		return results.rows[0].id;
	}

	private async _handleImprint(product: IProduct, publisherId: number) {
		if (!product.imprint) {
			return 0;
		}
		const results = await this.databaseQuerier.query(
			`
				INSERT INTO
					imprint
					(name, publisher_name_log, publisher_id)
				VALUES
					($1, $2, $3)
				ON CONFLICT
					(name)
				DO UPDATE SET
					name = EXCLUDED.name,
					publisher_id = EXCLUDED.publisher_id,
					publisher_name_log = EXCLUDED.publisher_name_log,
					date_edited = NOW()
				RETURNING
					id
			`,
			[product.imprint, product.publisher, publisherId]
		);
		return results.rows[0].id;
	}

	private async _handleAssetSubjects(product: IProduct, assetId: number) {
		if (!Array.isArray(product.subjects) || !product.subjects.length) {
			return;
		}
		const queryParts = [];
		const binds = [];
		for (const subject of product.subjects) {
			const idx = binds.push(subject);
			queryParts.push(`(${assetId}, $${idx})`);
		}
		const query = `
			INSERT INTO
				asset_subject
				(asset_id, subject_code)
			VALUES
				${queryParts.join(", ")}
			ON CONFLICT
				(asset_id, subject_code)
			DO NOTHING
		`;
		await this.databaseQuerier.query(query, binds);
	}

	private async _handleAuthors(product: IProduct, assetId: number) {
		if (!Array.isArray(product.authors) || !product.authors.length) {
			return;
		}
		const authorHashToIdMap = Object.create(null);
		{
			const queryParts = [];
			const binds = [];
			const authorsProcessed = Object.create(null);
			for (const author of product.authors as unknown as IAuthor[]) {
				const hash = getAuthorHash(author);
				if (!authorsProcessed[hash]) {
					authorsProcessed[hash] = true;
					const b1 = binds.push(author.firstName);
					const b2 = binds.push(author.lastName);
					queryParts.push(`($${b1}, $${b2})`);
				}
			}
			const text = `
				INSERT INTO
					author
					(first_name, last_name)
				VALUES
					${queryParts.join(", ")}
				ON CONFLICT
					(first_name, last_name)
				DO UPDATE SET
					first_name = EXCLUDED.first_name,
					last_name = EXCLUDED.last_name,
					date_edited = NOW()
				RETURNING
					id,
					first_name,
					last_name
			`;
			const authorResult = await this.databaseQuerier.query(text, binds);
			authorResult.rows.forEach((row) => {
				const hash = getAuthorHash({
					firstName: row.first_name,
					lastName: row.last_name,
				});
				authorHashToIdMap[hash] = row.id;
			});
		}
		{
			const assetAuthorJoinsDone = Object.create(null);
			const binds: TJsonValue[] = [];
			const queryParts: string[] = [];
			product.authors.forEach((a) => {
				const author = a as IAuthor;
				const hash = getAuthorHash(author);
				const dbId = authorHashToIdMap[hash];
				const assetAuthorJoinsHash = `${assetId}//${dbId}//${author.roleCode}`;
				if (!assetAuthorJoinsDone[assetAuthorJoinsHash]) {
					assetAuthorJoinsDone[assetAuthorJoinsHash] = true;
					const bindCounter = binds.push(author.roleCode || null);
					queryParts.push(`(${assetId}, ${dbId}, $${bindCounter}, ${author.sequenceNumber})`);
				}
			});

			await this.databaseQuerier.query(
				`
					DELETE FROM
						asset_authors
					WHERE
						asset_id = ${assetId}
				`
			);

			await this.databaseQuerier.query(
				`
					INSERT INTO
						asset_authors
							(asset_id, author_id, role_code, sort_order)
						VALUES
							${queryParts.join(", ")}
						ON CONFLICT
							(asset_id, author_id, role_code)
						DO UPDATE SET
							sort_order = EXCLUDED.sort_order,
							date_edited = NOW()
				`,
				binds
			);
		}
	}

	private async _insertAssetGroup(product: IProduct, publisherId: number) {
		if (
			!(
				product.parentAsset &&
				product.parentAsset.identifier &&
				product.parentAsset.title &&
				product.contentForm === "MI"
			)
		) {
			return 0;
		}
		return (
			await this.databaseQuerier.query(
				`
				INSERT INTO
					asset_group
					(
						identifier,
						title,
						publisher_id,
						publisher_name_log
					)
				VALUES
					(
						$1,
						$2,
						$3,
						$4
					)
				ON CONFLICT
					(identifier)
				DO UPDATE SET
					title = EXCLUDED.title,
					publisher_id = EXCLUDED.publisher_id,
					publisher_name_log = EXCLUDED.publisher_name_log
				RETURNING
					id
			`,
				[product.parentAsset.identifier, product.parentAsset.title, publisherId, product.publisher]
			)
		).rows[0].id;
	}

	public async updateAssets(deets: { pdfIsbn13: string; fileFormat: string; pageCount: number }[]) {
		const chunks = arrayChunk(deets, 200);
		for (const chunk of chunks) {
			const binds = [];
			const values = [];

			for (const asset of chunk) {
				values.push(`(
					$${binds.push(asset.pdfIsbn13)},
					$${binds.push(asset.fileFormat)},
					$${binds.push(asset.pageCount)}
				)`);
			}
			await this.databaseQuerier.query(
				`
					UPDATE
						asset
					SET
						file_format = v.file_format,
						page_count = v.page_count::INTEGER + COALESCE(ARRAY_LENGTH(copy_excluded_pages, 1), 0),
						active = TRUE,
						date_system_asset_created = COALESCE(date_system_asset_created, date_created, NOW()),
						date_edited = NOW()
					FROM
						(VALUES ${values.join(", ")})
						AS v(pdf_isbn13, file_format, page_count)
					WHERE
						asset.pdf_isbn13 = v.pdf_isbn13
				`,
				binds
			);
		}
		{
			const values = [];
			const binds = [];
			for (const asset of deets) {
				values.push(`$${binds.push(asset.pdfIsbn13)}`);
			}
			await this.databaseQuerier.query(
				`
					UPDATE
						asset
					SET
						active = FALSE,
						date_edited = NOW()
					WHERE
						pdf_isbn13 NOT IN (${values.join(", ")})
				`,
				binds
			);
		}
	}

	private async _insertAsset(
		product: IProduct,
		publisherId: number,
		imprintId: number,
		assetGroupId: number,
		toc: ITocItem[] | null | undefined
	) {
		const authorsForLog = Array.isArray(product.authors)
			? product.authors
					.sort((a, b) => (a.sequenceNumber < b.sequenceNumber ? -1 : a.sequenceNumber > b.sequenceNumber ? 1 : 0))
					.map((author) => ({
						role: getShortAuthorRole(author.roleCode),
						firstName: author.firstName,
						lastName: author.lastName,
					}))
			: [];
		if (product.subjects) {
			product.subjects.sort();
		}
		const subjectCodesForLog = product.subjects;
		const contentForm = product.contentForm || "BO";
		const fieldValues: [string, TJsonValue | undefined | Date][] = [
			[
				`parent_asset_group_identifier_log`,
				product.parentAsset && product.parentAsset.identifier ? product.parentAsset.identifier : null,
			],
			[`parent_asset_group_id`, assetGroupId],
			[`title`, product.title],
			[`sub_title`, product.subtitle],
			[`description`, product.description],
			[`edition`, product.edition],
			[`extent_page_count`, product.extent],
			[`record_reference`, product.recordReference],
			[`table_of_contents`, product.toc],
			[
				`table_of_contents_stripped`,
				toc && toc.length && contentForm === "MI" ? toc.map((item) => item.label).join("; ") : null,
			],
			[
				`table_of_contents_description_stripped`,
				toc && toc.length && contentForm === "MI"
					? toc
							.filter((item) => !!item.description)
							.map((item) => item.description)
							.join("; ")
					: null,
			],
			[`publication_date`, product.publicationDate ? new Date(product.publicationDate * 1000) : null],
			[`isbn13`, product.isbn13],
			[`alternate_isbn13`, product.alternateIsbn13 || null],
			[`pdf_isbn13`, product.pdfIsbn13],
			[`subject_codes_log`, JSON.stringify(subjectCodesForLog)],
			[`publisher_id`, publisherId],
			[`publisher_name_log`, product.publisher],
			[`authors_log`, JSON.stringify(authorsForLog)],
			[`authors_string`, authorsForLog.map((auth) => auth.firstName + " " + auth.lastName).join("; ")],
			[`imprint`, product.imprint],
			[`imprint_id`, imprintId],
			[`page_offset_roman`, product.pageOffsetRoman],
			[`page_offset_arabic`, product.pageOffsetArabic],
			[`content_form`, contentForm],
			[`doi`, product.doi || null],
			[`issue_number`, product.issueNumber || null],
			[`volume_number`, product.volumeNumber || null],
			[`copy_excluded_pages`, Array.isArray(product.copyExcludedPages) ? product.copyExcludedPages : null],
			[`date_edited`, "NOW()"],
			[`auto_unlocked`, contentForm === "MI"],
			[`is_born_digital`, true],
			[`is_ep`, false],
		];
		const fieldNames = fieldValues.map((fv) => fv[0]);
		const values = fieldValues.map((fv) => fv[1]);

		const existing = await this.databaseQuerier.query(
			`
				SELECT
					id,
					isbn13,
					alternate_isbn13,
					pdf_isbn13
				FROM
					asset
				WHERE
					isbn13 IN ($1, $2, $3)
					OR alternate_isbn13 IN ($1, $2, $3)
					OR pdf_isbn13 IN ($1, $2, $3)
			`,
			[product.isbn13, product.alternateIsbn13, product.pdfIsbn13]
		);

		if (existing.rows.length > 0) {
			const existingAsset = existing.rows[0];
			if (
				existingAsset.pdf_isbn13 != product.pdfIsbn13 ||
				existingAsset.isbn13 != product.isbn13 ||
				(existingAsset.alternate_isbn13 &&
					product.alternateIsbn13 &&
					existingAsset.alternate_isbn13 != product.alternateIsbn13)
			) {
				const parts = [];
				if (existingAsset.pdf_isbn13 != product.pdfIsbn13) {
					parts.push(
						"[existing pdf isbn = " + existingAsset.pdf_isbn13 + "; incoming pdf isbn = " + product.pdfIsbn13 + "]"
					);
				}
				if (existingAsset.isbn13 != product.isbn13) {
					parts.push("[existing isbn = " + existingAsset.isbn13 + "; incoming isbn = " + product.isbn13 + "]");
				}
				if (
					existingAsset.alternate_isbn13 &&
					product.alternateIsbn13 &&
					existingAsset.alternate_isbn13 != product.alternateIsbn13
				) {
					parts.push(
						"[existing alternate isbn = " +
							existingAsset.alternate_isbn13 +
							"; incoming alternate isbn = " +
							product.alternateIsbn13 +
							"]"
					);
				}
				throw new Error("Asset already exists with a different ISBN! " + parts.join("; "));
			}
			const updateFieldNames: string[] = [];
			const updateValues: (TJsonValue | Date | undefined)[] = [];
			for (let i = 0, len = fieldNames.length; i < len; ++i) {
				if (fieldNames[i] === "is_ep") {
					continue;
				}
				updateFieldNames.push(fieldNames[i] as string);
				updateValues.push(values[i]);
			}
			await this.databaseQuerier.query(
				`
					UPDATE
						asset
					SET
						${updateFieldNames.map((name, idx) => `${name} = $${idx + 1}`).join(", ")}
					WHERE
						id = ${existingAsset.id}
				`,
				updateValues
			);

			return existingAsset.id;
		}
		const queryParts = fieldValues.map((_, idx) => `$${idx + 1}`);
		const text = `
			INSERT INTO
				asset
				(${fieldNames.join(", ")})
			VALUES
				(${queryParts.join(", ")})
			RETURNING
				id
		`;
		const results = await this.databaseQuerier.query(text, values);
		return results.rows[0].id;
	}

	private async _upsertAssetFragments(product: IProduct, assetId: number, toc?: ITocItem[] | null) {
		// Only magazine issues please
		if (product.contentForm !== "MI") {
			return;
		}
		if (!toc) {
			return;
		}
		const values = [];
		const binds = [];
		for (const tocItem of toc) {
			values.push(`(
				$${binds.push(tocItem.label)},
				$${binds.push(tocItem.page)},
				$${binds.push(tocItem.description)},
				$${binds.push(assetId)}
			)`);
		}
		await this.databaseQuerier.query(
			`
				DELETE FROM
					asset_fragment
				WHERE
					asset_id = $1
			`,
			[assetId]
		);
		if (values.length) {
			await this.databaseQuerier.query(
				`
					INSERT INTO
						asset_fragment
						(title, start_page, description, asset_id)
					VALUES
						${values.join(", ")}
					ON CONFLICT DO NOTHING
				`,
				binds
			);
		}
	}

	private async _insertFiltersEx(filterName: string, filterValues: string[] | null | undefined, assetId: number) {
		if (!filterValues || !filterValues.length) {
			return;
		}
		const binds: TJsonValue[] = [];
		const queryParts: string[] = [];
		filterValues.forEach((item) => {
			const idx = binds.push(item);
			queryParts.push(`(${assetId}, $${idx})`);
		});

		await this.databaseQuerier.query(
			`
				DELETE FROM
					asset_${filterName}
				WHERE
					asset_id = ${assetId}
			`
		);

		await this.databaseQuerier.query(
			`
				INSERT INTO
					asset_${filterName}
					(asset_id, ${filterName})
				VALUES
					${queryParts.join(", ")}
				ON CONFLICT
					(asset_id, ${filterName})
				DO NOTHING
			`,
			binds
		);
	}

	private async _insertFilters(product: IProduct, assetId: number) {
		await this._insertFiltersEx(`educational_year_group`, product.educationalYearGroup, assetId);
		await this._insertFiltersEx(`exam`, product.exam, assetId);
		await this._insertFiltersEx(`exam_board`, product.examBoard, assetId);
		await this._insertFiltersEx(`key_stage`, product.keyStage, assetId);
		await this._insertFiltersEx(`level`, product.level, assetId);
		await this._insertFiltersEx(`scottish_level`, product.scottishLevel, assetId);
		await this._insertFiltersEx(`collection`, product.collection, assetId);
		await this._insertFiltersEx(`language`, product.language, assetId);
	}

	private async _autoUnlockAsset(
		assetId: number,
		isbn13: string,
		alternateIsbn13?: string | null | undefined,
		pdfIsbn13?: string | null | undefined
	) {
		// get all schools that have already attempted to unlock this asset
		const schoolIdsRaw = await this.databaseQuerier.query(
			`
				SELECT
					school_id,
					event
				FROM
					unlock_attempt
				WHERE
					status = '${unlockAttemptStatus.doesNotExist}'
					AND isbn IN ($1, $2, $3)
				ORDER BY
					CASE WHEN event='${unlockEvents.userTempUnlock}' THEN 1 ELSE 0 END ASC
			`,
			[isbn13, alternateIsbn13, pdfIsbn13]
		);
		const schoolRows = schoolIdsRaw.rows;

		if (!schoolRows.length) {
			return;
		}

		const schoolIdsDoneMap = Object.create(null);

		const binds = [];
		const sqlClauses = [];

		for (const schoolInfo of schoolRows) {
			if (!schoolIdsDoneMap[schoolInfo.school_id]) {
				schoolIdsDoneMap[schoolInfo.school_id] = true;
				const schoolIdIdx = binds.push(schoolInfo.school_id);
				const assetIdIdx = binds.push(assetId);
				const boolIdx = binds.push(`TRUE`);
				const expireDate = schoolInfo.event === unlockEvents.userTempUnlock ? `NOW() + INTERVAL '14 days'` : "NULL";
				const isAutoUnlockedIdx = binds.push(`TRUE`);
				sqlClauses.push(`($${schoolIdIdx}, $${assetIdIdx}, $${boolIdx}, ${expireDate}, $${isAutoUnlockedIdx})`);
			}
		}

		// Insert into the asset_school_info
		await this.databaseQuerier.query(
			`
				INSERT INTO
					asset_school_info
					(school_id, asset_id, is_unlocked, expiration_date, is_auto_unlocked)
				VALUES
					${sqlClauses.join(", ")}
				ON CONFLICT
					(school_id, asset_id)
				DO UPDATE SET
					is_unlocked = EXCLUDED.is_unlocked,
					expiration_date = (
						CASE WHEN
							asset_school_info.expiration_date IS NULL
							AND EXCLUDED.expiration_date IS NOT NULL
						THEN
							asset_school_info.expiration_date
						ELSE
							EXCLUDED.expiration_date
						END
					),
					date_edited = NOW()
			`,
			binds
		);
	}

	public async upsert(product: IProduct) {
		//Check product data available or not
		if (!product) {
			return null;
		}
		const publisherId = await this._handlePublisher(product);
		const imprintId = await this._handleImprint(product, publisherId);
		const assetGroupId = await this._insertAssetGroup(product, publisherId);
		const assetId = await this._insertAsset(product, publisherId, imprintId, assetGroupId, product._parsedToc);
		await this._upsertAssetFragments(product, assetId, product._parsedToc);
		await this._handleAssetSubjects(product, assetId);
		await this._handleAuthors(product, assetId);
		await this._autoUnlockAsset(assetId, product.isbn13, product.alternateIsbn13, product.pdfIsbn13);
		await this._insertFilters(product, assetId);
		return assetId;
	}
}
