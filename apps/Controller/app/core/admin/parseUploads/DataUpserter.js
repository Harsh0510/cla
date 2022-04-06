const cheerio = require("cheerio");
const { unlockEvents, unlockAttemptStatus } = require("../../../common/staticValues");

const arrayChunk = (arr, chunkSize) => {
	const chunked = [];
	for (let i = 0, len = arr.length; i < len; i += chunkSize) {
		let max = Math.min(len, i + chunkSize);
		const chunk = [];
		for (let j = i; j < max; ++j) {
			chunk.push(arr[j]);
		}
		chunked.push(chunk);
	}
	return chunked;
};

const getShortAuthorRole = (role) => {
	if (role === "B06") {
		// translator
		return "T";
	}
	if (!role) {
		return "A";
	}
	return role[0].toUpperCase();
};

module.exports = class {
	setDatabaseQuerier(databaseQuerier) {
		this.databaseQuerier = databaseQuerier;
	}

	_getAuthorHash(author) {
		return author.firstName + "@@" + author.lastName;
	}

	async _handlePublisher(client, product) {
		const results = await client.query(
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

	async _handleImprint(client, product, publisherId) {
		if (!product.imprint) {
			return 0;
		}
		const results = await client.query(
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

	async _handleAssetSubjects(client, product, assetId) {
		if (!product.subjects.length) {
			return null;
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
		await client.query(query, binds);
	}

	async _handleAuthors(client, product, assetId) {
		if (!product.authors || !product.authors.length) {
			return null;
		}
		const authorHashToIdMap = Object.create(null);
		{
			const queryParts = [];
			const binds = [];
			const authorsProcessed = Object.create(null);
			for (const author of product.authors) {
				const hash = this._getAuthorHash(author);
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
			const authorResult = await client.query(text, binds);
			authorResult.rows.forEach((row) => {
				const hash = this._getAuthorHash({
					firstName: row.first_name,
					lastName: row.last_name,
				});
				authorHashToIdMap[hash] = row.id;
			});
		}
		{
			const assetAuthorJoinsDone = Object.create(null);
			const binds = [];
			const queryParts = [];
			product.authors.forEach((author) => {
				const hash = this._getAuthorHash(author);
				const dbId = authorHashToIdMap[hash];
				const assetAuthorJoinsHash = `${assetId}//${dbId}//${author.roleCode}`;
				if (!assetAuthorJoinsDone[assetAuthorJoinsHash]) {
					assetAuthorJoinsDone[assetAuthorJoinsHash] = true;
					const bindCounter = binds.push(author.roleCode);
					queryParts.push(`(${assetId}, ${dbId}, $${bindCounter}, ${author.sequenceNumber})`);
				}
			});

			await client.query(
				`
					DELETE FROM
						asset_authors
					WHERE
						asset_id = ${assetId}
				`
			);

			await client.query(
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

	async _insertAssetGroup(client, product, publisherId) {
		if (!(product.parentAsset && product.parentAsset.identifier && product.parentAsset.title && product.contentForm === "MI")) {
			return 0;
		}
		return (
			await client.query(
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

	/**
	 * @param {{pdfIsbn13: string, fileFormat: string, pageCount: number}[]} deets
	 */
	async updateAssets(deets) {
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
						date_system_created = COALESCE(date_system_created, date_created, NOW()),
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

	async _insertAsset(client, product, publisherId, imprintId, assetGroupId, toc) {
		const authorsForLog = product.authors
			.sort((a, b) => (a.sequenceNumber < b.sequenceNumber ? -1 : a.sequenceNumber > b.sequenceNumber ? 1 : 0))
			.map((author) => ({
				role: getShortAuthorRole(author.roleCode),
				firstName: author.firstName,
				lastName: author.lastName,
			}));
		const subjectCodesForLog = product.subjects.sort();
		const contentForm = product.contentForm || "BO";
		const fieldValues = [
			[`parent_asset_group_identifier_log`, product.parentAsset && product.parentAsset.identifier ? product.parentAsset.identifier : null],
			[`parent_asset_group_id`, assetGroupId],
			[`title`, product.title],
			[`sub_title`, product.subtitle],
			[`description`, product.description],
			[`edition`, product.edition],
			[`extent_page_count`, product.extent],
			[`record_reference`, product.recordReference],
			[`table_of_contents`, product.toc],
			[`table_of_contents_stripped`, toc && toc.length && contentForm === "MI" ? toc.map((item) => item.label).join("; ") : null],
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
		];
		const fieldNames = fieldValues.map((fv) => fv[0]);
		const values = fieldValues.map((fv) => fv[1]);

		const existing = await client.query(
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
				(existingAsset.alternate_isbn13 && product.alternateIsbn13 && existingAsset.alternate_isbn13 != product.alternateIsbn13)
			) {
				const parts = [];
				if (existingAsset.pdf_isbn13 != product.pdfIsbn13) {
					parts.push("[existing pdf isbn = " + existingAsset.pdf_isbn13 + "; incoming pdf isbn = " + product.pdfIsbn13 + "]");
				}
				if (existingAsset.isbn13 != product.isbn13) {
					parts.push("[existing isbn = " + existingAsset.isbn13 + "; incoming isbn = " + product.isbn13 + "]");
				}
				if (existingAsset.alternate_isbn13 && product.alternateIsbn13 && existingAsset.alternate_isbn13 != product.alternateIsbn13) {
					parts.push("[existing alternate isbn = " + existingAsset.alternate_isbn13 + "; incoming alternate isbn = " + product.alternateIsbn13 + "]");
				}
				throw new Error("Asset already exists with a different ISBN! " + parts.join("; "));
			}
			const text = `
				UPDATE
					asset
				SET
					${fieldNames.map((name, idx) => `${name} = $${idx + 1}`).join(", ")}
				WHERE
					id = ${existingAsset.id}
			`;
			await client.query(text, values);

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
		const results = await client.query(text, values);
		return results.rows[0].id;
	}

	_parseTableOfContents(toc) {
		if (!toc) {
			return null;
		}
		if (typeof toc !== "string") {
			return null;
		}
		const $ = cheerio.load(toc);
		if (!$) {
			return null;
		}
		const ret = [];
		$("li").each((i, elem) => {
			const $this = $(elem);
			const $label = $this.find("span.label");
			if ($label.length !== 1) {
				return;
			}
			const $firstLabel = $label.first();
			const label = ($firstLabel.text() || "").trim().replace(/\s+/g, " ");
			if (!label) {
				return;
			}
			const $page = $this.find("span.page");
			if ($page.length !== 1) {
				return;
			}
			const pageStr = ($page.first().text() || "").trim();
			if (!pageStr) {
				return;
			}
			const page = parseInt(pageStr, 10);
			if (!page) {
				return;
			}
			if (page <= 0) {
				return;
			}
			const description = (() => {
				let raw = $firstLabel.attr("title");
				if (!raw) {
					return null;
				}
				raw = raw.trim().replace(/\s+/g, " ");
				if (!raw) {
					return null;
				}
				return raw;
			})();
			ret.push({ label, description, page });
		});
		return ret;
	}

	async _upsertAssetFragments(client, product, assetId, toc) {
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
		await client.query(
			`
				DELETE FROM
					asset_fragment
				WHERE
					asset_id = $1
			`,
			[assetId]
		);
		if (values.length) {
			await client.query(
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

	async _insertFiltersEx(client, filterName, filterValues, assetId) {
		if (!filterValues.length) {
			return;
		}
		const binds = [];
		const queryParts = [];
		filterValues.forEach((item) => {
			const idx = binds.push(item);
			queryParts.push(`(${assetId}, $${idx})`);
		});

		await client.query(
			`
				DELETE FROM
					asset_${filterName}
				WHERE
					asset_id = ${assetId}
			`
		);

		await client.query(
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

	async _insertFilters(client, product, assetId) {
		await this._insertFiltersEx(client, `educational_year_group`, product.educationalYearGroup, assetId);
		await this._insertFiltersEx(client, `exam`, product.exam, assetId);
		await this._insertFiltersEx(client, `exam_board`, product.examBoard, assetId);
		await this._insertFiltersEx(client, `key_stage`, product.keyStage, assetId);
		await this._insertFiltersEx(client, `level`, product.level, assetId);
		await this._insertFiltersEx(client, `scottish_level`, product.scottishLevel, assetId);
		await this._insertFiltersEx(client, `collection`, product.collection, assetId);
		await this._insertFiltersEx(client, `language`, product.language, assetId);
	}

	async _autoUnlockAsset(client, assetId, isbn13, alternateIsbn13, pdfIsbn13) {
		// get all schools that have already attempted to unlock this asset
		const schoolIdsRaw = await client.query(
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
		await client.query(
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

	async deleteOrphanedRecords() {
		const client = await this.databaseQuerier.connect();
		try {
			await client.query("BEGIN");

			// delete filters that aren't associated with any assets
			await client.query(`DELETE FROM asset_educational_year_group WHERE asset_id NOT IN (SELECT id FROM asset)`);
			await client.query(`DELETE FROM asset_exam WHERE asset_id NOT IN (SELECT id FROM asset)`);
			await client.query(`DELETE FROM asset_exam_board WHERE asset_id NOT IN (SELECT id FROM asset)`);
			await client.query(`DELETE FROM asset_key_stage WHERE asset_id NOT IN (SELECT id FROM asset)`);
			await client.query(`DELETE FROM asset_level WHERE asset_id NOT IN (SELECT id FROM asset)`);

			// delete authors that aren't associated with any assets
			await client.query(`DELETE FROM asset_authors WHERE asset_id NOT IN (SELECT id FROM asset)`);
			await client.query(`DELETE FROM author WHERE id NOT IN (SELECT author_id FROM asset_authors)`);

			// delete orphaned asset_subject values
			await client.query(`DELETE FROM asset_subject WHERE asset_id NOT IN (SELECT id FROM asset)`);
			await client.query(`DELETE FROM asset_subject WHERE subject_code NOT IN (SELECT code FROM subject)`);

			// delete orphaned publishers
			await client.query(`DELETE FROM publisher WHERE id NOT IN (SELECT publisher_id FROM asset)`);

			// delete orphaned imprints
			await client.query(`DELETE FROM imprint WHERE id NOT IN (SELECT imprint_id FROM asset)`);

			await client.query("COMMIT");
		} catch (e) {
			await client.query("ROLLBACK");
			throw e;
		} finally {
			client.release();
		}
	}

	async upsert(product) {
		//Check product data available or not
		if (!product) {
			return null;
		}
		const toc = this._parseTableOfContents(product.toc);
		const client = await this.databaseQuerier.connect();
		let assetId = 0;
		try {
			await client.query("BEGIN");

			const publisherId = await this._handlePublisher(client, product);
			const imprintId = await this._handleImprint(client, product, publisherId);
			const assetGroupId = await this._insertAssetGroup(client, product, publisherId);
			assetId = await this._insertAsset(client, product, publisherId, imprintId, assetGroupId, toc);
			await this._upsertAssetFragments(client, product, assetId, toc);
			await this._handleAssetSubjects(client, product, assetId);
			await this._handleAuthors(client, product, assetId);
			await this._autoUnlockAsset(client, assetId, product.isbn13, product.alternateIsbn13, product.pdfIsbn13);
			await this._insertFilters(client, product, assetId);

			await client.query("COMMIT");
		} catch (e) {
			await client.query("ROLLBACK");
			throw e;
		} finally {
			client.release();
		}
		return assetId;
	}
};
