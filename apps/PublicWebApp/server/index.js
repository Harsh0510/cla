const { Pool } = require('pg');
const Koa = require('koa');
const KoaRouter = require('koa-router');
const escapeHtml = require('escape-html');

const app = new Koa();
const router = new KoaRouter();

let appDbPool = null;

function route(endpoint, callback) {
	return router.get(endpoint, async ctx => {
		if (appDbPool === null) {
			appDbPool = await new Pool({
				user: process.env.CLA_AM_DB_USER,
				host: process.env.CLA_AM_DB_HOST,
				database: process.env.CLA_AM_DB_DB,
				password: process.env.CLA_AM_DB_PASS,
				port: process.env.CLA_AM_DB_PORT,
				ssl: !!process.env.CLA_AM_DB_SSL,
			});
		}
		ctx.set('Content-Type', 'text/html; charset=UTF-8');
		let response;
		try {
			response = await callback(ctx);
		} catch (e) {
			if (typeof e.httpCode === 'number') {
				ctx.throw(e.httpCode, e.message);
			} else {
				throw e;
			}
		}
		ctx.body = response;
	});
}

route('/works/:match', async (koaCtx) => {
	const isbn13 = koaCtx.captures[0].split('-')[0];
	const result = await appDbPool.query(
		`
			SELECT
				id,
				title
			FROM
				asset
			WHERE
				pdf_isbn13 = $1
				AND active = TRUE
		`,
		[isbn13]
	);
	if (!result.rows.length) {
		koaCtx.throw(404);
	}
	const asset = result.rows[0];
	const bookTitle = asset.title;
	const faceBookText = "Education Platform - I created a copy of " + bookTitle;
	const twitterText = "I just shared a copy of "+ bookTitle + " on the #educationplatform";
	const pageUrl = `${process.env.CLA_BASE_URL || ''}${koaCtx.request.url}`;
	const thumbnailUrl = `${process.env.ASSET_ORIGIN || ''}/coverpages/${isbn13}.png`;

	const eThumbnailUrl = escapeHtml(thumbnailUrl);
	const eTitle = escapeHtml(`${bookTitle} - Education Platform`);
	const ePageUrl = escapeHtml(pageUrl);

	return `<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<title>${eTitle}</title>
		<meta property="og:title" content="${escapeHtml(faceBookText)}" />
		<meta property="og:type" content="article" />
		<meta property="og:image" content="${eThumbnailUrl}" />
		<meta property="og:url" content="${ePageUrl}" />

		<meta name="twitter:card" content="summary_large_image" />
		<meta name="twitter:url" content="${ePageUrl}" />
		<meta name="twitter:description" content="${escapeHtml(twitterText)}" />
		<meta name="twitter:image" content="${eThumbnailUrl}" />
	</head>
	<body>
		<h1>${eTitle}</h1>
		<img src="${eThumbnailUrl}" />
	</body>
</html>`;
});

route('/welcome', async (koaCtx) => {
	const faceBookText = "Welcome to the Education Platform - Education Platform";
	const twitterText = "Welcome to the Education Platform - Education Platform";
	const pageUrl = `${process.env.CLA_BASE_URL || ''}${koaCtx.request.url}`;

	const eThumbnailUrl = `https://occclaproductionstorage.blob.core.windows.net/public/welcome-banner.png`;
	const eTitle = `Welcome to the Education Platform`;
	const ePageUrl = escapeHtml(pageUrl);
	return `<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<title>${eTitle}</title>
		<meta property="og:title" content="${escapeHtml(faceBookText)}" />
		<meta property="og:type" content="website" />
		<meta property="og:image" content="${eThumbnailUrl}" />
		<meta property="og:url" content="${ePageUrl}" />

		<meta name="twitter:card" content="summary_large_image" />
		<meta name="twitter:url" content="${ePageUrl}" />
		<meta name="twitter:description" content="${escapeHtml(twitterText)}" />
		<meta name="twitter:image" content="${eThumbnailUrl}" />
	</head>
	<body>
		<h1>${eTitle}</h1>
		<h2>Access free digital resources to copy and share for learning and teaching.</h2>
		<img src="${eThumbnailUrl}" />
	</body>
</html>`;
});

route('/', async (koaCtx) => {

	const faceBookText = "Education Platform";
	const twitterText = "Education Platform";
	const pageUrl = `${process.env.CLA_BASE_URL || ''}${koaCtx.request.url}`;
	const thumbnailUrl = `${process.env.ASSET_ORIGIN || ''}/emails/ep_logo.png`;

	const eThumbnailUrl = escapeHtml(thumbnailUrl);
	const eTitle = escapeHtml(`Education Platform`);
	const ePageUrl = escapeHtml(pageUrl);
	return `<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<title>${eTitle}</title>
		<meta property="og:title" content="${escapeHtml(faceBookText)}" />
		<meta property="og:type" content="website" />
		<meta property="og:image" content="${eThumbnailUrl}" />
		<meta property="og:url" content="${ePageUrl}" />

		<meta name="twitter:card" content="summary_large_image" />
		<meta name="twitter:url" content="${ePageUrl}" />
		<meta name="twitter:description" content="${escapeHtml(twitterText)}" />
		<meta name="twitter:image" content="${eThumbnailUrl}" />
	</head>
	<body>
		<h1>${eTitle}</h1>
		<img src="${eThumbnailUrl}" />
	</body>
</html>`;
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(17500);
