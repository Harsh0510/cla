const path = require('path');
const exec = require('child_process').exec;
const fs = require('fs-extra');
const crypto = require("crypto");

const prompts = require('prompts');
const { Pool, types } = require('pg');
const shellQuote = require('shell-quote');

const puppeteer = require('puppeteer');

const genPasswordHash = require('../../apps/Controller/app/core/auth/common/genPasswordHash');
const registerRoute = require('../../apps/Controller/app/core/auth/register');
const extractCreateRoute = require('../../apps/Controller/app/core/public/extract-create');
const extractShareAddRoute = require('../../apps/Controller/app/core/public/extract-share-add');

// Parse BIGINT as integers. This is technically NOT safe if it overflows the max. safe integer. We should fix this at some point!
types.setTypeParser(20, val => parseInt(val, 10));

const generateObjectIdentifier = () => crypto.randomBytes(18).toString('hex');

function wait(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function reduceSize(path) {
	return new Promise((resolve, reject) => {
		const args = shellQuote.quote([path, '-scale', '50%', path]);
		exec(`convert ${args}`, err => {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});
}

function pngquant(path) {
	return new Promise((resolve, reject) => {
		const args = shellQuote.quote(['--force', path, '--ext', '.png']);
		exec(`pngquant ${args}`, err => {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});
}

/**
 * @param {puppeteer.Page} page 
 * @param {string} url 
 */
async function screenshotPage(page, url, root, sessionToken) {
	const urlp = new URL(url);
	await page.goto(urlp.href, {waitUntil: 'domcontentloaded'});
	await page.evaluate(token => {
		if (token) {
			window.localStorage.setItem('sessId', token);
			window.localStorage.setItem('cookies_accepted', '1');
		} else {
			window.localStorage.removeItem('sessId');
			window.localStorage.removeItem('cookies_accepted');
		}
	}, sessionToken);
	await page.goto(urlp.href, {waitUntil: 'load'});
	let pathname = urlp.pathname;
	if (!pathname || pathname === '/') {
		pathname = 'home';
	}
	if (pathname[0] === '/') {
		pathname = pathname.slice(1);
	}
	const dirNameParts = [];
	dirNameParts.push(pathname);
	if (urlp.search && (urlp.search !== '?')) {
		let qstring = urlp.search.replace(/\W+/g, '_');
		if (qstring[0] === '?') {
			qstring = qstring.slice(1);
		}
		dirNameParts.push(qstring);
	}
	const base = path.join(root, dirNameParts.join('__'));
	await fs.mkdirp(base);
	await wait(2000);
	{
		const img = path.join(base, `whole_page.png`);
		await page.screenshot({
			path: img,
		});
		await pngquant(img);
	}
	const texts = [];
	let i = 0;
	while (true) {
		const result = await page.evaluate(i => {
			function textNodesUnder(el){
				var n, a=[], walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,null,false);
				while(n=walk.nextNode()) a.push(n);
				return a;
			}
			function isVisible(elem) {
				return !!( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length );
			}

			// Get number of ancestors.
			function getAncestralElementCount(elem) {
				let count = 0;
				let curr = elem;
				while (curr && curr != document.body) {
					count++;
					curr = curr.parentElement;
				}
				return count;
			}
			const nodesOrig = textNodesUnder(document.body).filter(p => p.textContent.trim() && isVisible(p.parentElement) && p.textContent.match(/[a-zA-Z]/));
			
			// Create a map of (Node -> Index) to be used as the resort the nodes back into the original order later.
			const nodesOrigMap = new WeakMap();
			for (let i = 0, len = nodesOrig.length; i < len; ++i) {
				nodesOrigMap.set(nodesOrig[i], i);
			}

			// Sort nodes by the number of ancestors (i.e. deepest nodes last)
			const nodesRaw = nodesOrig.slice(0).sort((a, b) => {
				const ac = getAncestralElementCount(a);
				const bc = getAncestralElementCount(b);
				return (ac > bc) ? 1 : ((ac < bc) ? -1 : 0);
			});

			// 'Adjecent' text nodes should be combined.
			// So e.g. abc<em>def</em>ghi should be a single text, even though that's three text nodes.
			const nodes = [];
			const processedTextNodes = new WeakSet();
			for (const node of nodesRaw) {
				if (processedTextNodes.has(node)) {
					continue;
				}
				let firstNode = null;
				let curr = node;
				while (curr) {
					firstNode = curr;
					curr = curr.previousSibling;
				}
				const thanks = [];
				curr = firstNode;
				while (curr) {
					if (curr instanceof Text) {
						processedTextNodes.add(curr);
					} else {
						textNodesUnder(curr).forEach(nd => {
							processedTextNodes.add(nd);
						});
					}
					if (curr.nodeName === 'BR') {
						thanks.push("\n");
					} else {
						thanks.push(curr.textContent);
					}
					curr = curr.nextSibling;
				}
				const content = thanks.join('').replace(/(\s)\s+/g, `$1`).trim();
				nodes.push({
					content: content,
					element: node.parentElement,
					orig: node,
				});
			}

			// Sort the nodes back into the same order as the original.
			nodes.sort((a, b) => {
				const aa = nodesOrigMap.get(a.orig);
				const bb = nodesOrigMap.get(b.orig);
				return (aa < bb) ? -1 : ((aa > bb) ? 1 : 0);
			});
			const nodeDetails = nodes[i];
			if (!nodeDetails) {
				return {
					done: true,
				};
			}
			const parentElement = nodeDetails.element;
			const bb = parentElement.getBoundingClientRect();
			let el = document.getElementById(`TextScraper__XXX`);
			if (!el) {
				el = document.createElement('div');
				el.setAttribute('id', `TextScraper__XXX`);
				el.style.position = `fixed`;
				el.style.zIndex = 100;
				el.style.background = `rgba(255, 0, 0, 0.5)`;
				document.body.appendChild(el);
			}
			el.style.top = (bb.top - 10) + 'px';
			el.style.left = (bb.left - 10) + 'px';
			el.style.width = (bb.width + 20) + 'px';
			el.style.height = (bb.height + 20) + 'px';
			return {
				done: false,
				text: nodeDetails.content,
			};
		}, i);
		if (result.done) {
			break;
		}
		await wait(50);
		const img = path.join(base, `img_${i}.png`);
		await page.screenshot({
			path: img,
		});
		await reduceSize(img);
		await pngquant(img);

		texts.push(`=========== ${i} ===========\n${result.text}\n\n`);
		i++;
	}
	await fs.promises.writeFile(path.join(base, `text.txt`), texts.join(''));
}

const urls = [
	"/",
	"/about",
	"/sign-in",
	"/works",
	deets => `/works/${deets.asset.isbn13}/extract?course=${deets.course.oid}&highlighted=1&numColumns=2&selected=3-4-5`,
	deets => `/works/${deets.asset.isbn13}/extract/form?course=${deets.course.oid}&selected=3-4-5`,
	deets => `/works/${deets.asset.isbn13}`,
	deets => `/extract/${deets.extract.oid}/${deets.extractShare.oid}`,
	deets => "/unlock",
	deets => "/profile",
	deets => "/profile/my-details",
	deets => "/profile/admin",
	deets => "/profile/my-copies",
	deets => `/profile/management/${deets.extract.oid}`,
	"/terms",
	deets => "/profile/admin/users",
	"/auth/forgot-password",
	// "/auth/reset-password/:token",
	// "/auth/set-password/:token",
	// "/auth/confirm-email/:token",
	// "/auth/activate/:token",
	deets => `/auth/verify/${deets.unverified.token}`,
	// "/auth/disable-security-emails/:hashed",
	deets => "/profile/admin/school",
	"/register",
	deets => "/profile/admin/classes",
	deets => "/profile/admin/registration-queue",
	deets => `/profile/admin/schools`,
	deets => ({path: `/profile/admin/imprints`, sessionToken: deets.claAdminSessionToken}),
	deets => ({path: `/profile/admin/assets`, sessionToken: deets.claAdminSessionToken }),
	deets => ({path: `/profile/admin/approved-domains`, sessionToken: deets.claAdminSessionToken}),
	deets => "/profile/admin/unlock-content",
	deets => ({path: "/profile/admin/publishers", sessionToken: deets.claAdminSessionToken}),
	"/welcome",
	"/faq",
	"/partners",
	"/how-to-register",
	"/support",
	"/how-to-copy",
	"/cookie-policy",
	"/terms-of-use",
	"/our-quick-guide-to-terms-of-use",
	deets => `/profile/admin/user-create-bulk`,
];

function getCtx(appPool, sessionPool, sessionToken) {
	const ctx = {};
	ctx.throw = () => {
		throw new Error();
	};
	ctx.assert = (expr) => {
		if (!expr) {
			throw new Error();
		}
	};
	ctx.appDbQuery = (...args) => {
		return appPool.query(...args);
	};
	ctx.sessionDbQuery = (...args) => {
		return sessionPool.query(...args);
	};
	ctx.addSessIdResponseHeader = () => {};
	ctx.getClientIp = () => {
		return `127.0.0.1`;
	};
	ctx.ensureLoggedIn = () => {
		if (!sessionToken) {
			throw new Error('not logged in');
		}
	};
	ctx.getSessionData = async () => {
		if (!sessionToken) {
			return null;
		}
		const deets = await sessionPool.query(
			`
				UPDATE
					cla_session
				SET
					expiry_date = NOW() + interval '2 hours'
				WHERE
					token = $1
					AND expiry_date > NOW()
				RETURNING
					data
			`,
			[
				sessionToken
			]
		);
		return deets.rows[0].data;
	};

	ctx._koaCtx = {
		request: {
			header: {
				'user-agent': 'abc123',
			},
		},
	};
	return ctx;
}

function getSendEmail() {
	const sendEmail = {};
	sendEmail.sendTemplate = () => {};
	return sendEmail;
}

const SCHOOL_IDENTIFIER = `ZZZZZZZZIII`;

async function insertSchool(pool) {
	const id = (await pool.query(
		`
			INSERT INTO
				school
				(name, address1, city, post_code, school_level, identifier)
			VALUES
				('ZZZZZZZZZ', 'CLA Addr1', 'CLA City', 'CLA CLA', 'other', '${SCHOOL_IDENTIFIER}')
			ON CONFLICT (identifier) DO UPDATE SET name = EXCLUDED.name
			RETURNING id
		`
	)).rows[0].id;

	const DOMAIN = `foo.com`;

	await pool.query(`INSERT INTO approved_domain (domain, school_id) VALUES ('${DOMAIN}', ${id})`);

	return {
		id: id,
		approvedDomain: DOMAIN,
	};
}

async function insertCourse(pool, schoolId, userId) {
	const token = generateObjectIdentifier();
	const result = await pool.query(
		`
			INSERT INTO
				course
				(
					title,
					key_stage,
					year_group,
					number_of_students,
					exam_board,
					oid,
					school_id,
					creator_id
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
					$8
				)
			RETURNING
				id
		`,
		[
			`Some Course Title`,
			`KS1`,
			`My Year Group`,
			null,
			null,
			token,
			schoolId,
			userId,
		]
	);
	return {
		id: result.rows[0].id,
		oid: token,
	};
}

async function insertUnverifiedUser(pool, email, schoolId) {
	const params = {
		title: `Mr`,
		first_name: `First`,
		last_name: `Last`,
		email: email,
		terms_accepted: true,
		school: schoolId,
	};

	{
		const result = await registerRoute(params, getCtx(pool), getSendEmail());
		if (!result.result) {
			throw new Error(`failed`);
		}
	}
	const result = await pool.query(
		`SELECT email, activation_token, id FROM cla_user WHERE email = $1`,
		[email]
	);
	return {
		id: result.rows[0].id,
		email: result.rows[0].email,
		token: result.rows[0].activation_token,
	};
}

async function insertRegisteredUser(pool, email, schoolId, role) {
	if (!email || (typeof email !== "string")) {
		throw new Error('must pass email');
	}
	const token = generateObjectIdentifier();
	const pass = await genPasswordHash(token);
	const userId = (await insertUnverifiedUser(pool, email, schoolId)).id;
	await pool.query(
		`
			UPDATE
				cla_user
			SET
				activation_token = NULL,
				activation_token_expiry = NULL,
				password_reset_token = NULL,
				password_reset_expiry = NULL,
				password_hash = '${pass.hash}',
				password_salt = '${pass.salt}',
				password_algo = '${pass.algo}',
				is_pending_approval = FALSE,
				status = 'registered',
				date_status_changed = NOW(),
				date_transitioned_to_registered = NOW(),
				date_last_registration_activity = NOW(),
				role = $1,
				school_id = $2
			WHERE
				email = $3
		`,
		[
			role,
			(role === 'cla-admin') ? 0 : schoolId,
			email,
		]
	);
	return {
		id: userId,
		password: token,
	};
}

async function insertExtract(appPool, sessionPool, sessionToken, courseOid, isbn) {
	const asyncRunner = {
		pushTask: () => {},
	};
	const params = {
		course_oid: courseOid,
		work_isbn13: isbn,
		students_in_course: 5,
		exam_board: 'SQA',
		extract_title: 'My Extract',
		pages: [3, 4, 5],
	};
	const deets = await extractCreateRoute(params, getCtx(appPool, sessionPool, sessionToken), () => {}, asyncRunner);
	return {
		oid: deets.extract.oid,
	};
}

async function insertExtractShare(appPool, sessionPool, sessionToken, extractOid) {
	const params = {
		extract_oid: extractOid,
		title: `My Extract Share`,
	};
	const deets = await extractShareAddRoute(params, getCtx(appPool, sessionPool, sessionToken));
	return {
		oid: deets.extr,
	};
}

async function clearDatabase(pool) {
	await pool.query(`DELETE FROM school WHERE identifier = $1`, [SCHOOL_IDENTIFIER]);
	await pool.query(`DELETE FROM cla_user WHERE school_id NOT IN (SELECT id FROM school) AND role IN ('school-admin', 'teacher')`);
	await pool.query(`DELETE FROM cla_user WHERE email IN ('zzzzzz@email.com', 'zzzzzz3@email.com', 'zzzzzz4@email.com')`);
	await pool.query(`DELETE FROM asset_school_info WHERE school_id NOT IN (SELECT id FROM school)`);
	await pool.query(`DELETE FROM extract WHERE school_id NOT IN (SELECT id FROM school)`);
	await pool.query(`DELETE FROM extract_share WHERE extract_id NOT IN (SELECT id FROM extract)`);
	await pool.query(`DELETE FROM approved_domain WHERE school_id NOT IN (SELECT id FROM school)`);
	await pool.query(`DELETE FROM course WHERE school_id NOT IN (SELECT id FROM school)`);
	await pool.query(`DELETE FROM extract_page WHERE course_id NOT IN (SELECT id FROM course)`);
	await pool.query(`DELETE FROM extract_page_by_school WHERE school_id NOT IN (SELECT id FROM school)`);
}

async function unlockAsset(pool, schoolId) {
	const asset = (await pool.query(
		`
			SELECT
				id,
				isbn13
			FROM
				asset
			WHERE
				active = TRUE
				AND page_count > 100
				AND isbn13 = pdf_isbn13
			LIMIT 1
		`
	)).rows[0];
	await pool.query(
		`
			INSERT INTO
				asset_school_info
				(school_id, asset_id, is_unlocked)
			VALUES
				(${schoolId}, ${asset.id}, TRUE)
		`
	);
	return asset;
}

async function doLogin(appPool, sessionPool, email, password) {
	const ctx = getCtx(appPool, sessionPool);

	const sendEmail = {};
	sendEmail.sendTemplate = () => {};

	const allowedPasswordAlgorithms = {sha256: true};

	const login = require('../../apps/Controller/app/core/auth/login');
	const ret = await login({email, password}, ctx, allowedPasswordAlgorithms, sendEmail);
	return ret.session_token;
}

(async () => {
	const responses = await prompts([
		{
			type: 'text',
			name: 'app_db_string',
			initial: 'postgres://cla_am_user:cla_am_pass@localhost:19000/cla_am_db?ssl=false',
			message: 'APP PostgreSQL database',
		},
		{
			type: 'text',
			name: 'session_db_string',
			initial: 'postgres://cla_sm_user:cla_sm_pass@localhost:20000/cla_sm_db?ssl=false',
			message: 'SESSION PostgreSQL database',
		},
		{
			type: 'text',
			name: 'base_url',
			initial: `http://localhost:16000`,
			message: `Base URL (e.g. https://stage-schoolingplatform.com)`,
		},
	]);
	if (!responses.app_db_string) {
		console.error('App database credentials not provided.');
		process.exit(1);
	}
	if (!responses.session_db_string) {
		console.error('Session database credentials not provided.');
		process.exit(1);
	}
	let baseUrl;
	if (!responses.base_url) {
		console.error('Base URL not provided.');
		process.exit(1);
	}
	baseUrl = new URL(responses.base_url);

	const appPool = await new Pool({
		connectionString: responses.app_db_string,
	});

	const sessionPool = await new Pool({
		connectionString: responses.session_db_string,
	});

	await clearDatabase(appPool);
	const schoolDeets = await insertSchool(appPool);
	const unlockedAsset = await unlockAsset(appPool, schoolDeets.id);
	const unverifiedUser = await insertUnverifiedUser(appPool, `zzzzzz@email.com`, schoolDeets.id);
	const schoolAdminUser = await insertRegisteredUser(appPool, `zzzzzz3@email.com`, schoolDeets.id, `school-admin`);
	const claAdminUser = await insertRegisteredUser(appPool, `zzzzzz4@email.com`, schoolDeets.id, 'cla-admin');
	const courseDeets = await insertCourse(appPool, schoolDeets.id, schoolAdminUser.id);
	const schoolAdminSessionToken = await doLogin(appPool, sessionPool, `zzzzzz3@email.com`, schoolAdminUser.password);
	const claAdminSessionToken = await doLogin(appPool, sessionPool, `zzzzzz4@email.com`, claAdminUser.password);
	const extractDeets = await insertExtract(appPool, sessionPool, schoolAdminSessionToken, courseDeets.oid, unlockedAsset.isbn13);
	const extractShareDeets = await insertExtractShare(appPool, sessionPool, schoolAdminSessionToken, extractDeets.oid);

	const deets = {
		asset: unlockedAsset,
		course: courseDeets,
		user: schoolAdminUser,
		claAdmin: claAdminUser,
		extract: extractDeets,
		extractShare: extractShareDeets,
		unverified: unverifiedUser,
		school: schoolDeets,
		claAdminSessionToken: claAdminSessionToken,
		schoolAdminSessionToken: schoolAdminSessionToken,
	};

	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.setViewport({
		width: 1440,
		height: 3000,
		deviceScaleFactor: 1,
	});
	const root = path.join(__dirname, '_out');
	await fs.remove(root);

	// not logged in first
	for (const url of urls) {
		if (typeof url !== "string") {
			continue;
		}
		const u = new URL(responses.base_url + url);
		u.searchParams.append('logged-in', 'false');
		const notLoggedRoot = path.join(root, 'not-logged-in');
		await screenshotPage(page, u.href, notLoggedRoot);
	}

	// logged in
	for (const url of urls) {
		let pathname = url;
		let sessionToken = schoolAdminSessionToken;
		if (typeof url === "function") {
			const result = url(deets);
			if (typeof result === "string") {
				pathname = result;
				sessionToken = schoolAdminSessionToken;
			} else {
				pathname = result.path;
				sessionToken = result.sessionToken;
			}
		}
		const u = new URL(responses.base_url + pathname);
		u.searchParams.append('logged-in', 'true');
		const loggedRoot = path.join(root, 'logged-in');
		await screenshotPage(page, u.href, loggedRoot, sessionToken);
	}

	await browser.close();
	await clearDatabase(appPool);
})();