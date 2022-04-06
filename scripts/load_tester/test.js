const getPool = require('./getPool');
const { prepare } = require("./prepare");

(async () => {
	const pool = await getPool(`Application:`);

	prepare(pool, async data => {
		console.log(data);
		console.log(data.password);
	});
})();
