const util = require('util');
const crypto = require('crypto');

const genRandomBytes = util.promisify(crypto.randomBytes);

module.exports = async function genPassword() {
	const pw = (await genRandomBytes(9)).toString('base64');
	return pw + '!Fe2';
};
