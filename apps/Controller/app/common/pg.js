const pg = require("pg");

const types = pg.types;

// Parse BIGINT as integers. This is technically NOT safe if it overflows the max. safe integer. We should fix this at some point!
types.setTypeParser(20, (val) => parseInt(val, 10));

module.exports = pg;
