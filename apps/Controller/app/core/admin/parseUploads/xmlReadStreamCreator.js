const path = require("path");
const fs = require("fs");

module.exports = (dir, entry) => fs.createReadStream(path.join(dir, entry.name));
