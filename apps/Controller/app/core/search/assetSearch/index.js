/**
 * Fetch one or more Assets matching a query string using full-text search.
 */

const ensure = require("#tvf-ensure");
const isUnlockedSql = require("../../../common/isUnlockedSql");
const augmentWithFragmentsAndRemoveIds = require("./augmentWithFragmentsAndRemoveIds");
const getAssetFormatTitle = require("../../../common/getAssetFormatTitle");
const getAllowedTypes = require("../common/getAllowedTypes");
const augmentWithUploadedExtractsAndRemoveIds = require("./augmentWithUploadedExtractsAndRemoveIds");
const allowedFilterTypes = getAllowedTypes.filterTypes;
const niceLanguagesMap = getAllowedTypes.niceLanguagesMap;

const getNiceLanguage = (code) => {
	return niceLanguagesMap[code] ? niceLanguagesMap[code] : code;
};

module.exports = async function (params, ctx) {
	// Make sure provided query, offset and limit are sensible.
	ensure.nonNegativeInteger(ctx, params.offset, "Offset");
	if (params.query) {
		ensure.nonEmptyStr(ctx, params.query, "Query");
	}

	if (!(params.limit && typeof params.limit === "number" && Math.floor(params.limit) == params.limit && params.limit > 0 && params.limit <= 100)) {
		ctx.throw(400, "Valid limit not provided");
	}

	// Searching requires the user to be logged in - make sure they are.
	const userSessionData = await ctx.getSessionData();

	const schoolId = parseInt(userSessionData ? userSessionData.school_id : 0, 10) || 0;
	const userId = parseInt(userSessionData ? userSessionData.user_id : 0, 10) || 0;
	const isLoggedIn = userSessionData ? true : false;

	const filterBy = {
		allCopies: false,
		myCopies: false,
		//mySchoolLibrary: false,
		unlockBooks: false,
		allExtracts: false,
	};
	const activeFilters = Object.create(null);
	activeFilters.subject = null;
	const filterRequest = {};
	if (params.filter && typeof params.filter === "object") {
		if (Array.isArray(params.filter.subject)) {
			activeFilters.subject = params.filter.subject;
		}
		if (Array.isArray(params.filter.misc)) {
			for (const filter of params.filter.misc) {
				switch (filter) {
					case "all_copies":
						filterBy.allCopies = true;
						break;
					case "my_copies":
						filterBy.myCopies = true;
						break;
					case "unlock_books":
						filterBy.unlockBooks = true;
						break;
					// case 'my_school_library':
					// 	filterBy.mySchoolLibrary = true;
					// 	break;
					case "all_extracts":
						filterBy.allExtracts = true;
						break;
				}
			}
		}
		for (const allowedFilterType in allowedFilterTypes) {
			if (params.filter[allowedFilterType]) {
				filterRequest[allowedFilterType] = params.filter[allowedFilterType];
			}
		}
	}

	let queryValues = [];
	let queryWhereClause;
	let queryOrderByClause;
	let queryJoinClause = "";
	//For filterBy query and joins for My Library
	const extractJoin = `INNER JOIN extract ON extract.asset_id = asset.id`;
	const allCopiesExtractWhere = `(extract.school_id = ${schoolId})`;

	const myCopiesExtractWhere = `(extract.user_id = ${userId})`;
	const assetSchoolInfoJoin = `LEFT JOIN asset_school_info ON asset_school_info.asset_id = asset.id AND asset_school_info.school_id = ${schoolId}`;
	const unlockBookWhere = `(${isUnlockedSql(isLoggedIn)} = TRUE)`;
	const assetUserUploadJoin = `INNER JOIN asset_user_upload ON asset_user_upload.asset_id = asset.id `;

	{
		const joinClauses = Object.create(null);
		joinClauses.asset_user_upload = "LEFT JOIN asset_user_upload ON asset_user_upload.asset_id = asset.id";
		joinClauses.cla_user = "LEFT JOIN cla_user ON cla_user.id = asset_user_upload.user_id";
		const orderBy = [];
		const whereClauses = ["asset.active", "asset.is_ep", "(asset.date_system_created IS NOT NULL OR cla_user.school_id = " + schoolId + ")"];
		if (params.query) {
			const idx = queryValues.push(params.query);
			whereClauses.push(`(weighted_tsv @@ plainto_tsquery($${idx}))`);
			orderBy.push(`ts_rank_cd(weighted_tsv, plainto_tsquery($${idx})) DESC`);
		}
		if (activeFilters.subject) {
			const subjectValues = [];
			for (const subject of activeFilters.subject) {
				if (subject.match(/^[A-Z]+$/)) {
					if (subject.length === 3) {
						subjectValues.push(`(asset_subject.third_level_subject_code = '${subject}')`);
					} else {
						subjectValues.push(`(asset_subject.fourth_level_subject_code = '${subject}')`);
					}
				}
			}
			if (subjectValues.length) {
				joinClauses.asset_subject = `INNER JOIN asset_subject ON asset.id = asset_subject.asset_id`;
				whereClauses.push("(" + subjectValues.join(" OR ") + ")");
			}
		}

		if (filterBy.unlockBooks) {
			joinClauses.asset_school_info = assetSchoolInfoJoin;
			whereClauses.push(unlockBookWhere);
		}

		if (filterBy.allCopies) {
			joinClauses.extract = extractJoin;
			whereClauses.push(allCopiesExtractWhere);
		}

		if (filterBy.myCopies) {
			if (!filterBy.allCopies) {
				joinClauses.extract = extractJoin;
			}
			whereClauses.push(myCopiesExtractWhere);
		}
		if (filterBy.allExtracts) {
			joinClauses.asset_user_upload = assetUserUploadJoin;
			// whereClauses.push(myCopiesExtractWhere);
		}

		if (!joinClauses.asset_school_info) {
			joinClauses.asset_school_info = `LEFT JOIN asset_school_info
				ON asset_school_info.asset_id = asset.id
				AND asset_school_info.school_id = ${schoolId}
			`;
		}
		if (userId) {
			joinClauses.asset_user_info = `LEFT JOIN asset_user_info ON asset_user_info.asset_id = asset.id AND asset_user_info.user_id = ${userId}`;
		}
		for (const filterRequestType in filterRequest) {
			if (!filterRequest.hasOwnProperty(filterRequestType)) {
				continue;
			}
			const filterRequestValues = filterRequest[filterRequestType];
			const subWhereClauses = [];
			if (filterRequestType != "publisher" && filterRequestType != "format") {
				joinClauses[`filter_${filterRequestType}`] = `
					LEFT JOIN asset_${filterRequestType} af_${filterRequestType} ON
						asset.id = af_${filterRequestType}.asset_id
				`;
				for (const value of filterRequestValues) {
					const idx1 = queryValues.push(value);
					subWhereClauses.push(`(af_${filterRequestType}.${filterRequestType} = $${idx1})`);
				}
				whereClauses.push("(" + subWhereClauses.join(" OR ") + ")");
			}
			if (filterRequestType === "publisher") {
				let publisherWhereClause = "";
				publisherWhereClause += "asset.publisher_name_log IN (";
				let i = 1;
				for (const value of filterRequestValues) {
					const idx1 = queryValues.push(value);
					if (filterRequestValues.length > i) {
						publisherWhereClause += `$${idx1} ,`;
					} else {
						publisherWhereClause += `$${idx1}`;
					}
					i++;
				}
				publisherWhereClause += `)`;
				//whereClauses.push('(' + subWhereClauses.join(' AND ') + ')');
				whereClauses.push("(" + publisherWhereClause + ")");
			}

			if (filterRequestType === "format") {
				let contentFormWhereClause = "";
				contentFormWhereClause += "content_form IN (";
				let i = 1;
				for (const value of filterRequestValues) {
					const idx1 = queryValues.push(value);
					if (filterRequestValues.length > i) {
						contentFormWhereClause += `$${idx1} ,`;
					} else {
						contentFormWhereClause += `$${idx1}`;
					}
					i++;
				}
				contentFormWhereClause += `)`;
				//whereClauses.push('(' + subWhereClauses.join(' AND ') + ')');
				whereClauses.push("(" + contentFormWhereClause + ")");
			}
		}
		queryWhereClause = whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";
		orderBy.push("id DESC");
		queryOrderByClause = orderBy.join(",");
		queryJoinClause = Object.values(joinClauses).join(" ");
	}

	try {
		// Fetch the unfiltered result count to help the front-end paginate the results.
		let unfilteredCount;
		{
			const text = `
				SELECT
					COUNT(DISTINCT asset.id) AS _count_
				FROM
					asset
				${queryJoinClause}
				${queryWhereClause}
			`;
			const results = await ctx.appDbQuery(text, queryValues);
			unfilteredCount = parseInt(results.rows[0]._count_, 10);
		}
		// Assuming some results are available, fetch their Asset IDs.
		let results;
		if (unfilteredCount > 0) {
			const text = `
				SELECT
					id,
					title,
					content_form,
					publisher,
					authors,
					is_unlocked,
					isbn13,
					pdf_isbn13,
					sub_title,
					publication_date,
					edition,
					subject_codes_log,
					copies_count,
					is_favorite,
					auto_unlocked,
					can_copy_in_full,
					is_system_asset
				FROM (
					SELECT
						DISTINCT ON (asset.id)

						asset.id AS id,
						asset.content_form AS content_form,
						asset.title AS title,
						asset.publisher_name_log AS publisher,
						asset.authors_log AS authors,
						${isUnlockedSql(isLoggedIn)} AS is_unlocked,
						asset.isbn13 AS isbn13,
						asset.pdf_isbn13 AS pdf_isbn13,
						asset.sub_title AS sub_title,
						asset.publication_date AS publication_date,
						asset.edition AS edition,
						asset.subject_codes_log AS subject_codes_log,
						asset.weighted_tsv AS weighted_tsv,
						CASE WHEN ${userId} != 0 THEN (SELECT COUNT(*) FROM extract WHERE asset_id = asset.id and school_id = ${schoolId} )
							ELSE 0
						END AS copies_count,
						${userId ? "COALESCE(asset_user_info.is_favorite, FALSE)" : "FALSE"} AS is_favorite,
						asset.auto_unlocked AS auto_unlocked,
						asset.can_copy_in_full AS can_copy_in_full,
						asset.date_system_created IS NOT NULL AS is_system_asset
					FROM asset
						${queryJoinClause}
						${queryWhereClause}
					ORDER BY
						asset.id DESC
					) AS sub
				ORDER BY
					${queryOrderByClause}
				LIMIT
					${params.limit}
				OFFSET
					${params.offset}
			`;
			results = (await ctx.appDbQuery(text, queryValues)).rows;
			if (params.query && results.length) {
				await augmentWithFragmentsAndRemoveIds(ctx.appDbQuery.bind(ctx), results, params.query);
			}
			await augmentWithUploadedExtractsAndRemoveIds(ctx.appDbQuery.bind(ctx), results, params.query);
		} else {
			results = [];
		}

		//Get filter data with count
		let queryFilterValues = [];
		let queryFilterWhereClause;
		let queryFilterJoinClause = "";
		let resultFilter = [];
		//All filter counts data
		let resultFilterCount = 0;
		{
			const joinClauses = Object.create(null);
			const orderBy = [];
			const whereClauses = ["asset.active", "asset.is_ep"];

			if (params.query) {
				const idx = queryFilterValues.push(params.query);
				whereClauses.push(`(weighted_tsv @@ plainto_tsquery($${idx}))`);
				orderBy.push(`ts_rank_cd(weighted_tsv, plainto_tsquery($${idx})) DESC`);
			}

			if (filterBy.unlockBooks) {
				joinClauses.asset_school_info = assetSchoolInfoJoin;
				whereClauses.push(unlockBookWhere);
			}

			if (filterBy.allCopies) {
				joinClauses.extract = extractJoin;
				whereClauses.push(allCopiesExtractWhere);
			}
			if (filterBy.myCopies) {
				if (!filterBy.allCopies) {
					joinClauses.extract = extractJoin;
				}
				whereClauses.push(myCopiesExtractWhere);
			}
			if (filterBy.allExtracts) {
				joinClauses.assetUserUpload = assetUserUploadJoin;
			}
			if (activeFilters.subject) {
				const subjectValues = [];
				for (const subject of activeFilters.subject) {
					if (subject.match(/^[A-Z]+$/)) {
						if (subject.length === 3) {
							subjectValues.push(`(asset_subject.third_level_subject_code = '${subject}')`);
						} else {
							subjectValues.push(`(asset_subject.fourth_level_subject_code = '${subject}')`);
						}
					}
				}
				if (subjectValues.length) {
					whereClauses.push("(" + subjectValues.join(" OR ") + ")");
				}
			}

			joinClauses.asset_subject = `LEFT JOIN asset_subject ON asset.id = asset_subject.asset_id`;
			joinClauses.third_level_subject = `LEFT JOIN third_level_subject ON third_level_subject.code = asset_subject.third_level_subject_code`;
			joinClauses.fourth_level_subject = `LEFT JOIN fourth_level_subject ON fourth_level_subject.code = asset_subject.fourth_level_subject_code`;

			for (const filterRequestType in allowedFilterTypes) {
				if (filterRequestType != "publisher" && filterRequestType != "format") {
					joinClauses[`filter_${filterRequestType}`] = `
						LEFT JOIN asset_${filterRequestType} af_${filterRequestType} ON
							asset.id = af_${filterRequestType}.asset_id
					`;
				}
			}

			for (const filterRequestType in filterRequest) {
				const filterRequestValues = filterRequest[filterRequestType];
				const subWhereClauses = [];
				if (filterRequestType != "publisher" && filterRequestType != "format") {
					for (const value of filterRequestValues) {
						const idx1 = queryFilterValues.push(value);
						subWhereClauses.push(`(af_${filterRequestType}.${filterRequestType} = $${idx1})`);
					}
					whereClauses.push("(" + subWhereClauses.join(" OR ") + ")");
				}

				if (filterRequestType === "publisher") {
					let publisherWhereClause = "";
					publisherWhereClause += "asset.publisher_name_log IN (";
					let i = 1;
					for (const value of filterRequestValues) {
						const idx2 = queryFilterValues.push(value);
						if (filterRequestValues.length > i) {
							publisherWhereClause += `$${idx2} ,`;
						} else {
							publisherWhereClause += `$${idx2}`;
						}
						i++;
					}
					publisherWhereClause += `)`;
					//whereClauses.push('(' + subWhereClauses.join(' AND ') + ')');
					whereClauses.push("(" + publisherWhereClause + ")");
				}
				if (filterRequestType === "format") {
					let contentFormWhereClause = "";
					contentFormWhereClause += "content_form IN (";
					let i = 1;
					for (const value of filterRequestValues) {
						const idx2 = queryFilterValues.push(value);
						if (filterRequestValues.length > i) {
							contentFormWhereClause += `$${idx2} ,`;
						} else {
							contentFormWhereClause += `$${idx2}`;
						}
						i++;
					}
					contentFormWhereClause += `)`;
					//whereClauses.push('(' + subWhereClauses.join(' AND ') + ')');
					whereClauses.push("(" + contentFormWhereClause + ")");
				}
			}

			queryFilterWhereClause = whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";
			orderBy.push("id DESC");
			queryOrderByClause = orderBy.join(",");
			queryFilterJoinClause = Object.values(joinClauses).join(" ");
		}

		// count_unlockbooks
		let additionalJoin = "";
		let additionalQuery = "";
		{
			let countUnlockBooks = 0;
			{
				if (queryFilterJoinClause.indexOf(assetSchoolInfoJoin) == -1) {
					additionalJoin = " " + assetSchoolInfoJoin;
				}
				if (queryFilterWhereClause.indexOf(unlockBookWhere) == -1) {
					additionalQuery = " AND " + unlockBookWhere;
				}
				let unlockBookQueryJoin = queryFilterJoinClause.replace(extractJoin, " ");
				let queryWithoutALLCopies = queryFilterWhereClause.replace(" AND " + allCopiesExtractWhere, " ");
				let unlockQueryWhere = queryWithoutALLCopies.replace(" AND " + myCopiesExtractWhere, " ");

				const text = `
					SELECT
						COUNT(DISTINCT asset.id) AS count_unlockbooks
					FROM
						asset
					${unlockBookQueryJoin}
					${additionalJoin}
					${unlockQueryWhere}
					${additionalQuery}
				`;
				const results = await ctx.appDbQuery(text, queryFilterValues);
				countUnlockBooks = parseInt(results.rows[0].count_unlockbooks, 10);
			}

			//for All Copies
			let countAllCopies = 0;
			{
				additionalJoin = "";
				additionalQuery = "";
				if (queryFilterJoinClause.indexOf(extractJoin) == -1) {
					additionalJoin = " " + extractJoin;
				}
				if (queryFilterWhereClause.indexOf(allCopiesExtractWhere) == -1) {
					additionalQuery = " AND " + allCopiesExtractWhere;
				}
				//replace with My copies join and where condition
				let queryWithoutMyCopiesWhere = queryFilterWhereClause.replace(" AND " + myCopiesExtractWhere, " ");

				const text = `
					SELECT
						COUNT(DISTINCT asset.id) AS count_allcopies
					FROM
						asset
					${queryFilterJoinClause}
					${additionalJoin}
					${queryWithoutMyCopiesWhere}
					${additionalQuery}
				`;
				const results = await ctx.appDbQuery(text, queryFilterValues);
				countAllCopies = parseInt(results.rows[0].count_allcopies, 10);
			}

			//Count my copies
			let countMyCopies = 0;
			{
				additionalJoin = "";
				additionalQuery = "";
				if (queryFilterJoinClause.indexOf(extractJoin) == -1) {
					additionalJoin = " " + extractJoin;
				}
				if (queryFilterWhereClause.indexOf(myCopiesExtractWhere) == -1) {
					additionalQuery = " AND " + myCopiesExtractWhere;
				}

				const text = `
					SELECT
						COUNT(DISTINCT asset.id) AS count_mycopies
					FROM
						asset
					${queryFilterJoinClause}
					${additionalJoin}
					${queryFilterWhereClause}
					${additionalQuery}
				`;
				const results = await ctx.appDbQuery(text, queryFilterValues);
				countMyCopies = parseInt(results.rows[0].count_mycopies, 10);
			}

			//All Filter counts data
			{
				//replace with My copies join and where condition
				let queryJoinWithoutExtract = queryFilterJoinClause.replace(extractJoin, " ");
				let queryJoinWithoutExtractWhere = queryFilterWhereClause.replace(" AND " + allCopiesExtractWhere, " ");

				//replace with My copies join and where condition
				let myCopiesQueryJoin = queryJoinWithoutExtract.replace(extractJoin, " ");
				let myCopiesQueryWhere = queryJoinWithoutExtractWhere.replace(" AND " + myCopiesExtractWhere, " ");

				//replace with My institution library join and where condition
				myCopiesQueryJoin = myCopiesQueryJoin.replace(assetSchoolInfoJoin, " ");
				myCopiesQueryWhere = myCopiesQueryWhere.replace(" AND " + unlockBookWhere, " ");

				const text = `
					SELECT
						COUNT(DISTINCT asset.id) AS count_all
					FROM
						asset
					${myCopiesQueryJoin}
					${myCopiesQueryWhere}
				`;
				const results = await ctx.appDbQuery(text, queryFilterValues);
				resultFilterCount = parseInt(results.rows[0].count_all, 10);
			}

			//Count user uploaded extracts
			let countAllExtracts = 0;
			{
				additionalJoin = "";
				additionalQuery = "";
				if (queryFilterJoinClause.indexOf(assetUserUploadJoin) == -1) {
					additionalJoin = " " + assetUserUploadJoin;
				}

				const text = `
					SELECT
						COUNT(DISTINCT asset.id) AS count_allextracts
					FROM
						asset
					${queryFilterJoinClause}
					${additionalJoin}
					${queryFilterWhereClause}
					${additionalQuery}
				`;
				const results = await ctx.appDbQuery(text, queryFilterValues);
				countAllExtracts = parseInt(results.rows[0].count_allextracts, 10);
			}

			const copiesData = [];

			if (countAllCopies > 0) {
				copiesData.push({ id: "all_copies", title: "All Copies", count: countAllCopies });
			}

			if (countUnlockBooks > 0) {
				copiesData.push({ id: "unlock_books", title: "Unlocked Content", count: countUnlockBooks });
			}

			if (countMyCopies > 0) {
				copiesData.push({ id: "my_copies", title: "My copies only", count: countMyCopies });
			}

			if (countAllExtracts > 0) {
				copiesData.push({ id: "all_extracts", title: "All Extracts", count: countAllExtracts });
			}
			resultFilter.push({
				id: "misc",
				title: "My Library",
				data: copiesData,
			});
		}

		// bind subjects
		let subjectsThirdLevelData = {};
		{
			const thirdLevelSubjects = (
				await ctx.appDbQuery(
					`
				SELECT
						third_level_subject.code AS id,
						third_level_subject.name AS title,
						COUNT(DISTINCT asset.id) AS count
				FROM asset
					${queryFilterJoinClause}
					${queryFilterWhereClause}
					AND third_level_subject.code IS NOT NULL
				GROUP BY
					third_level_subject.code
				ORDER BY
					third_level_subject.name ASC,
					third_level_subject.code ASC
			`,
					queryFilterValues
				)
			).rows;

			const fourLevelSubjects = (
				await ctx.appDbQuery(
					`
				SELECT
						fourth_level_subject.code AS id,
						fourth_level_subject.name AS title,
						COUNT(DISTINCT asset.id) AS count
				FROM asset
					${queryFilterJoinClause}
					${queryFilterWhereClause}
					AND fourth_level_subject.code IS NOT NULL
				GROUP BY
					fourth_level_subject.code
				ORDER BY
					fourth_level_subject.name ASC,
					fourth_level_subject.code ASC
			`,
					queryFilterValues
				)
			).rows;

			subjectsThirdLevelData = thirdLevelSubjects.map((row) => ({
				id: row.id,
				title: row.title,
				count: row.count,
				child_subjects: fourLevelSubjects
					.filter((child) => child.id.substring(0, 3) === row.id)
					.map((child_subject) => ({
						id: child_subject.id,
						title: child_subject.title,
						count: child_subject.count,
					})),
			}));
		}

		//Get other filters data
		{
			const resultLevel = (
				await ctx.appDbQuery(
					`
					SELECT
						af_level.level AS value,
						COUNT(DISTINCT asset.id) AS count
					FROM
						asset
						${queryFilterJoinClause}
						${queryFilterWhereClause}
						AND af_level.level IS NOT NULL
					GROUP BY
						af_level.level
					ORDER BY
						af_level.level ASC
				`,
					queryFilterValues
				)
			).rows;
			const resultScottishLevel = (
				await ctx.appDbQuery(
					`
					SELECT
						af_scottish_level.scottish_level AS value,
						COUNT(DISTINCT asset.id) AS count
					FROM
						asset
						${queryFilterJoinClause}
						${queryFilterWhereClause}
						AND af_scottish_level.scottish_level IS NOT NULL
					GROUP BY
						af_scottish_level.scottish_level
					ORDER BY
						af_scottish_level.scottish_level ASC
				`,
					queryFilterValues
				)
			).rows;
			const resultCollection = (
				await ctx.appDbQuery(
					`
					SELECT
						af_collection.collection AS value,
						COUNT(DISTINCT asset.id) AS count
					FROM
						asset
						${queryFilterJoinClause}
						${queryFilterWhereClause}
						AND af_collection.collection IS NOT NULL
					GROUP BY
						af_collection.collection
					ORDER BY
						af_collection.collection ASC
				`,
					queryFilterValues
				)
			).rows;
			const resultExam = (
				await ctx.appDbQuery(
					`
					SELECT
						af_exam.exam AS value,
						COUNT(DISTINCT asset.id) AS count
					FROM
						asset
						${queryFilterJoinClause}
						${queryFilterWhereClause}
						AND af_exam.exam IS NOT NULL
					GROUP BY
						af_exam.exam
					ORDER BY
						af_exam.exam ASC
				`,
					queryFilterValues
				)
			).rows;
			const resultContentForm = (
				await ctx.appDbQuery(
					`
					SELECT
						content_form AS value,
						COUNT(DISTINCT asset.id) AS count
					FROM
						asset
						${queryFilterJoinClause}
						${queryFilterWhereClause}
						AND content_form IS NOT NULL
					GROUP BY
						content_form
					ORDER BY
						content_form ASC
				`,
					queryFilterValues
				)
			).rows;
			const resultExamBoard = (
				await ctx.appDbQuery(
					`
					SELECT
						af_exam_board.exam_board AS value,
						COUNT(DISTINCT asset.id) AS count
					FROM
						asset
						${queryFilterJoinClause}
						${queryFilterWhereClause}
						AND af_exam_board.exam_board IS NOT NULL
					GROUP BY
						af_exam_board.exam_board
					ORDER BY
						af_exam_board.exam_board ASC
				`,
					queryFilterValues
				)
			).rows;
			const resultKeyStage = (
				await ctx.appDbQuery(
					`
					SELECT
						af_key_stage.key_stage AS value,
						COUNT(DISTINCT asset.id) AS count
					FROM
						asset
						${queryFilterJoinClause}
						${queryFilterWhereClause}
						AND af_key_stage.key_stage IS NOT NULL
					GROUP BY
						af_key_stage.key_stage
					ORDER BY
						af_key_stage.key_stage ASC
				`,
					queryFilterValues
				)
			).rows;
			const resultPublishers = (
				await ctx.appDbQuery(
					`
					SELECT
						asset.publisher_name_log AS value,
						COUNT(DISTINCT asset.id) AS count
					FROM
						asset
						${queryFilterJoinClause}
						${queryFilterWhereClause}
						AND asset.publisher_id IS NOT NULL
					GROUP BY
						asset.publisher_name_log
					ORDER BY
						asset.publisher_name_log ASC
				`,
					queryFilterValues
				)
			).rows;
			const resultLanguages = (
				await ctx.appDbQuery(
					`
					SELECT
						af_language.language AS value,
						COUNT(DISTINCT asset.id) AS count
					FROM
						asset
						${queryFilterJoinClause}
						${queryFilterWhereClause}
						AND af_language.language IS NOT NULL
					GROUP BY
						af_language.language
					ORDER BY
						af_language.language ASC
				`,
					queryFilterValues
				)
			).rows;

			resultFilter.push({
				id: "format",
				title: `Format`,
				data: resultContentForm.map((item) => ({ id: item.value, title: getAssetFormatTitle(item.value), count: item.count })),
			});

			resultFilter.push({
				id: "language",
				title: "Language",
				data: resultLanguages.map((item) => ({ id: item.value, title: getNiceLanguage(item.value), count: item.count })),
			});

			resultFilter.push({
				id: "level",
				title: `Level`,
				data: resultLevel.map((item) => ({ id: item.value, title: item.value, count: item.count })),
			});

			if (subjectsThirdLevelData.length > 0) {
				resultFilter.push({
					id: "subject",
					title: "Subject",
					data: subjectsThirdLevelData,
				});
			}

			resultFilter.push({
				id: "exam",
				title: `Exam`,
				data: resultExam.map((item) => ({ id: item.value, title: item.value, count: item.count })),
			});

			resultFilter.push({
				id: "exam_board",
				title: `Exam Board`,
				data: resultExamBoard.map((item) => ({ id: item.value, title: item.value, count: item.count })),
			});

			resultFilter.push({
				id: "scottish_level",
				title: `Scottish Class/Stage`,
				data: resultScottishLevel.map((item) => ({ id: item.value, title: item.value, count: item.count })),
			});

			resultFilter.push({
				id: "key_stage",
				title: `Key Stage`,
				data: resultKeyStage.map((item) => ({ id: item.value, title: item.value, count: item.count })),
			});

			resultFilter.push({
				id: "collection",
				title: `Collection`,
				data: resultCollection.map((item) => ({ id: item.value, title: item.value, count: item.count })),
			});

			resultFilter.push({
				id: "publisher",
				title: `Publisher`,
				data: resultPublishers.map((item) => ({ id: item.value, title: item.value, count: item.count })),
			});
		}
		return {
			unfiltered_count: unfilteredCount,
			results: results,
			resultFilter: resultFilter,
			resultFilterCount: resultFilterCount,
		};
	} catch (e) {
		ctx.throw(400, e.message);
	}
};
