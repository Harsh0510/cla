const examBoards = require("../../../common/examBoards");
const keyStages = require("../../../common/keyStages");

const doesSchoolExist = async (querier, schoolId) => {
	const schoolResults = await querier(
		`
			SELECT
				id
			FROM
				school
			WHERE
				id = $1
		`,
		[schoolId]
	);
	return schoolResults.rowCount > 0;
};

const getValidationMessagesForClass = (klass) => {
	const errors = [];

	const assert = (expr, msg) => {
		if (!expr) {
			errors.push(msg);
			return false;
		}
		return true;
	};

	if (assert(typeof klass.title === "string" || typeof klass.title === "number", "name must be a string")) {
		const title = klass.title.toString().trim();
		assert(title, "name not provided") && assert(title.length <= 200, "name must not exceed 200 characters");
	}

	if (klass.year_group) {
		assert(typeof klass.year_group === "string" || typeof klass.year_group === "number", "year group must be a string") &&
			assert(klass.year_group.toString().trim().length <= 250, "year group must not exceed 250 characters");
	}

	if (klass.number_of_students) {
		assert(typeof klass.number_of_students === "number", "number of students must be a number") &&
			assert(klass.number_of_students >= 1, "number of students must be positive") &&
			assert(klass.number_of_students <= 10000, "number of students must not exceed 10000") &&
			assert(Number.isInteger(klass.number_of_students), "number of students must be an integer");
	}

	if (klass.exam_board) {
		assert(typeof klass.exam_board === "string", "exam board must be a string") && assert(examBoards.byName[klass.exam_board], "unknown exam board");
	}

	if (klass.key_stage) {
		assert(typeof klass.key_stage === "string", "key stage must be a string") &&
			assert(keyStages.indexOf(klass.key_stage) >= 0, "key stage not found");
	}

	return errors;
};

const getValidationMessagesForClasses = (classes) => {
	const allErrors = [];
	classes.forEach((klass, i) => {
		const errors = getValidationMessagesForClass(klass);
		if (errors.length) {
			allErrors.push({
				index: i,
				message: errors.join("; "),
			});
		}
	});
	return allErrors;
};

const uploadClassesInSingleQuery = async (querier, schoolId, creatorUserId, classes) => {
	try {
		const values = [];
		const binds = [];
		const schoolBindIdx = binds.push(schoolId);
		const creatorUserBindIdx = binds.push(creatorUserId);
		for (const klass of classes) {
			values.push(`(
				$${binds.push(klass.title.toString().trim())},
				$${binds.push(klass.year_group ? klass.year_group.toString().trim() : null)},
				$${binds.push(klass.number_of_students ? klass.number_of_students : null)},
				$${binds.push(klass.exam_board ? klass.exam_board : null)},
				$${binds.push(klass.key_stage ? klass.key_stage : null)},
				$${schoolBindIdx},
				$${creatorUserBindIdx}
			)`);
		}
		await querier(
			`
				INSERT INTO
					course
					(
						title,
						year_group,
						number_of_students,
						exam_board,
						key_stage,
						school_id,
						creator_id
					)
				VALUES
					${values.join(", ")}
				RETURNING
					id
			`,
			binds
		);
		return true;
	} catch (e) {
		if (e.message.indexOf("violates unique constraint") < 0) {
			throw e;
		}
	}
	return false;
};

const uploadSingleClass = async (querier, schoolId, creatorUserId, klass) => {
	const binds = [];
	const schoolBindIdx = binds.push(schoolId);
	const creatorUserBindIdx = binds.push(creatorUserId);
	try {
		const result = await querier(
			`
				INSERT INTO
					course
					(
						title,
						year_group,
						number_of_students,
						exam_board,
						key_stage,
						school_id,
						creator_id
					)
				VALUES (
					$${binds.push(klass.title.toString().trim())},
					$${binds.push(klass.year_group ? klass.year_group.toString().trim() : null)},
					$${binds.push(typeof klass.number_of_students === "undefined" ? null : klass.number_of_students)},
					$${binds.push(typeof klass.exam_board === "undefined" ? null : klass.exam_board)},
					$${binds.push(typeof klass.key_stage === "undefined" ? null : klass.key_stage)},
					$${schoolBindIdx},
					$${creatorUserBindIdx}
				)
				RETURNING
					id
			`,
			binds
		);
		return { id: result.rows[0].id };
	} catch (e) {
		if (e.message.indexOf("violates unique constraint") < 0) {
			throw e;
		}
	}
	return { error: "a class with that name already exists" };
};

const uploadClassesOneAtATime = async (querier, schoolId, creatorUserId, classes) => {
	const successfullyLoadedIndexes = [];
	const errors = [];
	for (let i = 0, len = classes.length; i < len; ++i) {
		const klass = classes[i];
		const { error } = await uploadSingleClass(querier, schoolId, creatorUserId, klass);
		if (!error) {
			successfullyLoadedIndexes.push(i);
		} else {
			errors.push({
				index: i,
				message: error,
			});
		}
	}
	return { errors, successfullyLoadedIndexes };
};

const classCreate = async (querier, schoolId, creatorUserId, classes) => {
	if (!(await doesSchoolExist(querier, schoolId))) {
		const e = new Error("institution not found");
		e.httpCode = 400;
		throw e;
	}
	const errors = getValidationMessagesForClasses(classes);
	const validationErrorsByIndex = Object.create(null);
	const nonErroredClasses = [];
	for (const error of errors) {
		validationErrorsByIndex[error.index] = error;
	}
	for (let i = 0, len = classes.length; i < len; ++i) {
		if (!validationErrorsByIndex[i]) {
			nonErroredClasses.push({ ...classes[i], _origIndex: i });
		}
	}
	if (!nonErroredClasses.length) {
		return { errors: errors, successfullyLoadedIndexes: [] };
	}
	if (await uploadClassesInSingleQuery(querier, schoolId, creatorUserId, nonErroredClasses)) {
		return { errors: errors, successfullyLoadedIndexes: nonErroredClasses.map((c) => c._origIndex) };
	}
	const result = await uploadClassesOneAtATime(querier, schoolId, creatorUserId, nonErroredClasses);
	for (const error of result.errors) {
		error.index = nonErroredClasses[error.index]._origIndex;
		errors.push(error);
	}
	errors.sort((a, b) => a.index - b.index);
	return {
		errors: errors,
		successfullyLoadedIndexes: result.successfullyLoadedIndexes.map((idx) => nonErroredClasses[idx]._origIndex),
	};
};

module.exports = {
	doesSchoolExist,
	getValidationMessagesForClass,
	getValidationMessagesForClasses,
	uploadClassesInSingleQuery,
	uploadSingleClass,
	uploadClassesOneAtATime,
	classCreate,
};
