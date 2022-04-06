const classCreate = require("../../../core/admin/lib/classCreate");
let mockClasses;
function resetAll() {
	mockClasses = [
		{
			title: "class1",
			year_group: 2,
			number_of_students: 25,
			exam_board: "AQA",
			key_stage: "KS1",
		},
		{
			title: "class2",
			year_group: 2,
			number_of_students: 25,
			exam_board: "AQA",
			key_stage: "KS1",
		},
		{
			title: "class3",
			year_group: 2,
			number_of_students: 25,
			exam_board: "AQA",
			key_stage: "KS1",
		},
	];
}

afterEach(resetAll);
beforeEach(resetAll);

describe("doesSchoolExist", () => {
	test("executes", async () => {
		let receivedBinds;
		const querier = (sql, binds) => {
			receivedBinds = binds;
			return {
				rowCount: 5,
			};
		};
		const result = await classCreate.doesSchoolExist(querier, 50);
		expect(result).toBe(true);
		expect(receivedBinds).toEqual([50]);
	});
});

describe("getValidationMessagesForClass", () => {
	test("When Invalid exam board is passed", async () => {
		mockClasses[0].exam_board = "TEST";
		const result = classCreate.getValidationMessagesForClass(mockClasses[0]);
		expect(result).toEqual(["unknown exam board"]);
	});

	test("When Invalid key stage is passed", async () => {
		mockClasses[0].key_stage = "KS";
		const result = classCreate.getValidationMessagesForClass(mockClasses[0]);
		expect(result).toEqual(["key stage not found"]);
	});

	test("When title is not provided", async () => {
		mockClasses[0].title = "";
		const result = classCreate.getValidationMessagesForClass(mockClasses[0]);
		expect(result).toEqual(["name not provided"]);
	});

	test("When empty title is provided", async () => {
		mockClasses[0].title = "    ";
		const result = classCreate.getValidationMessagesForClass(mockClasses[0]);
		expect(result).toEqual(["name not provided"]);
	});

	test("When title is passed non-string", async () => {
		mockClasses[0].title = [2, 4, 6];
		const result = classCreate.getValidationMessagesForClass(mockClasses[0]);
		expect(result).toEqual(["name must be a string"]);
	});

	test("When title is invalid", async () => {
		const title = "t".repeat(300);
		mockClasses[0].title = title;
		const result = classCreate.getValidationMessagesForClass(mockClasses[0]);
		expect(result).toEqual(["name must not exceed 200 characters"]);
	});

	test("When non-string/number year_group is provided", async () => {
		mockClasses[0].year_group = [];
		const result = classCreate.getValidationMessagesForClass(mockClasses[0]);
		expect(result).toEqual(["year group must be a string"]);
	});

	test("When too-long year_group is provided", async () => {
		mockClasses[0].year_group = "t".repeat(251);
		const result = classCreate.getValidationMessagesForClass(mockClasses[0]);
		expect(result).toEqual(["year group must not exceed 250 characters"]);
	});

	test("When number of students is invalid", async () => {
		mockClasses[0].number_of_students = "abc";
		const result = classCreate.getValidationMessagesForClass(mockClasses[0]);
		expect(result).toEqual(["number of students must be a number"]);
	});

	test("When number of students is passed -1", async () => {
		mockClasses[0].number_of_students = -1;
		const result = classCreate.getValidationMessagesForClass(mockClasses[0]);
		expect(result).toEqual(["number of students must be positive"]);
	});

	test("When number of students is passed greater than 10000", async () => {
		mockClasses[0].number_of_students = 10099;
		const result = classCreate.getValidationMessagesForClass(mockClasses[0]);
		expect(result).toEqual(["number of students must not exceed 10000"]);
	});

	test("When number of students is not an integer", async () => {
		mockClasses[0].number_of_students = 10.099;
		const result = classCreate.getValidationMessagesForClass(mockClasses[0]);
		expect(result).toEqual(["number of students must be an integer"]);
	});

	test("When only title and year group is provided", async () => {
		const mockClass = {
			title: "class1",
			year_group: 2,
		};
		const result = classCreate.getValidationMessagesForClass(mockClass);
		expect(result).toEqual([]);
	});
});

describe("getValidationMessagesForClasses", () => {
	test("executes", async () => {
		const result = await classCreate.getValidationMessagesForClasses(mockClasses);
		expect(result).toEqual([]);
	});

	test("When error is occured", async () => {
		mockClasses[0].exam_board = "TEST";
		const result = await classCreate.getValidationMessagesForClasses(mockClasses);
		expect(result).toEqual([
			{
				index: 0,
				message: "unknown exam board",
			},
		]);
	});
});

describe("uploadClassesInSingleQuery", () => {
	test("executes", async () => {
		const querier = (sql, binds) => {
			return {
				rowCount: 3,
			};
		};
		const result = await classCreate.uploadClassesInSingleQuery(querier, 1, 123, mockClasses);
		expect(result).toBe(true);
	});

	test("error", async () => {
		const querier = (sql, binds) => {
			throw new Error("violates unique constraint");
		};
		const result = await classCreate.uploadClassesInSingleQuery(querier, 1, 123, mockClasses);
		expect(result).toBe(false);
	});
});

describe("uploadSingleClass", () => {
	test("executes", async () => {
		const querier = (sql, binds) => {
			return {
				rowCount: 1,
				rows: [{ id: 1 }],
			};
		};
		const result = await classCreate.uploadSingleClass(querier, 1, 123, mockClasses[0]);
		expect(result).toEqual({ id: 1 });
	});

	test("error", async () => {
		const querier = (sql, binds) => {
			throw new Error("violates unique constraint");
		};
		const result = await classCreate.uploadSingleClass(querier, 1, 123, mockClasses[0]);
		expect(result).toEqual({ error: "a class with that name already exists" });
	});
});

describe("uploadClassesOneAtATime", () => {
	test("executes", async () => {
		const querier = (sql, binds) => {
			return {
				rowCount: 1,
				rows: [{ id: 1 }],
			};
		};
		const result = await classCreate.uploadClassesOneAtATime(querier, 1, 123, mockClasses);
		expect(result).toEqual({ errors: [], successfullyLoadedIndexes: [0, 1, 2] });
	});

	test("error", async () => {
		const querier = (sql, binds) => {
			throw new Error("violates unique constraint");
		};
		const result = await classCreate.uploadClassesOneAtATime(querier, 1, 123, mockClasses);
		expect(result).toEqual({
			errors: [
				{ index: 0, message: "a class with that name already exists" },
				{ index: 1, message: "a class with that name already exists" },
				{ index: 2, message: "a class with that name already exists" },
			],
			successfullyLoadedIndexes: [],
		});
	});
});

describe("classCreate", () => {
	test("executes", async () => {
		const querier = (sql, binds) => {
			return {
				rowCount: 1,
				rows: [{ id: 1 }],
			};
		};
		const result = await classCreate.classCreate(querier, 1, 123, mockClasses);
		expect(result).toEqual({ errors: [], successfullyLoadedIndexes: [0, 1, 2] });
	});

	test("error", async () => {
		const querier = async (sql, binds) => {
			return { rowCount: 0 };
		};
		let error = null;
		let result = null;
		try {
			const result = await classCreate.classCreate(querier, 1, 123, mockClasses);
		} catch (e) {
			error = e.Error;
		}
		expect(error).not.toBeNull();
		expect(result).toBeNull();
	});

	test("When only few classes are created", async () => {
		const querier = (sql, binds) => {
			return {
				rowCount: 1,
				rows: [{ id: 1 }],
			};
		};
		mockClasses[0].number_of_students = -1;
		const result = await classCreate.classCreate(querier, 1, 123, mockClasses);
		expect(result).toEqual({
			errors: [{ index: 0, message: "number of students must be positive" }],
			successfullyLoadedIndexes: [1, 2],
		});
	});

	test("When no class is inserted", async () => {
		const querier = (sql, binds) => {
			return {
				rowCount: 1,
				rows: [{ id: 1 }],
			};
		};
		mockClasses[0].number_of_students = -1;
		mockClasses[1].number_of_students = -1;
		mockClasses[2].number_of_students = -1;
		const result = await classCreate.classCreate(querier, 1, 123, mockClasses);
		expect(result).toEqual({
			errors: [
				{ index: 0, message: "number of students must be positive" },
				{ index: 1, message: "number of students must be positive" },
				{ index: 2, message: "number of students must be positive" },
			],
			successfullyLoadedIndexes: [],
		});
	});

	test("Creating classes using uploadClassesOneAtATime", async () => {
		const querier = (sql, binds) => {
			if (sql.indexOf("INSERT INTO") !== -1) {
				throw new Error("violates unique constraint");
			}
			if (sql.indexOf("SELECT") !== -1) {
				return {
					rowCount: 1,
					rows: [{ id: 1 }],
				};
			}
		};
		const result = await classCreate.classCreate(querier, 1, 123, mockClasses);
		expect(result).toEqual({
			errors: [
				{ index: 0, message: "a class with that name already exists" },
				{ index: 1, message: "a class with that name already exists" },
				{ index: 2, message: "a class with that name already exists" },
			],
			successfullyLoadedIndexes: [],
		});
	});
});
