import fs from "fs";
import path from "path";
import dotenv from "dotenv";

export const getDotEnvFilePath = (startDir: string) => {
	let curr = startDir;
	while (curr) {
		const p = path.join(curr, ".env");
		const exists = fs.existsSync(p);
		if (exists) {
			return p;
		}
		if (curr === "/") {
			break;
		}
		curr = path.dirname(curr);
	}
	return null;
};

export const loadEnvVars = (startDir: string) => {
	const dotEnvPath = getDotEnvFilePath(startDir);
	if (!dotEnvPath) {
		return;
	}
	const result = dotenv.config({
		path: dotEnvPath,
	});
	if (!result) {
		return;
	}
	Object.assign(process.env, result.parsed);
};
