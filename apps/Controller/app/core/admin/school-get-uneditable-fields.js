const blockedFields = require("../../common/wonde/schoolUpdatableFields");

/**
 * Get all school details for a particular admin
 */
module.exports = async function (params, ctx) {
	return {
		fields: blockedFields,
	};
};
