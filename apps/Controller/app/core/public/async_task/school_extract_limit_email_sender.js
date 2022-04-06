const sendEmail = require(`../../../common/sendEmail`);
const date = require(`../../../common/date`);
const generateExcelFile = require(`../../../common/generateExcelFile`);
const moment = require(`moment`);
const emailContent = {
	from: null,
	to: "support@educationplatform.zendesk.com",
	subject: "",
	body: "",
};

const MIN_EXTRACT_PERCENTAGE_TO_CONSIDER = 10;

function getSchoolExtractRatio(pageCountExtractedForSchool, pageCount, schoolPercentageRatio) {
	const maxPages = Math.ceil((pageCount * schoolPercentageRatio) / 100); // 64
	const usagePercentage = Math.floor((pageCountExtractedForSchool * schoolPercentageRatio) / maxPages);
	if (usagePercentage < MIN_EXTRACT_PERCENTAGE_TO_CONSIDER) {
		return 0;
	}
	return Math.floor(usagePercentage / 5) * 5;
}

/**
 * Exucute the function based on asynctaskRunner for send an email
 */
module.exports = async function (taskDetails) {
	//get data
	const data = taskDetails.getTaskData();
	const school_id = data.school_id; // this should never be zero
	const asset_id = data.asset_id; // this should never be zero

	// get school ratio
	let allowed_extract_ratio_by_school = 0;
	{
		const result = await taskDetails.query(
			`SELECT
					publisher.school_extract_limit_percentage AS value
				FROM publisher
					INNER JOIN asset on publisher.id = asset.publisher_id
				WHERE asset.id = $1`,
			[asset_id]
		);
		if (result.rowCount === 1) {
			allowed_extract_ratio_by_school = result.rows[0].value;
		}
	}
	if (!allowed_extract_ratio_by_school) {
		// Should very rarely get here. E.g. maybe the school is deleted in the time the task was initially added.
		return;
	}

	// get asset page count
	let asset_page_count = 0;
	{
		const result = await taskDetails.query(`SELECT copyable_page_count AS value FROM asset WHERE id = $1`, [asset_id]);
		if (result.rowCount === 1) {
			asset_page_count = result.rows[0].value;
		}
	}

	if (!asset_page_count) {
		// Why would we be here? It's very rare - e.g. the asset was deleted.
		return;
	}

	// ensure it is possible to create the extract - check for school-wide limits
	let pageCountExtractedForSchool = 0;
	{
		const results = await taskDetails.query(
			`
				SELECT
					COUNT(*) AS _count_
				FROM
					extract_page_by_school
				WHERE
					school_id = $1
					AND asset_id = $2
					AND archive_date IS NULL
			`,
			[school_id, asset_id]
		);
		if (Array.isArray(results.rows) && results.rowCount > 0) {
			pageCountExtractedForSchool = results.rows[0]._count_;
		}
	}

	const percentageExtractedSoFar = getSchoolExtractRatio(pageCountExtractedForSchool, asset_page_count, allowed_extract_ratio_by_school);
	let exportData = [];
	let schoolName,
		assetTitle,
		isbn = "";

	if (percentageExtractedSoFar >= MIN_EXTRACT_PERCENTAGE_TO_CONSIDER) {
		//check with existing database ration from school_extract_email_send_log
		let highestPercentageRatioEmailHasAlreadyBeenSentFor = 0;
		{
			const result = await taskDetails.query(
				`
					SELECT
						asset_id,
						school_id,
						highest_percentage_ratio
					FROM school_extract_email_send_log
					WHERE
						asset_id = $1
						AND school_id = $2
						AND archive_date IS NULL
				`,
				[asset_id, school_id]
			);

			if (result.rows && result.rows.length > 0) {
				highestPercentageRatioEmailHasAlreadyBeenSentFor = result.rows[0].highest_percentage_ratio;
			}
		}

		//check with existing ratio
		if (percentageExtractedSoFar > highestPercentageRatioEmailHasAlreadyBeenSentFor) {
			//Add update the existing db highestPercentageRatioEmailHasAlreadyBeenSentFor  as per percentageExtractedSoFar
			await taskDetails.query(
				`
					INSERT INTO school_extract_email_send_log
					(
						asset_id,
						school_id,
						highest_percentage_ratio
					)
					VALUES (
						$1,
						$2,
						$3
					)
					ON CONFLICT
						(school_id, asset_id)
						WHERE archive_date IS NULL
					DO UPDATE SET
						highest_percentage_ratio = EXCLUDED.highest_percentage_ratio
				`,
				[asset_id, school_id, percentageExtractedSoFar]
			);

			//fetch extract data based on school_id and asset_id
			const result = await taskDetails.query(
				`
					SELECT
						extract.asset_id AS asset_id,
						asset.title AS asset_name,
						asset.isbn13 AS isbn13,
						extract.id AS extract_id,
						extract.title AS extract_name,
						extract.page_count AS extract_page_count,
						extract.date_created AS date_created,
						extract.school_id AS creator_school_id,
						extract.pages AS pages,
						course.title AS course_name,
						school.name AS creator_school_name,
						cla_user.first_name AS creator_first_name,
						cla_user.last_name AS creator_last_name,
						cla_user.middle_names AS creator_middle_names
					FROM
						extract
						INNER JOIN asset ON extract.asset_id = asset.id
						INNER JOIN school ON extract.school_id = school.id
						INNER JOIN cla_user ON extract.user_id = cla_user.id
						INNER JOIN course ON extract.course_id = course.id
					WHERE
						extract.school_id = $1
						AND extract.asset_id = $2
						AND extract.archive_date IS NULL
				`,
				[school_id, asset_id]
			);

			if (result && Array.isArray(result.rows) && result.rows.length > 0) {
				const resultData = result.rows;
				schoolName = resultData[0].creator_school_name;
				assetTitle = resultData[0].asset_name;
				isbn = resultData[0].isbn13;

				//map data for display fields in excel file
				exportData = resultData.map((x) => ({
					"Asset DB ID": x.asset_id,
					"Asset Print ISBN": x.isbn13,
					"Asset Name": x.asset_name,
					"Extract DB ID": x.extract_id,
					"Extract Name": x.extract_name,
					"Extract Pages": x.pages.join(", "),
					"Extract Created Date": date.rawToNiceDateForExcel(x.date_created),
					"Creator Institution ID ": x.creator_school_id,
					"Creator Institution Name": x.creator_school_name,
					"Class Name": x.course_name,
					"Teacher Name": `${x.creator_first_name} ${x.creator_last_name}`,
				}));

				//email content
				let fileName = moment().format("YYYY-MM-DD_HH-MM-SS") + ".pages-used.xlsx";
				const export_ExcelFile = generateExcelFile(exportData, fileName, "Pages Used");
				let attachment = [
					{
						content: export_ExcelFile.attachFiledata,
						filename: export_ExcelFile.fileName,
						contentType: "application/vnd.ms-excel",
					},
				];

				emailContent.subject = `Copy page limit @ ${percentageExtractedSoFar}% for ${assetTitle} at ${schoolName}`;
				emailContent.body = `${assetTitle} ${isbn} is currently at ${percentageExtractedSoFar}% of copy limit at ${schoolName}`;

				await sendEmail.sendTemplate(
					emailContent.from,
					emailContent.to,
					emailContent.subject,
					{
						title: emailContent.subject,
						content: emailContent.body,
						secondary_content: ``,
					},
					attachment,
					"school-extract-limit-reacher-" + percentageExtractedSoFar
				);
			}
		}
	}
};
