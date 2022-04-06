const util = require("util");
const crypto = require("crypto");

const moment = require("moment");

const shuffle = require("./shuffle");
const genPassword = require('../generate_users/genPassword');
const genPasswordHash = require('../../apps/Controller/app/core/auth/common/genPasswordHash');
const tvfUtil = require('../../lib/tvf-util/main/index');
const genRandomBytes = util.promisify(crypto.randomBytes);

async function prepare(opts, pool) {
	const NUM_SCHOOLS = parseInt(opts.numSchools || 15, 10);
	const NUM_USERS = parseInt(opts.numUsers || 750, 10);
	const NUM_ASSETS = parseInt(opts.numAssets || 300, 10);
	const NUM_COURSES_PER_SCHOOL = parseInt(opts.numCoursesPerSchool || 100, 10);
	const NUM_EXTRACTS_PER_SCHOOL = parseInt(opts.numExtractsPerSchool || 25, 10);
	const NUM_NOTIFICATIONS_PER_USER = parseInt(opts.numNotificationsPerUser || 100, 10);
	const NUM_SHARES_PER_EXTRACT = parseInt(opts.numSharesPerExtract || 5, 10);

	const data = {};
	const schoolIdMap = Object.create(null);
	const userIdMap = Object.create(null);
	const extractsIdMap = Object.create(null);
	async function createSchools() {
		const values = [];
		for (let i = 0; i < NUM_SCHOOLS; ++i) {
			values.push(`('CLA Test School TVF load ${i}', 'addr', 'city', 'post code', 'high_school', 'tvf-load-test-${i}')`);
		}
		const results = await pool.query(`
			INSERT INTO
				school
				(
					name,
					address1,
					city,
					post_code,
					school_level,
					identifier
				)
			VALUES
				${values.join(', ')}
			RETURNING
				id,
				name
		`);
		data.schools = results.rows;
		for (let i = 0, len = data.schools.length; i < len; ++i) {
			schoolIdMap[data.schools[i].id] = data.schools[i];
		}
	}
	async function createUsers() {
		let counter = 0;
		const queryParts = [];
		const values = [];
		const password = await genPassword();
		for (let i = 0; i < NUM_USERS; ++i) {
			const email = `tvfloadtest@abc${i.toString().padStart(7, '0')}d.com`;
			const first = `first`;
			const last = `last`;
			const schoolId = data.schools[Math.floor(Math.random() * data.schools.length)].id;
			const role = `teacher`;
			const title = `Mr`;
			const deets = await genPasswordHash(password);
			queryParts.push(`(
				$${++counter},
				$${++counter},
				$${++counter},
				$${++counter},
				$${++counter},
				$${++counter},
				$${++counter},
				$${++counter},
				$${++counter},
				'registered',
				NOW(),
				NOW(),
				NOW(),
				NOW(),
				NOW()
			)`);
			values.push(email, first, last, schoolId, deets.algo, deets.hash, deets.salt, role, title);
		}
	
		const query = `
			INSERT INTO
				cla_user
				(
					email,
					first_name,
					last_name,
					school_id,
					password_algo,
					password_hash,
					password_salt,
					role,
					title,
					status,
					date_status_changed,
					date_last_registration_activity,
					date_transitioned_to_pending,
					date_transitioned_to_approved,
					date_transitioned_to_registered
				)
			VALUES
				${queryParts.join(', ')}
			ON CONFLICT
				(email)
			DO UPDATE SET
				first_name = EXCLUDED.first_name,
				last_name = EXCLUDED.last_name,
				school_id = EXCLUDED.school_id,
				password_algo = EXCLUDED.password_algo,
				password_hash = EXCLUDED.password_hash,
				password_salt = EXCLUDED.password_salt,
				role = EXCLUDED.role,
				status = EXCLUDED.status,
				title = EXCLUDED.title,
				date_status_changed = EXCLUDED.date_status_changed,
				date_last_registration_activity = EXCLUDED.date_last_registration_activity,
				date_transitioned_to_pending = EXCLUDED.date_transitioned_to_pending,
				date_transitioned_to_approved = EXCLUDED.date_transitioned_to_approved,
				date_transitioned_to_registered = EXCLUDED.date_transitioned_to_registered
			RETURNING
				email,
				id,
				school_id
		`;
		const result = await pool.query(query, values);
		data.users = result.rows;
		data.password = password;
		for (const user of data.users) {
			const school = schoolIdMap[user.school_id];
			user.school = school;
			if (!school.users) {
				school.users = [];
			}
			school.users.push(user);
		}
		for (let i = 0, len = data.users.length; i < len; ++i) {
			userIdMap[data.users[i].id] = data.users[i];
		}
	}
	async function unlockBooks() {
		const assets = await pool.query(`
			SELECT
				id,
				pdf_isbn13
			FROM
				asset
			WHERE
				active = TRUE
				AND page_count >= 200
			ORDER BY
				MD5(title) ASC
			LIMIT
				${NUM_ASSETS}
		`);
		const values = [];
		for (const school of data.schools) {
			for (const asset of assets.rows) {
				values.push(`(${asset.id}, ${school.id}, TRUE)`);
			}
		}
		await pool.query(`
			INSERT INTO
				asset_school_info
				(asset_id, school_id, is_unlocked)
			VALUES
				${values.join(', ')}
		`);
		data.assets = assets.rows;
	}
	async function createCourses() {
		const courseNames = [
			`maths`,
			`homework`,
			`test`,
			`health`,
			`power`,
			`cold`,
			`dm`,
			`rising`,
			`english`,
		];
		const values = [];
		for (let i = 0; i < NUM_COURSES_PER_SCHOOL; ++i) {
			const name = courseNames[Math.floor(Math.random() * courseNames.length)];
			for (const school of data.schools) {
				const oid = await tvfUtil.generateObjectIdentifier();
				values.push(`('${name} title${i}', 'year group ${i}', ${school.id}, '${oid}', ${school.users[0].id})`);
			}
		}
		const results = await pool.query(`
			INSERT INTO
				course
				(title, year_group, school_id, oid, creator_id)
			VALUES
				${values.join(', ')}
			RETURNING
				id,
				oid,
				title,
				school_id
		`);
		data.courses = results.rows;
		for (const course of data.courses) {
			const school = schoolIdMap[course.school_id];
			if (!school.courses) {
				school.courses = [];
			}
			course.school = school;
			school.courses.push(course);
		}
	}
	async function createExtracts() {
		const names = [
			`test`,
			`progress`,
			`problems`,
			`physics`,
			`quadratics`,
			`urban change`,
			`trig exercises`,
			`wednesday class`,
			`waves revision`,
			`techtonic plates`,
			`trench life`,
			`king lear`,
			`darwin`,
			`energy efficiency`,
			`indices`,
			`asia module`,
			`death penalty`,
			`black death`,
		];
		const values = [];
		const valuesForExtractPage = [];
		const valuesForExtractPageBySchool = [];
		const pageNumbers = [...Array(198).keys()].slice(1);
		for (let i = 0; i < NUM_EXTRACTS_PER_SCHOOL; ++i) {
			const extractName = names[Math.floor(Math.random() * names.length)];
			for (const school of data.schools) {
				const pageCount = Math.floor(Math.random() * 9) + 1;
				shuffle(pageNumbers);
				const pages = pageNumbers.slice(0, pageCount);
				pages.sort((a, b) => a - b);
				const pagesJson = JSON.stringify(pages);

				const oid = await tvfUtil.generateObjectIdentifier();
				const course = school.courses[i];
				const asset = data.assets[i];
				values.push(`(
					'${extractName} extract ${i}',
					${asset.id},
					'WJEC',
					100,
					${pageCount},
					'${oid}',
					${course.id},
					'${pagesJson}',
					${school.id},
					${school.users[0].id},
					'${course.title}',
					NOW() + interval '1 month'
				)`);
				for (const page of pages) {
					valuesForExtractPage.push(`(${course.id}, ${asset.id}, ${page})`);
					valuesForExtractPageBySchool.push(`(${school.id}, ${asset.id}, ${page})`);
				}
			}
		}
		const query = `
			INSERT INTO
				extract
				(
					title,
					asset_id,
					exam_board,
					students_in_course,
					page_count,
					oid,
					course_id,
					pages,
					school_id,
					user_id,
					course_name_log,
					date_expired
				)
			VALUES
				${values.join(', ')}
			RETURNING
				id,
				oid,
				user_id,
				school_id
		`;
		const results = await pool.query(query);
		await pool.query(`
			INSERT INTO
				extract_page
				(course_id, asset_id, page_number)
			VALUES
				${valuesForExtractPage.join(', ')}
			ON CONFLICT DO NOTHING
		`);
		await pool.query(`
			INSERT INTO
				extract_page_by_school
				(school_id, asset_id, page_number)
			VALUES
				${valuesForExtractPageBySchool.join(', ')}
			ON CONFLICT DO NOTHING
		`);
		data.extracts = results.rows;
		for (let i = 0, len = data.extracts.length; i < len; ++i) {
			extractsIdMap[data.extracts[i].id] = data.extracts[i];
		}

		for (const extract of data.extracts) {
			const school = schoolIdMap[extract.school_id];
			extract.school = school;
			if (!school.extracts) {
				school.extracts = [];
			}
			school.extracts.push(extract);

			const user = userIdMap[extract.user_id];
			extract.user = user;
			if (!user.extracts) {
				user.extracts = [];
			}
			user.extracts.push(extract);
		}
	}
	async function createExtractShares() {
		const values = [];
		for (const extract of data.extracts) {
			for (let i = 0; i < NUM_SHARES_PER_EXTRACT; ++i) {
				const oid = await tvfUtil.generateObjectIdentifier();
				values.push(`('${oid}', ${extract.user_id}, ${extract.id})`);
			}
		}
		const results = await pool.query(`
			INSERT INTO
				extract_share
				(oid, user_id, extract_id)
			VALUES
				${values.join(', ')}
			RETURNING
				id,
				oid,
				user_id,
				extract_id
		`);
		data.extract_shares = results.rows;
		for (const es of data.extract_shares) {
			const extract = extractsIdMap[es.extract_id];
			es.extract = extract;
			if (!extract.extract_shares) {
				extract.extract_shares = [];
			}
			extract.extract_shares.push(es);

			es.user = userIdMap[es.user_id];
		}
	}
	async function createNotifications() {
		const values = [];
		for (const user of data.users) {
			for (let i = 0; i < NUM_NOTIFICATIONS_PER_USER; ++i) {
				const oid = await tvfUtil.generateObjectIdentifier();
				const dt = moment(Date.now() - Math.random() * 2 * 30 * 24 * 60 * 60 * 1000);
				const niceDate = dt.format(`YYYY-MM-DD HH:mm:ss`);
				const hasRead = (Math.random() < 0.1) ? `TRUE` : `FALSE`;
				values.push(`(
					'${oid}',
					${user.id},
					${hasRead},
					'${niceDate}',
					1,
					'Awaiting Approval',
					'foo${i}@bar.com is awaiting approval',
					'Approval pending for this user',
					'{"type": "awaiting-approval", "value": "foo${i}@bar.com", "static": false}'
				)`);
			}
		}
		const results = await pool.query(`
			INSERT INTO
				notification
				(
					oid,
					user_id,
					has_read,
					date_created,
					category_id,
					category_name,
					title,
					description,
					link
				)
			VALUES
				${values.join(', ')}
			RETURNING
				id,
				oid,
				user_id
		`);
		data.notifications = results.rows;
		for (const note of data.notifications) {
			const user = userIdMap[note.user_id];
			note.user = user;
			if (!user.notifications) {
				user.notifications = [];
			}
			user.notifications.push(note);
		}
	}
	await createSchools();
	await createUsers();
	await unlockBooks();
	await createCourses();
	await createExtracts();
	await createExtractShares();
	await createNotifications();
	return data;
}

async function cleanup(pool) {
	const userIdString = (await pool.query(`DELETE FROM cla_user WHERE email LIKE 'tvfloadtest@abc%' RETURNING id`)).rows.map(v => v.id).join(', ');
	const schoolIdString = (await pool.query(`DELETE FROM school WHERE name LIKE 'CLA Test School TVF load%' OR identifier LIKE 'tvf-load-test-%' RETURNING id`)).rows.map(v => v.id).join(', ');
	await pool.query(`DELETE FROM login_attempt WHERE email LIKE 'tvfloadtest@abc%'`);

	if (userIdString) {
		await pool.query(`DELETE FROM extract_share WHERE user_id IN (${userIdString})`);
		await pool.query(`DELETE FROM notification WHERE user_id IN (${userIdString})`);
	}
	if (schoolIdString) {
		const courseIdString = (await pool.query(`DELETE FROM course WHERE school_id IN (${schoolIdString}) RETURNING id`)).rows.map(v => v.id).join(', ');
		const extractIdString = (await pool.query(`DELETE FROM extract WHERE school_id IN (${schoolIdString}) RETURNING id`)).rows.map(v => v.id).join(', ');
		await pool.query(`DELETE FROM extract_page WHERE course_id IN (${courseIdString})`);
		await pool.query(`DELETE FROM extract_page_by_school WHERE school_id IN (${schoolIdString})`);
		await pool.query(`DELETE FROM asset_school_info WHERE school_id IN (${schoolIdString})`);
		await pool.query(`DELETE FROM extract_access WHERE extract_id IN (${extractIdString})`);
	}
}

module.exports.loginUsers = async function(sessPool, users) {
	const ret = Object.create(null);
	if (!users || !users.length) {
		return ret;
	}
	const values = [];
	const binds = [];
	for (const user of users) {
		const sessToken = (await genRandomBytes(24)).toString('hex');
		const idx = binds.push({
			user_id: user.id,
			user_role: `teacher`,
			user_email: user.email,
			school_id: user.school_id,
			allowed_extract_ratio: 0.05,
			allowed_extract_ratio_by_school: 0.2,
			academic_year_end: [
				9,
				15,
			],
		});
		values.push(`('${sessToken}', ${user.id}, $${idx}, NOW() + INTERVAL '2 hours')`);
	}
	const results = await sessPool.query(
		`
			INSERT INTO
				cla_session
				(
					token,
					user_id,
					data,
					expiry_date
				)
			VALUES
				${values.join(', ')}
			ON CONFLICT
				(user_id)
			DO UPDATE SET
				token = EXCLUDED.token,
				data = EXCLUDED.data,
				expiry_date = EXCLUDED.expiry_date
			RETURNING
				user_id,
				token
		`,
		binds
	);
	for (const row of results.rows) {
		ret[row.user_id] = row.token;
	}
	return ret;
};

module.exports.prepare = async function (opts, pool, cb) {
	if (!cb) {
		cb = pool;
		pool = opts;
		opts = {};
	}
	let ret;
	let data;
	try {
		await cleanup(pool);
		data = await prepare(opts, pool);
		ret = await cb(data);
	} finally {
		await cleanup(pool);
	}
	return ret;
};