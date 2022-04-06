import fs from "fs";
import path from "path";

const loadFiles = (dirPath: string, matcher: RegExp, into: string[]) => {
	const files = fs.readdirSync(dirPath);
	for (const file of files) {
		const absolutePath = path.join(dirPath, file);
		const st = fs.statSync(absolutePath);
		if (st.isDirectory()) {
			loadFiles(absolutePath, matcher, into);
		} else if (st.isFile() && file.match(matcher)) {
			into.push(absolutePath);
		}
	}
};

const getFiles = (dirPath: string, matcher: RegExp) => {
	const ret: string[] = [];
	loadFiles(dirPath, matcher, ret);
	return ret;
};

const re = /^crontab-(15min|hourly|daily|weekly|monthly)\.sh$/;

const baseDir = "/app/src/cronScripts";

const crons = getFiles(baseDir, re);

for (const cron of crons) {
	const match = path.basename(cron).match(re);
	if (!match) {
		continue;
	}
	const rel = path.relative(baseDir, cron);
	const dest = "/etc/periodic/" + match[1] + "/" + rel.replace(/[^a-zA-Z0-9_-]/g, "__");
	fs.copyFileSync(cron, dest);
}
