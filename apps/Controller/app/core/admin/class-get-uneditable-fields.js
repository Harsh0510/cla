const blockedFields = require("../../common/wonde/classUpdatableFields");

/**
 * Get all institution details for a particular admin
 */
module.exports = async function (params, ctx) {
	return {
		fields: blockedFields,
	};
};
