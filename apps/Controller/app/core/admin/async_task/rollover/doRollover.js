const { extractStatus } = require("../../../../common/staticValues");

const rolloverCourses = async (querier, rolloverJobId) => {
	await querier(
		`
			WITH updated_rows AS (
				UPDATE
					course
				SET
					archive_date = NOW(),
					date_edited = NOW()
				FROM
					school
				WHERE
					school.id = course.school_id
					AND school.rollover_job_id = $1
					AND course.archive_date IS NULL
				RETURNING
					course.*
			)
			INSERT INTO
				course
				(
					creator_id,
					title,
					year_group,
					school_id,
					oid,
					number_of_students,
					exam_board,
					key_stage,
					wonde_identifier,
					wonde_mis_id,
					parent_id
				)
			SELECT
				creator_id,
				title,
				year_group,
				school_id,
				oid,
				NULL AS number_of_students,
				exam_board,
				key_stage,
				wonde_identifier,
				wonde_mis_id,
				id
			FROM
				updated_rows
		`,
		[rolloverJobId]
	);
};

const rolloverExtracts = async (querier) => {
	await querier(
		`
		WITH updated_rows AS (
			UPDATE
				extract
			SET
				archive_date = course.archive_date,
				date_edited = NOW()
			FROM
				course
			WHERE
				course.id = extract.course_id
				AND extract.archive_date IS NULL
				AND extract.status != $1
				AND course.archive_date IS NOT NULL
			RETURNING
				extract.*
		)
		INSERT INTO
			extract
			(
				date_expired,
				title,
				exam_board,
				students_in_course,
				page_count,
				oid,
				asset_id,
				course_id,
				course_name_log,
				school_id,
				user_id,
				pages,
				is_watermarked,
				parent_id,
				status,
				grace_period_end
			)
		SELECT
			NOW() - INTERVAL '10 minutes',
			updated_rows.title,
			updated_rows.exam_board,
			updated_rows.students_in_course,
			updated_rows.page_count,
			updated_rows.oid,
			updated_rows.asset_id,
			course.id,
			course.title,
			updated_rows.school_id,
			updated_rows.user_id,
			updated_rows.pages,
			updated_rows.is_watermarked,
			updated_rows.id,
			$2,
			NOW() - INTERVAL '10 minutes'
		FROM
			updated_rows
		INNER JOIN course
			ON updated_rows.course_id = course.parent_id
	`,
		[extractStatus.cancelled, extractStatus.active]
	);
};

const rolloverExtractShares = async (querier) => {
	await querier(`
		WITH updated_rows AS (
			UPDATE
				extract_share
			SET
				archive_date = extract.archive_date,
				date_edited = NOW()
			FROM
				extract
			WHERE
				extract.id = extract_share.extract_id
				AND extract_share.archive_date IS NULL
				AND extract.archive_date IS NOT NULL
			RETURNING
				extract_share.*
		)
		INSERT INTO
			extract_share
			(
				oid,
				date_expired,
				user_id,
				extract_id,
				title,
				access_code,
				enable_extract_share_access_code,
				parent_id
			)
		SELECT
			updated_rows.oid,
			NOW() - INTERVAL '10 minutes',
			updated_rows.user_id,
			extract.id,
			updated_rows.title,
			updated_rows.access_code,
			updated_rows.enable_extract_share_access_code,
			updated_rows.id
		FROM
			updated_rows
		INNER JOIN extract
			ON updated_rows.extract_id = extract.parent_id
	`);
};

const rolloverExtractCoursePages = async (querier) => {
	await querier(`
		UPDATE
			extract_page
		SET
			archive_date = course.archive_date,
			date_edited = NOW()
		FROM
			course
		WHERE
			extract_page.course_id = course.id
			AND extract_page.archive_date IS NULL
			AND course.archive_date IS NOT NULL
	`);
};

const rolloverExtractSchoolPages = async (querier, rolloverJobId) => {
	await querier(
		`
			UPDATE
				extract_page_by_school
			SET
				archive_date = NOW(),
				date_edited = NOW()
			FROM
				school
			WHERE
				extract_page_by_school.school_id = school.id
				AND extract_page_by_school.archive_date IS NULL
				AND school.rollover_job_id = $1
		`,
		[rolloverJobId]
	);
};

const rolloverMinorTables = async (querier, rolloverJobId) => {
	await querier(
		`
			UPDATE
				school_extract_email_send_log
			SET
				archive_date = NOW()
			FROM
				school
			WHERE
				school_extract_email_send_log.school_id = school.id
				AND school_extract_email_send_log.archive_date IS NULL
				AND school.rollover_job_id = $1
		`,
		[rolloverJobId]
	);
};

const rolloverExtractNotes = async (querier) => {
	await querier(`
		WITH updated_rows AS (
			UPDATE
				extract_note
			SET
				archive_date = extract.archive_date
			FROM
				extract
			WHERE
				extract.id = extract_note.extract_id
				AND extract_note.archive_date IS NULL
				AND extract.archive_date IS NOT NULL
			RETURNING
				extract_note.*
		)
		INSERT INTO
			extract_note
			(
				extract_id,
				colour,
				position_x,
				position_y,
				width,
				height,
				content,
				page,
				zindex,
				parent_id
			)
		SELECT
			extract.id,
			updated_rows.colour,
			updated_rows.position_x,
			updated_rows.position_y,
			updated_rows.width,
			updated_rows.height,
			updated_rows.content,
			updated_rows.page,
			updated_rows.zindex,
			updated_rows.id
		FROM
			updated_rows
		INNER JOIN extract
			ON updated_rows.extract_id = extract.parent_id
	`);
};

const rolloverExtractHighlights = async (querier) => {
	await querier(`
		WITH updated_rows AS (
			UPDATE
				extract_highlight
			SET
				archive_date = extract.archive_date
			FROM
				extract
			WHERE
				extract.id = extract_highlight.extract_id
				AND extract_highlight.archive_date IS NULL
				AND extract.archive_date IS NOT NULL
			RETURNING
				extract_highlight.*
		)
		INSERT INTO
			extract_highlight
			(
				extract_id,
				colour,
				position_x,
				position_y,
				width,
				height,
				page,
				parent_id
			)
		SELECT
			extract.id,
			updated_rows.colour,
			updated_rows.position_x,
			updated_rows.position_y,
			updated_rows.width,
			updated_rows.height,
			updated_rows.page,
			updated_rows.id
		FROM
			updated_rows
		INNER JOIN extract
			ON updated_rows.extract_id = extract.parent_id
	`);
};

const rolloverExtractPageJoins = async (querier) => {
	await querier(
		`
			INSERT INTO
				extract_page_join
				(
					extract_id,
					page,
					first_highlight_name,
					first_highlight_date
				)
			SELECT
				extract.id,
				extract_page_join.page,
				extract_page_join.first_highlight_name,
				extract_page_join.first_highlight_date
			FROM
				extract_page_join
			INNER JOIN extract
				ON extract_page_join.extract_id = extract.parent_id
			WHERE
				extract.archive_date IS NULL
			ON CONFLICT DO NOTHING
		`
	);
};

const rolloverExtractUserInfo = async (querier) => {
	await querier(
		`
			INSERT INTO
				extract_user_info
				(
					extract_id,
					user_id,
					is_favorite
				)
			SELECT
				extract.id,
				extract_user_info.user_id,
				extract_user_info.is_favorite
			FROM
				extract_user_info
			INNER JOIN extract
				ON extract_user_info.extract_id = extract.parent_id
			WHERE
				extract.archive_date IS NULL
			ON CONFLICT DO NOTHING
		`
	);
};

const updateSchoolLastRolloverDate = async (querier, rolloverJobId) => {
	await querier(
		`
			UPDATE
				school
			SET
				last_rollover_date = NOW(),
				date_edited = NOW()
			WHERE
				rollover_job_id = $1
		`,
		[rolloverJobId]
	);
};

module.exports = async (querier, rolloverJobId) => {
	await rolloverCourses(querier, rolloverJobId);
	await rolloverExtracts(querier);
	await rolloverExtractShares(querier);
	await rolloverExtractCoursePages(querier);
	await rolloverExtractSchoolPages(querier, rolloverJobId);
	await rolloverMinorTables(querier, rolloverJobId);
	await rolloverExtractNotes(querier);
	await rolloverExtractHighlights(querier);
	await rolloverExtractPageJoins(querier);
	await rolloverExtractUserInfo(querier);
	await updateSchoolLastRolloverDate(querier, rolloverJobId);
};
