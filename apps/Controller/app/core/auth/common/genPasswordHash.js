const crypto = require("crypto");
const util = require("util");

const genRandomBytes = util.promisify(crypto.randomBytes);

module.exports = async function (password) {
	const algo = "sha256";
	// 32 random bytes. First 16 bytes are the salt, second 16 bytes are the activation token.
	let randomBytesBuffer = await genRandomBytes(32);
	const saltRandomBytes = randomBytesBuffer.slice(0, 16);
	const hash = crypto.createHmac(algo, saltRandomBytes);
	hash.update(password);
	const passwordHashHex = hash.digest("hex");
	return {
		hash: passwordHashHex,
		salt: saltRandomBytes.toString("hex"),
		activation_token: randomBytesBuffer.slice(16).toString("hex"),
		algo: algo,
	};
};
