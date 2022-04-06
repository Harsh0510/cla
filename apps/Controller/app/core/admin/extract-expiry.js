module.exports = async function (params, ctx) {
	/**
	 * IMPORTANT: This route no longer works since the update to use rollover_counter fields.
	 * Do NOT use this without updating first.
	 */
	await ctx.ensureLoggedIn();
	const sessionData = await ctx.getSessionData();
	const userRole = sessionData.user_role;
	ctx.assert(userRole === "cla-admin", 401, "Unauthorized");
	const userId = sessionData.user_id;
	const pool = ctx.getAppDbPool();
	const client = await pool.connect();
	try {
		await client.query("BEGIN");

		//get number of pages for each book - keys should be asset id, value should be asset page count
		const pageTotalsMap = {};

		const pageTotalsMapResult = await client.query(`
			SELECT
				id,
				copyable_page_count 
			FROM
				asset
		`);
		for (const row of pageTotalsMapResult.rows) {
			pageTotalsMap[row.id] = row.copyable_page_count;
		}

		// get all copies from db, in date descending order (most recent first)
		const allCopiesResult = await client.query(`
			SELECT
				* 
			FROM
				extract 
			WHERE 
				date_expired > '2020-07-31 00:00:00'
			ORDER BY
				date_created DESC
		`);

		const allCopies = allCopiesResult.rows;

		// map of asset id -> { school: {}, class: {} }, where the inner objects are a map of pages copied

		const totalByBookMap = {};

		// map of asset id -> { school: { id: percentage copied} }
		const totalByBookPercentageMap = {};

		let expiryCount = 0;
		let extendCount = 0;

		const remainingActiveCopies = [];

		for (const copy of allCopies) {
			const s = copy.school_id;
			const a = copy.asset_id;
			const c = copy.course_id;

			for (const page of copy.pages) {
				if (a && s && c) {
					if (!totalByBookMap[a]) {
						totalByBookMap[a] = {
							class: {},
							school: {},
						};
					}
					if (!totalByBookMap[a].class[c]) {
						totalByBookMap[a].class[c] = {};
					}
					totalByBookMap[a].class[c][page] = true;
					if (!totalByBookMap[a].school[s]) {
						totalByBookMap[a].school[s] = {};
					}
					totalByBookMap[a].school[s][page] = true;
				}
			}

			const percentCopiedClass = Object.keys(totalByBookMap[a].class[c]).length / pageTotalsMap[a];
			const percentCopiedSchool = Object.keys(totalByBookMap[a].school[s]).length / pageTotalsMap[a];
			if (!totalByBookPercentageMap[a]) {
				totalByBookPercentageMap[a] = {
					school: {},
				};
			}
			if (!totalByBookPercentageMap[a].school[s]) {
				totalByBookPercentageMap[a].school[s] = 0;
			}

			// checking asset percentage for the school in the current copy
			totalByBookPercentageMap[a].school[s] = percentCopiedSchool;

			if (percentCopiedClass > 0.05) {
				// This copy would bring the total copied for this book/class combo to more than 5%
				// EXPIRE IT
				await client.query(
					`
						UPDATE
							extract 
						SET
							date_expired = '2020-07-31 00:00:00',
							modified_by_user_id = $2,
							date_edited = NOW()
						WHERE
							id = $1
					`,
					[copy.id, userId]
				);
				expiryCount++;
			} else if (percentCopiedSchool > 0.2) {
				// This copy would bring the total copied for this book/school combo to more than 20%
				// EXPIRE IT
				await client.query(
					`
						UPDATE
							extract 
						SET
							date_expired = '2020-07-31 00:00:00',
							modified_by_user_id = $2,
							date_edited = NOW()
						WHERE
							id = $1
					`,
					[copy.id, userId]
				);
				expiryCount++;
			} else {
				await client.query(
					`
						UPDATE
							extract 
						SET
							date_expired = '2021-07-31 00:00:00',
							modified_by_user_id = $2
						WHERE
							id = $1
					`,
					[copy.id, userId]
				);
				extendCount++;
				remainingActiveCopies.push(copy);
			}

			// console.log(` asset: ${copy.id} school: ${s} percentage: ${percentCopiedSchool} rounded percentage: ${percentCopiedSchoolToSend}`);
		}

		// delete all logs first
		await client.query(`DELETE FROM school_extract_email_send_log`);

		for (let assetID in totalByBookPercentageMap) {
			let schools = totalByBookPercentageMap[assetID].school;
			for (let schoolID in schools) {
				let percentage = schools[schoolID];

				let percentCopiedSchoolToSend;
				if (percentage < 0.05) {
					percentCopiedSchoolToSend = 0;
				} else if (percentage < 0.1) {
					percentCopiedSchoolToSend = 5;
				} else if (percentage < 0.15) {
					percentCopiedSchoolToSend = 10;
				} else if (percentage < 0.2) {
					percentCopiedSchoolToSend = 15;
				} else {
					percentCopiedSchoolToSend = 20;
				}

				if (percentCopiedSchoolToSend >= 10) {
					// then insert new ones here
					await client.query(
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
						`,
						[assetID, schoolID, percentCopiedSchoolToSend]
					);
				}
			}
		}

		{
			// 	// Now we need to update the extract_page and extract_page_by_school tables
			const assetSchoolMap = Object.create(null); // map of asset -> school -> page
			const assetCourseMap = Object.create(null); // map of asset -> course -> page
			for (const copy of remainingActiveCopies) {
				if (!assetSchoolMap[copy.asset_id]) {
					assetSchoolMap[copy.asset_id] = Object.create(null);
				}
				if (!assetCourseMap[copy.asset_id]) {
					assetCourseMap[copy.asset_id] = Object.create(null);
				}
				if (!assetSchoolMap[copy.asset_id][copy.school_id]) {
					assetSchoolMap[copy.asset_id][copy.school_id] = Object.create(null);
				}
				if (!assetCourseMap[copy.asset_id][copy.course_id]) {
					assetCourseMap[copy.asset_id][copy.course_id] = Object.create(null);
				}
				for (const page of copy.pages) {
					assetSchoolMap[copy.asset_id][copy.school_id][page] = true;
					assetCourseMap[copy.asset_id][copy.course_id][page] = true;
				}
			}

			{
				// update extract_page_by_school first
				const values = [];
				for (const assetId in assetSchoolMap) {
					for (const schoolId in assetSchoolMap[assetId]) {
						for (const page in assetSchoolMap[assetId][schoolId]) {
							values.push(`(${assetId}, ${schoolId}, ${page})`);
						}
					}
				}
				await client.query(`TRUNCATE extract_page_by_school`);
				await client.query(`
					INSERT INTO
						extract_page_by_school
						(asset_id, school_id, page_number)
					VALUES	
						${values.join(",")}
					ON CONFLICT DO NOTHING
				`);
			}
			{
				// update extract_page
				const values = [];
				for (const assetId in assetCourseMap) {
					for (const courseId in assetCourseMap[assetId]) {
						for (const page in assetCourseMap[assetId][courseId]) {
							values.push(`(${assetId}, ${courseId}, ${page})`);
						}
					}
				}
				await client.query(`TRUNCATE extract_page`);
				await client.query(`
					INSERT INTO
						extract_page
						(asset_id, course_id, page_number)
					VALUES
						${values.join(",")}
					ON CONFLICT DO NOTHING
				`);
			}
		}
		await client.query("COMMIT");
		return {
			extended: extendCount,
			expired: expiryCount,
			result: true,
		};
	} catch (e) {
		await client.query("ROLLBACK");
		throw e;
	} finally {
		client.release();
	}
};
