const fs = require("fs");
const path = require("path");
const util = require('util');
const crypto = require('crypto');

const moment = require("moment");

const getPool = require("./getPool");
const { prepare, loginUsers } = require("./prepare");
const loadtest = require("./loadtest");
const shuffle = require("./shuffle");

const genRandomBytes = util.promisify(crypto.randomBytes);

require('dotenv').config();

const TARGET_ORIGIN = (() => {
	if (process.env.OCC_LOAD_TEST_ORIGIN) {
		return process.env.OCC_LOAD_TEST_ORIGIN;
	}
	return `http://localhost:13000`;
})();

let appPool;
let sessPool;

function hasSucceeded(result) {
	if (result.nine_nine_nine > 10000) {
		return false;
	}
	if (result.median > 5000) {
		return false;
	}
	const failureRate = result.num_failures / result.num_requests;
	if (failureRate > 0.001) {
		return false;
	}
	return true;
}

const wait = (millis) => new Promise(resolve => setTimeout(resolve, millis));

async function execLocust(fetcher) {
	let targetConcurrency = 2;
	let highestSuccess = 0;
	let lowestFailed = Number.MAX_SAFE_INTEGER;
	const allResults = [];
	while (true) {
		const DURATION = 5;
		const result = await loadtest({
			duration: DURATION,
			concurrency: targetConcurrency,
			fetcher: fetcher,
		});
		result.target_concurrency = targetConcurrency;
		result.target_duration = DURATION;
		let newTargetConcurrency;
		const succeeded = hasSucceeded(result, targetConcurrency);
		await wait(succeeded ? 2000 : 4000);
		if (succeeded) {
			allResults.push(result);
			highestSuccess = targetConcurrency;
			if (lowestFailed < Number.MAX_SAFE_INTEGER) {
				newTargetConcurrency = Math.floor((targetConcurrency + lowestFailed) / 2);
			} else {
				const diff = Math.min(25, targetConcurrency);
				newTargetConcurrency = targetConcurrency + diff;
			}
		} else {
			lowestFailed = Math.min(lowestFailed, targetConcurrency);
			newTargetConcurrency = Math.floor((targetConcurrency + highestSuccess) / 2);
		}
		if (Math.abs(targetConcurrency - newTargetConcurrency) <= 3) {
			break;
		}
		targetConcurrency = newTargetConcurrency;
	}
	return allResults;
}

function randIdx(arr) {
	return Math.floor(Math.random() * arr.length);
}

function rand(arr) {
	return arr[randIdx(arr)];
}

const surges = [
	{
		description: `/search/search [not logged in]`,
		callback: async function () {
			const datas = [
				{
					query: ``,
					limit: 5,
					offset: 0,
					filter: {
						level: [`primary`],
					},
				},
				{
					query: ``,
					limit: 5,
					offset: 0,
					filter: {
						level: [`secondary`],
					},
				},
				{
					query: ``,
					limit: 5,
					offset: 0,
					filter: {},
				},
				{
					query: `shakespeare`,
					limit: 5,
					offset: 0,
					filter: {},
				},
				{
					query: `psychology`,
					limit: 5,
					offset: 0,
					filter: {},
				},
				{
					query: `social`,
					limit: 5,
					offset: 0,
					filter: {
						exam: [`A Level`],
					},
				},
				{
					query: ``,
					limit: 5,
					offset: 0,
					filter: {
						level: [`primary`],
						key_stage: [`KS1`],
					},
				},
				{
					query: `globe`,
					limit: 5,
					offset: 0,
					filter: {
						exam: [`GCSE`],
					},
				},
				{
					query: `reflective`,
					limit: 10,
					offset: 0,
					filter: {
						subject: [`VFXC`],
					},
				},
			];
			return await execLocust(() => ({
				url: `${TARGET_ORIGIN}/search/search`,
				method: `POST`,
				data: rand(datas),
				headers: {
					'X-CSRF': 'y',
				},
			}));
		},
	},
	{
		description: `/public/subjects-get-all [not logged in]`,
		callback: async function () {
			return await execLocust(() => ({
				url: `${TARGET_ORIGIN}/public/subjects-get-all`,
				method: `POST`,
				headers: {
					'X-CSRF': 'y',
				},
			}));
		},
	},
	{
		description: `/public/asset-get-one [not logged in]`,
		callback: async function () {
			const datas = [
				{ isbn13: `9780007462094` },
				{ isbn13: `9780198332794` },
				{ isbn13: `9780198482345` },
				{ isbn13: `9780008261696` },
				{ isbn13: `9780198305958` },
				{ isbn13: `9780435197049` },
				{ isbn13: `9780435196691` },
				{ isbn13: `9780008317386` },
				{ isbn13: `9780198359401` },
				{ isbn13: `9780198398967` },
				{ isbn13: `9780198482932` },
				{ isbn13: `9780007186600` },
				{ isbn13: `9780007288441` },
				{ isbn13: `9781292182360` },
				{ isbn13: `9780198372073` },
				{ isbn13: `9780198367598` },
				{ isbn13: `9780198493105` },
				{ isbn13: `9780198414841` },
				{ isbn13: `9780008236373` },
				{ isbn13: `9780435070861` },
				{ isbn13: `9780198308188` },
				{ isbn13: `9780198415848` },
				{ isbn13: `9781292257266` },
				{ isbn13: `9780198483564` },
				{ isbn13: `9780198371762` },
				{ isbn13: `9781408521311` },
				{ isbn13: `9780198416302` },
				{ isbn13: `9780435194543` },
				{ isbn13: `9781782943563` },
				{ isbn13: `9780198365884` },
				{ isbn13: `9780198482000` },
				{ isbn13: `9780198398943` },
				{ isbn13: `9780198367796` },
				{ isbn13: `9781292256726` },
				{ isbn13: `9780198482376` },
				{ isbn13: `9780198372158` },
				{ isbn13: `9780435183325` },
				{ isbn13: `9780198412977` },
				{ isbn13: `9780008222963` },
				{ isbn13: `9780198301073` },
				{ isbn13: `9780008133498` },
				{ isbn13: `9780435189440` },
				{ isbn13: `9781906622367` },
				{ isbn13: `9781292246918` },
				{ isbn13: `9780198415930` },
				{ isbn13: `9781292245294` },
				{ isbn13: `9780198481171` },
				{ isbn13: `9780198339229` },
				{ isbn13: `9780435167912` },
				{ isbn13: `9780198481034` },
			];
			return await execLocust(() => ({
				url: `${TARGET_ORIGIN}/public/asset-get-one`,
				method: `POST`,
				data: rand(datas),
				headers: {
					'X-CSRF': 'y',
				},
			}));
		},
	},
	{
		description: `/public/extract-view-one [not logged in]`,
		callback: async function () {
			return prepare(appPool, async data => {
				return await execLocust(() => {
					const extract = rand(data.extracts);
					return {
						url: `${TARGET_ORIGIN}/public/extract-view-one`,
						method: `POST`,
						data: {
							extract_oid: extract.oid,
							extract_share_oid: extract.extract_shares[0].oid,
						},
						headers: {
							'X-CSRF': 'y',
						},
					};
				});
			});
		},
	},
	{
		description: `/public/extract-search [not logged in]`,
		callback: async function () {
			return prepare(appPool, async data => {
				return await execLocust(() => {
					return {
						url: `${TARGET_ORIGIN}/public/extract-search`,
						method: `POST`,
						data: { extract_share_oid: rand(data.extract_shares).oid },
						headers: {
							'X-CSRF': 'y',
						},
					};
				});
			});
		},
	},
	{
		description: `/auth/login - with correct credentials`,
		callback: async function () {
			return prepare(appPool, async data => {
				return await execLocust(() => {
					const idx = randIdx(data.users);
					return {
						url: `${TARGET_ORIGIN}/auth/login`,
						method: `POST`,
						data: {
							email: data.users[idx].email,
							password: data.password,
						},
						headers: {
							'X-CSRF': 'y',
						},
					};
				});
			});
		},
	},
	{
		description: `/public/extract-search [logged in]`,
		callback: async function () {
			return prepare(appPool, async data => {
				const sessTokensByUserId = await loginUsers(sessPool, data.users);
				const sessIds = [];
				const reqData = [];

				reqData.push({ title: `maths` });
				sessIds.push(sessTokensByUserId[data.users[0].id]);

				reqData.push({ title: `homework` });
				sessIds.push(sessTokensByUserId[data.users[1].id]);

				reqData.push({ title: `test` });
				sessIds.push(sessTokensByUserId[data.users[2].id]);

				reqData.push({ title: `health` });
				sessIds.push(sessTokensByUserId[data.users[3].id]);

				reqData.push({ title: `power` });
				sessIds.push(sessTokensByUserId[data.users[4].id]);

				reqData.push({ title: `cold` });
				sessIds.push(sessTokensByUserId[data.users[5].id]);

				reqData.push({ title: `dm` });
				sessIds.push(sessTokensByUserId[data.users[6].id]);

				reqData.push({ title: `rising` });
				sessIds.push(sessTokensByUserId[data.users[7].id]);

				reqData.push({ title: `english` });
				sessIds.push(sessTokensByUserId[data.users[8].id]);

				reqData.push({ query: `maths` });
				sessIds.push(sessTokensByUserId[data.users[9].id]);

				reqData.push({ query: `homework` });
				sessIds.push(sessTokensByUserId[data.users[10].id]);

				reqData.push({ query: `test` });
				sessIds.push(sessTokensByUserId[data.users[11].id]);

				reqData.push({ query: `health` });
				sessIds.push(sessTokensByUserId[data.users[12].id]);

				reqData.push({ query: `power` });
				sessIds.push(sessTokensByUserId[data.users[13].id]);

				reqData.push({ query: `cold` });
				sessIds.push(sessTokensByUserId[data.users[14].id]);

				reqData.push({ query: `dm` });
				sessIds.push(sessTokensByUserId[data.users[15].id]);

				reqData.push({ query: `rising` });
				sessIds.push(sessTokensByUserId[data.users[16].id]);

				reqData.push({ query: `english` });
				sessIds.push(sessTokensByUserId[data.users[17].id]);

				reqData.push({ course_name: `english` });
				sessIds.push(sessTokensByUserId[data.users[18].id]);

				reqData.push({ course_name: `science` });
				sessIds.push(sessTokensByUserId[data.users[19].id]);

				reqData.push({ course_name: `gcse` });
				sessIds.push(sessTokensByUserId[data.users[20].id]);

				reqData.push({ course_name: `year` });
				sessIds.push(sessTokensByUserId[data.users[21].id]);

				reqData.push({ course_name: `computing` });
				sessIds.push(sessTokensByUserId[data.users[22].id]);

				reqData.push({ extract_oid: data.extracts[0].oid });
				sessIds.push(sessTokensByUserId[data.extracts[0].user_id]);

				reqData.push({ extract_oid: data.extracts[1].oid });
				sessIds.push(sessTokensByUserId[data.extracts[1].user_id]);

				reqData.push({ extract_oid: data.extracts[2].oid });
				sessIds.push(sessTokensByUserId[data.extracts[2].user_id]);

				reqData.push({ extract_oid: data.extracts[3].oid });
				sessIds.push(sessTokensByUserId[data.extracts[3].user_id]);

				reqData.push({ extract_oid: data.extracts[4].oid });
				sessIds.push(sessTokensByUserId[data.extracts[4].user_id]);

				reqData.push({ extract_share_oid: data.extract_shares[5].oid });
				sessIds.push(sessTokensByUserId[data.extract_shares[5].user_id]);

				reqData.push({ extract_share_oid: data.extract_shares[6].oid });
				sessIds.push(sessTokensByUserId[data.extract_shares[6].user_id]);

				reqData.push({ extract_share_oid: data.extract_shares[7].oid });
				sessIds.push(sessTokensByUserId[data.extract_shares[7].user_id]);

				reqData.push({ extract_share_oid: data.extract_shares[8].oid });
				sessIds.push(sessTokensByUserId[data.extract_shares[8].user_id]);

				reqData.push({ extract_share_oid: data.extract_shares[9].oid });
				sessIds.push(sessTokensByUserId[data.extract_shares[9].user_id]);

				return await execLocust(() => {
					const idx = randIdx(reqData);
					return {
						url: new URL(`${TARGET_ORIGIN}/public/extract-search`),
						method: `POST`,
						data: reqData[idx],
						headers: {
							'X-CSRF': 'y',
							'X-SESSID': sessIds[idx],
						},
					};
				});
			});
		},
	},
	{
		description: `/auth/get-notification [logged in]`,
		callback: async function () {
			return prepare(appPool, async data => {
				const sessTokensByUserId = await loginUsers(sessPool, data.users);
				const sessTokens = Object.values(sessTokensByUserId);
				return await execLocust(() => ({
					url: new URL(`${TARGET_ORIGIN}/auth/get-notification`),
					method: `POST`,
					data: {
						showAll: true,
					},
					headers: {
						'X-CSRF': 'y',
						'X-SESSID': rand(sessTokens),
					},
				}));
			});
		},
	},
	{
		description: `/search/search [logged in]`,
		callback: async function () {
			const datas = [
				{
					query: ``,
					limit: 5,
					offset: 0,
					filter: {
						level: [`primary`],
					},
				},
				{
					query: ``,
					limit: 5,
					offset: 0,
					filter: {
						level: [`secondary`],
					},
				},
				{
					query: ``,
					limit: 5,
					offset: 0,
					filter: {},
				},
				{
					query: `shakespeare`,
					limit: 5,
					offset: 0,
					filter: {},
				},
				{
					query: `psychology`,
					limit: 5,
					offset: 0,
					filter: {},
				},
				{
					query: `social`,
					limit: 5,
					offset: 0,
					filter: {
						exam: [`A Level`],
					},
				},
				{
					query: ``,
					limit: 5,
					offset: 0,
					filter: {
						level: [`primary`],
						key_stage: [`KS1`],
					},
				},
				{
					query: `globe`,
					limit: 5,
					offset: 0,
					filter: {
						exam: [`GCSE`],
					},
				},
				{
					query: `reflective`,
					limit: 10,
					offset: 0,
					filter: {
						subject: [`VFXC`],
					},
				},
			];
			return prepare(appPool, async data => {
				const sessTokensByUserId = await loginUsers(sessPool, data.users);
				const sessTokens = Object.values(sessTokensByUserId);
				return await execLocust(() => ({
					url: new URL(`${TARGET_ORIGIN}/search/search`),
					method: `POST`,
					data: rand(datas),
					headers: {
						'X-CSRF': 'y',
						'X-SESSID': rand(sessTokens),
					},
				}));
			});
		},
	},
	{
		description: `/public/asset-get-one [logged in]`,
		callback: async function () {
			const datas = [
				{ isbn13: `9780007462094` },
				{ isbn13: `9780198332794` },
				{ isbn13: `9780198482345` },
				{ isbn13: `9780008261696` },
				{ isbn13: `9780198305958` },
				{ isbn13: `9780435197049` },
				{ isbn13: `9780435196691` },
				{ isbn13: `9780008317386` },
				{ isbn13: `9780198359401` },
				{ isbn13: `9780198398967` },
				{ isbn13: `9780198482932` },
				{ isbn13: `9780007186600` },
				{ isbn13: `9780007288441` },
				{ isbn13: `9781292182360` },
				{ isbn13: `9780198372073` },
				{ isbn13: `9780198367598` },
				{ isbn13: `9780198493105` },
				{ isbn13: `9780198414841` },
				{ isbn13: `9780008236373` },
				{ isbn13: `9780435070861` },
				{ isbn13: `9780198308188` },
				{ isbn13: `9780198415848` },
				{ isbn13: `9781292257266` },
				{ isbn13: `9780198483564` },
				{ isbn13: `9780198371762` },
				{ isbn13: `9781408521311` },
				{ isbn13: `9780198416302` },
				{ isbn13: `9780435194543` },
				{ isbn13: `9781782943563` },
				{ isbn13: `9780198365884` },
				{ isbn13: `9780198482000` },
				{ isbn13: `9780198398943` },
				{ isbn13: `9780198367796` },
				{ isbn13: `9781292256726` },
				{ isbn13: `9780198482376` },
				{ isbn13: `9780198372158` },
				{ isbn13: `9780435183325` },
				{ isbn13: `9780198412977` },
				{ isbn13: `9780008222963` },
				{ isbn13: `9780198301073` },
				{ isbn13: `9780008133498` },
				{ isbn13: `9780435189440` },
				{ isbn13: `9781906622367` },
				{ isbn13: `9781292246918` },
				{ isbn13: `9780198415930` },
				{ isbn13: `9781292245294` },
				{ isbn13: `9780198481171` },
				{ isbn13: `9780198339229` },
				{ isbn13: `9780435167912` },
				{ isbn13: `9780198481034` },
			];
			return prepare(appPool, async data => {
				const sessTokensByUserId = await loginUsers(sessPool, data.users);
				const sessTokens = Object.values(sessTokensByUserId);
				return await execLocust(() => ({
					url: `${TARGET_ORIGIN}/public/asset-get-one`,
					method: `POST`,
					data: rand(datas),
					headers: {
						'X-CSRF': 'y',
						'X-SESSID': rand(sessTokens),
					},
				}));
			});
		},
	},
	{
		description: `/public/course-get-all-for-school [logged in]`,
		callback: async function () {
			return prepare(appPool, async data => {
				const sessTokensByUserId = await loginUsers(sessPool, data.users);
				const sessTokens = Object.values(sessTokensByUserId);
				return await execLocust(() => ({
					url: `${TARGET_ORIGIN}/public/course-get-all-for-school`,
					method: `POST`,
					headers: {
						'X-CSRF': 'y',
						'X-SESSID': rand(sessTokens),
					},
				}));
			});
		},
	},
	{
		description: `/public/get-extract-limits [logged in]`,
		callback: async function () {
			return prepare(appPool, async data => {
				const sessTokensByUserId = await loginUsers(sessPool, data.users);
				const sessTokens = Object.values(sessTokensByUserId);
				return await execLocust(() => {
					const course = rand(data.courses);
					const asset = rand(data.assets);
					return {
						url: `${TARGET_ORIGIN}/public/get-extract-limits`,
						method: `POST`,
						data: {
							course_oid: course.oid,
							work_isbn13: asset.pdf_isbn13,
						},
						headers: {
							'X-CSRF': 'y',
							'X-SESSID': rand(sessTokens),
						},
					};
				});
			});
		},
	},
	{
		description: `/public/extract-create [logged in - successful creations]`,
		callback: async function () {
			const numbers = [...Array(198).keys()].slice(1);
			return prepare(appPool, async data => {
				const sessTokensByUserId = await loginUsers(sessPool, data.users);
				const examBoards = [`AQA`, `CIE`, `SQA`, `CCEA`];
				const titles = [
					`Chemistry lesson 1`,
					`Activate`,
					`Test for biology`,
					`Introduction`,
					`Trollz`,
					`Mathematical language`,
					`English GCSE`,
					`Mandy Test`,
					`Key quotes and practice`,
				];
				return await execLocust(() => {
					const course = rand(data.courses);
					const user = rand(course.school.users);
					const asset = rand(data.assets);
					const numStudents = Math.floor(Math.random() * 100) + 1;
					const examBoard = rand(examBoards);
					const extractTitle = rand(titles);
					const numPages = Math.floor(Math.random() * 10) + 1;
					const pages = shuffle(numbers).slice(0, numPages);
					return {
						url: `${TARGET_ORIGIN}/public/extract-create`,
						method: `POST`,
						data: {
							course_oid: course.oid,
							work_isbn13: asset.pdf_isbn13,
							students_in_course: numStudents,
							exam_board: examBoard,
							extract_title: extractTitle,
							pages: pages,
						},
						headers: {
							'X-CSRF': 'y',
							'X-SESSID': sessTokensByUserId[user.id],
						},
					};
				});
			});
		},
	},
	{
		description: `/public/extract-get-share-links [logged in]`,
		callback: async function () {
			return prepare(appPool, async data => {
				const sessTokensByUserId = await loginUsers(sessPool, data.users);
				return await execLocust(() => {
					const extract = rand(data.extracts);
					const sessToken = sessTokensByUserId[extract.user_id];

					return {
						url: `${TARGET_ORIGIN}/public/extract-get-share-links`,
						method: `POST`,
						data: {
							extract_oid: extract.oid,
						},
						headers: {
							'X-CSRF': 'y',
							'X-SESSID': sessToken,
						},
					};
				});
			});
		},
	},
	{
		description: `/public/extract-view-one [logged in]`,
		callback: async function () {
			return prepare(appPool, async data => {
				const sessTokensByUserId = await loginUsers(sessPool, data.users);
				return await execLocust(() => {
					const extract = rand(data.extracts);
					const sessToken = sessTokensByUserId[extract.user_id];
					return {
						url: `${TARGET_ORIGIN}/public/extract-view-one`,
						method: `POST`,
						data: {
							extract_oid: extract.oid,
						},
						headers: {
							'X-CSRF': 'y',
							'X-SESSID': sessToken,
						},
					};
				});
			});
		},
	},
	{
		description: `/auth/get-my-details [logged in]`,
		callback: async function () {
			return prepare(appPool, async data => {
				const sessTokensByUserId = await loginUsers(sessPool, data.users);
				const sessTokens = Object.values(sessTokensByUserId);
				return await execLocust(() => {
					return {
						url: `${TARGET_ORIGIN}/auth/get-my-details`,
						method: `POST`,
						headers: {
							'X-CSRF': 'y',
							'X-SESSID': rand(sessTokens),
						},
					};
				});
			});
		},
	},
];

(async () => {
	try {
		appPool = await getPool(`Application:`, {
			database: process.env.CLA_AM_DB || `cla_am_db`,
			password: process.env.CLA_AM_PASS || `cla_am_pass`,
			username: process.env.CLA_AM_USER || `cla_am_user`,
			host: process.env.CLA_AM_HOST || `localhost`,
			port: (process.env.CLA_AM_PORT !== undefined) ? parseInt(process.env.CLA_AM_PORT, 10) : 19000,
			ssl: (process.env.CLA_AM_SSL === undefined) ? false : (process.env.CLA_AM_SSL === '1'),
		});
		sessPool = await getPool(`Session:`, {
			database: process.env.CLA_SM_DB || `cla_sm_db`,
			password: process.env.CLA_SM_PASS || `cla_sm_pass`,
			username: process.env.CLA_SM_USER || `cla_sm_user`,
			host: process.env.CLA_SM_HOST || `localhost`,
			port: (process.env.CLA_SM_PORT !== undefined) ? parseInt(process.env.CLA_SM_PORT, 10) : 20000,
			ssl: (process.env.CLA_SM_SSL === undefined) ? false : (process.env.CLA_SM_SSL === '1'),
		});
		const len = surges.length;
		const allResults = [];
		const randString = (await genRandomBytes(8)).toString('hex');
		for (let i = 0; i < len; ++i) {
			const surge = surges[i];
			const result = await surge.callback();
			const fullResult = {
				index: i,
				target_origin: TARGET_ORIGIN,
				description: surge.description,
				results: result,
			};
			allResults.push(fullResult);
			fs.writeFileSync(
				path.join(
					__dirname,
					`log-result__${randString}__${moment().format(`YYYY-MM-DD_HH-mm-ss-SSS`)}__${i}.json`
				),
				JSON.stringify(fullResult, null, '\t')
			);
		}
		fs.writeFileSync(
			path.join(
				__dirname,
				`log-result__${randString}__${moment().format(`YYYY-MM-DD_HH-mm-ss-SSS`)}__all.json`
			),
			JSON.stringify(allResults, null, '\t')
		);
	} catch (e) {
		console.log(e.stack);
	}
})();
