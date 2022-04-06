/**
 * Fetch one or more Assets matching a query string using full-text search.
 */
const getAssetFormatTitle = require("../../../common/getAssetFormatTitle");
const getAllowedTypes = require("../common/getAllowedTypes");
const allowedFilterTypes = getAllowedTypes.filterTypes;
const niceLanguagesMap = getAllowedTypes.niceLanguagesMap;

const getNiceLanguage = (code) => {
	return niceLanguagesMap[code] ? niceLanguagesMap[code] : code;
};

module.exports = async function (params, ctx) {
	let queryFilterJoinClause = "";
	let resultFilter = [];
	{
		const joinClauses = Object.create(null);
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
		queryFilterJoinClause = Object.values(joinClauses).join(" ");
	}

	// bind subjects
	let subjectsThirdLevelData = {};
	{
		const thirdLevelSubjects = (
			await ctx.appDbQuery(
				`
				SELECT
						third_level_subject.code AS id,
						third_level_subject.name AS title
				FROM asset
					${queryFilterJoinClause}
				WHERE
					third_level_subject.code IS NOT NULL
				GROUP BY
					third_level_subject.code
				ORDER BY
					third_level_subject.name ASC,
					third_level_subject.code ASC
			`
			)
		).rows;

		subjectsThirdLevelData = thirdLevelSubjects.map((row) => ({
			id: row.id,
			title: row.title,
		}));
	}

	//Get other filters data
	{
		const resultLevel = (
			await ctx.appDbQuery(
				`
					SELECT
						af_level.level AS value
					FROM
						asset
						${queryFilterJoinClause}
					WHERE 
						af_level.level IS NOT NULL
					GROUP BY
						af_level.level
					ORDER BY
						af_level.level ASC
				`
			)
		).rows;
		const resultScottishLevel = (
			await ctx.appDbQuery(
				`
					SELECT
						af_scottish_level.scottish_level AS value
					FROM
						asset
						${queryFilterJoinClause}
					WHERE 
						af_scottish_level.scottish_level IS NOT NULL
					GROUP BY
						af_scottish_level.scottish_level
					ORDER BY
						af_scottish_level.scottish_level ASC
				`
			)
		).rows;
		const resultCollection = (
			await ctx.appDbQuery(
				`
					SELECT
						af_collection.collection AS value
					FROM
						asset
						${queryFilterJoinClause}
					WHERE 
						af_collection.collection IS NOT NULL
					GROUP BY
						af_collection.collection
					ORDER BY
						af_collection.collection ASC
				`
			)
		).rows;
		const resultExam = (
			await ctx.appDbQuery(
				`
					SELECT
						af_exam.exam AS value
					FROM
						asset
						${queryFilterJoinClause}
					WHERE
						af_exam.exam IS NOT NULL
					GROUP BY
						af_exam.exam
					ORDER BY
						af_exam.exam ASC
				`
			)
		).rows;
		const resultContentForm = (
			await ctx.appDbQuery(
				`
					SELECT
						content_form AS value
					FROM
						asset
						${queryFilterJoinClause}
					WHERE
						content_form IS NOT NULL
					GROUP BY
						content_form
					ORDER BY
						content_form ASC
				`
			)
		).rows;
		const resultExamBoard = (
			await ctx.appDbQuery(
				`
					SELECT
						af_exam_board.exam_board AS value
					FROM
						asset
						${queryFilterJoinClause}
					WHERE
						af_exam_board.exam_board IS NOT NULL
					GROUP BY
						af_exam_board.exam_board
					ORDER BY
						af_exam_board.exam_board ASC
				`
			)
		).rows;
		const resultKeyStage = (
			await ctx.appDbQuery(
				`
					SELECT
						af_key_stage.key_stage AS value
					FROM
						asset
						${queryFilterJoinClause}
					WHERE
						af_key_stage.key_stage IS NOT NULL
					GROUP BY
						af_key_stage.key_stage
					ORDER BY
						af_key_stage.key_stage ASC
				`
			)
		).rows;
		const resultPublishers = (
			await ctx.appDbQuery(
				`
					SELECT
						asset.publisher_name_log AS value
					FROM
						asset
						${queryFilterJoinClause}
					WHERE
						asset.publisher_id IS NOT NULL
					GROUP BY
						asset.publisher_name_log
					ORDER BY
						asset.publisher_name_log ASC
				`
			)
		).rows;
		const resultLanguages = (
			await ctx.appDbQuery(
				`
					SELECT
						af_language.language AS value
					FROM
						asset
						${queryFilterJoinClause}
					WHERE
						af_language.language IS NOT NULL
					GROUP BY
						af_language.language
					ORDER BY
						af_language.language ASC
				`
			)
		).rows;

		resultFilter.push({
			id: "format",
			title: `Format`,
			data: resultContentForm.map((item) => ({ id: item.value, title: getAssetFormatTitle(item.value) })),
		});

		resultFilter.push({
			id: "language",
			title: "Language",
			data: resultLanguages.map((item) => ({ id: item.value, title: getNiceLanguage(item.value) })),
		});

		resultFilter.push({
			id: "level",
			title: `Level`,
			data: resultLevel.map((item) => ({ id: item.value, title: item.value })),
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
			data: resultExam.map((item) => ({ id: item.value, title: item.value })),
		});

		resultFilter.push({
			id: "exam_board",
			title: `Exam Board`,
			data: resultExamBoard.map((item) => ({ id: item.value, title: item.value })),
		});

		resultFilter.push({
			id: "scottish_level",
			title: `Scottish Class/Stage`,
			data: resultScottishLevel.map((item) => ({ id: item.value, title: item.value })),
		});

		resultFilter.push({
			id: "key_stage",
			title: `Key Stage`,
			data: resultKeyStage.map((item) => ({ id: item.value, title: item.value })),
		});

		resultFilter.push({
			id: "collection",
			title: `Collection`,
			data: resultCollection.map((item) => ({ id: item.value, title: item.value })),
		});

		resultFilter.push({
			id: "publisher",
			title: `Publisher`,
			data: resultPublishers.map((item) => ({ id: item.value, title: item.value })),
		});
	}
	return {
		resultFilter: resultFilter,
	};
};
