const tvfUtil = require("#tvf-util");

/**
 * Add the default class.
 * @param {any} ctx
 * @param {object} data Data about the class to be created.
 * @param {string} data.title The user's title (Mr, Mrs, etc.).
 * @param {number} data.id The user's cla_user database ID.
 * @param {number} data.school_id The user's school ID.
 * @param {string} data.last_name The user's last name.
 * @param {string} [data.default_class_year_group] The optional name of the default class's year group.
 * @param {string} [data.default_class_exam_board] The optional name of the default class's exam board.
 * @returns {Promise<void>}
 */
const addDefaultClass = async (ctx, data) => {
	const defaultClassName = data.title + " " + data.last_name + "'s Default class";
	const classOid = await tvfUtil.generateObjectIdentifier();
	let title = defaultClassName;
	let counter = 1;
	while (true) {
		try {
			await ctx.appDbQuery(
				`
					INSERT INTO
						course
						(
							title,
							year_group,
							exam_board,
							oid,
							school_id,
							creator_id
						)
					VALUES
						(
							$1,
							$2,
							$3,
							$4,
							$5,
							$6
						)
				`,
				[title, data.default_class_year_group || "General", data.default_class_exam_board || null, classOid, data.school_id, data.id]
			);
		} catch (e) {
			if (e.message.includes(" violates unique constraint ")) {
				counter++;
				title = defaultClassName + " (" + counter + ")";
				continue;
			} else {
				throw e;
			}
		}
		break;
	}
};

module.exports = addDefaultClass;
