const execPromise = require("../execPromise");
const execFilePromise = require("../execFilePromise");
const explicit = require("./explicit");
const convertOne = require("./convertOne");

module.exports = async function (...args) {
	return explicit(execPromise, execFilePromise, convertOne, ...args);
};
