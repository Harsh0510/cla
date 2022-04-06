const fs = require("fs");

module.exports = (fp) => new Promise((resolve) => fs.unlink(fp, resolve));
