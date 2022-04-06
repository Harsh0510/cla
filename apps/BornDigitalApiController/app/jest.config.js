module.exports = {
	preset: "ts-jest",
	collectCoverage: true,
	collectCoverageFrom: ["src/**/*.ts"],
	transform: {
		"^.+\\.(ts|tsx)?$": "ts-jest",
	},
};
