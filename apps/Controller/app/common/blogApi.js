const axios = require("axios");
const htmlDecode = require("html-entities").decode;

let blogUpsertByCategoryNames;
let blogUpsert;

const upsertBlogEntries = async (querier, posts) => {
	if (!posts || !posts.length) {
		return;
	}
	const binds = [];
	const values = [];
	let i = 0;
	for (const post of posts) {
		values.push(`(
			$${binds.push(post.id)},
			$${binds.push(post.image_relative_url)},
			$${binds.push(post.title ? htmlDecode(post.title) : null)},
			$${binds.push(post.author_name)},
			$${binds.push(post.date_created)},
			$${binds.push(post.relative_url)},
			${i})
		`);
		i++;
	}

	await querier(
		`
			INSERT INTO
				cached_latest_blog_post
				(
					id,
					image_relative_url,
					title,
					author_name,
					date_created,
					relative_url,
					sort_order
				)
			VALUES
				${values.join(",")}
			ON CONFLICT ON CONSTRAINT cached_latest_blog_post_pkey
			DO UPDATE SET
				image_relative_url = EXCLUDED.image_relative_url,
				title = EXCLUDED.title,
				author_name = EXCLUDED.author_name,
				date_created = EXCLUDED.date_created,
				relative_url = EXCLUDED.relative_url,
				sort_order = EXCLUDED.sort_order;
		`,
		binds
	);
	await querier(
		`
			DELETE FROM
				cached_latest_blog_post
			WHERE
				id NOT IN (${posts.map((post) => post.id).join(",")})
		`
	);
};

if (process.env.EP_BLOG_URL) {
	const EP_BLOG_URL = process.env.EP_BLOG_URL.replace(/\/$/, "");
	const EP_REST_API_BASE = EP_BLOG_URL + "/wp-json/wp/v2";

	const fetchPostsByCategoryIds = async (categoryIds) => {
		const categoryIdToScoreMap = Object.create(null);
		let categoryScore = 1000000000;
		for (const cid of categoryIds) {
			categoryIdToScoreMap[cid] = categoryScore;
			categoryScore /= 20;
		}
		categoryIds = categoryIds.map((id) => "categories[]=" + id).join("&");
		const rawPosts = await axios.get(
			EP_REST_API_BASE +
				"/posts?" +
				"_embed=author" +
				"&_fields=id,title.rendered,jetpack_featured_media_url,date_gmt,link,_links.author,categories" +
				"&per_page=100" +
				"&" +
				categoryIds
		);

		const posts = rawPosts.data.map((post) => {
			const dt = new Date(post.date_gmt);
			let categoryScore = 0;
			for (const cid of post.categories) {
				if (categoryIdToScoreMap[cid]) {
					categoryScore += categoryIdToScoreMap[cid];
				}
			}
			return {
				id: post.id,
				image_relative_url: post.jetpack_featured_media_url ? new URL(post.jetpack_featured_media_url, EP_BLOG_URL).pathname : null,
				title: post.title ? post.title.rendered : null,
				author_name: post._embedded && post._embedded.author && post._embedded.author[0] ? post._embedded.author[0].name : null,
				date_created: dt,
				timestamp: dt.getTime(),
				relative_url: new URL(post.link).pathname,
				category_score: categoryScore,
			};
		});
		posts.sort((a, b) => {
			const diff = b.category_score - a.category_score;
			if (diff < 0 || diff > 0) {
				return diff;
			}
			return b.timestamp - a.timestamp;
		});
		return posts.slice(0, 3);
	};

	const fetchbyCategoryNames = async (categoryNames) => {
		const result = await axios.get(EP_REST_API_BASE + "/categories?_fields=id,name");
		const categoryNamesLowerMap = Object.create(null);
		categoryNames = categoryNames.filter((t) => typeof t === "string").map((cn) => cn.toLowerCase().trim());
		let index = 0;
		for (const tn of categoryNames) {
			if (!tn) {
				continue;
			}
			categoryNamesLowerMap[tn] = ++index;
		}
		const filteredCategories = result.data
			.map((category) => ({ name: category.name.trim().toLowerCase(), id: category.id }))
			.filter((category) => !!categoryNamesLowerMap[category.name]);
		filteredCategories.sort((a, b) => {
			return categoryNamesLowerMap[a.name] - categoryNamesLowerMap[b.name];
		});
		return await fetchPostsByCategoryIds(filteredCategories.map((c) => c.id));
	};

	blogUpsertByCategoryNames = async (querier, categoryNames) => {
		const posts = await fetchbyCategoryNames(categoryNames);
		await upsertBlogEntries(querier, posts);
	};

	blogUpsert = async (querier) => {
		const result = await querier(
			`
				SELECT
					home_screen_blog_category_names AS names
				FROM
					settings
				WHERE
					id = 1
			`
		);
		if (result.rowCount) {
			return await blogUpsertByCategoryNames(querier, result.rows[0].names);
		}
	};
} else {
	blogUpsertByCategoryNames = async () => {};
	blogUpsert = blogUpsertByCategoryNames;
}

module.exports = {
	blogUpsert,
	blogUpsertByCategoryNames,
};
