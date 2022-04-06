import path from "path";
import crypto from "crypto";
import os from "os";

import { Pool } from "pg";
import fs from "fs-extra";

import XmlParser from "./XmlParser";
import handlers from "./handlers";
import TJsonValue from "../TJsonValue";
import { exec, execAlwaysSucceed } from "../exec";
import productErrorCheck from "./productErrorCheck";

const getFilesRecursivelyInner = async (directory: string, into: string[]) => {
	const filesInDirectory = await fs.readdir(directory);
	for (const file of filesInDirectory) {
		const absolute = path.join(directory, file);
		const s = await fs.stat(absolute);
		if (s.isDirectory()) {
			await getFilesRecursivelyInner(absolute, into);
		} else {
			into.push(absolute);
		}
	}
};

const getFilesRecursively = async (directory: string) => {
	const ret: string[] = [];
	await getFilesRecursivelyInner(directory, ret);
	return ret;
};

export const downloadAndDiff = async (
	url: string,
	revisionOld: string | null | undefined,
	revisionNew: string,
	filter?: string | undefined
): Promise<{ rootOld: string | null; rootNew: string | null; diffs: [string | null, string][] }> => {
	const fileMatcher = filter ? new RegExp(filter) : null;
	const fileFilter = (f: string) => {
		if (!f.match(/\bXML\/[^/]+\.xml$/)) {
			return false;
		}
		if (fileMatcher) {
			return fileMatcher.test(f);
		}
		return true;
	};
	const rnd = crypto.randomBytes(16).toString("hex");
	const tmpBase = path.join(os.tmpdir(), "bdapi_gitdiff_" + rnd);
	if (!revisionOld) {
		await exec("git", ["clone", url, tmpBase]);
		await exec("git", ["checkout", revisionNew], { cwd: tmpBase });
		return {
			rootOld: null,
			rootNew: tmpBase,
			diffs: (await getFilesRecursively(tmpBase)).filter(fileFilter).map((p) => [null, p]),
		};
	}

	const tmpBaseOld = path.join(tmpBase, "git_old");
	const tmpBaseNew = path.join(tmpBase, "git_new");
	await fs.mkdirp(tmpBaseOld);
	await fs.mkdirp(tmpBaseNew);

	await exec("git", ["clone", url, tmpBaseOld]);
	await fs.copy(tmpBaseOld, tmpBaseNew);
	await exec("git", ["checkout", revisionOld], { cwd: tmpBaseOld });
	await exec("git", ["checkout", revisionNew], { cwd: tmpBaseNew });

	const result = await execAlwaysSucceed("diff", [
		"-rq",
		"--speed-large-files",
		"-x",
		".svn",
		"-x",
		".git",
		tmpBaseOld,
		tmpBaseNew,
	]);
	const lines = result.stdout.toString().trim().split(/[\n]+/g);
	const ret: [string | null, string][] = [];
	for (const line of lines) {
		{
			const matches = line.match(/^Files (.+?) and (.+?) differ$/);
			if (matches) {
				if (fileFilter(matches[2] as string)) {
					ret.push([matches[1] as string, matches[2] as string]);
				}
				continue;
			}
		}
		{
			const matches = line.match(/^Only in (.+?): (.+?)$/);
			if (matches) {
				const p = path.join(matches[1] as string, matches[2] as string);
				if (p.indexOf(tmpBaseNew) === 0) {
					if (fileFilter(p)) {
						ret.push([null, p]);
					}
				}
				continue;
			}
		}
		throw new Error("should never get here: " + line);
	}
	return {
		rootOld: tmpBaseOld,
		rootNew: tmpBaseNew,
		diffs: ret,
	};
};

export const parseXmlFile = async (
	fileReadableStream: fs.ReadStream
): Promise<{
	errors: { message: string; isbn?: string | null | undefined }[];
	products: Record<string, TJsonValue>[];
}> => {
	const root = await new XmlParser().parse(fileReadableStream);
	if (!root) {
		return {
			errors: [
				{
					isbn: null,
					message: "parse error",
				},
			],
			products: [],
		};
	}
	const allErrors: { message: string; isbn?: string | null | undefined }[] = [];
	const ret: Record<string, TJsonValue>[] = [];
	const allProductNodes = root.query(":root > Product");
	for (const productNode of allProductNodes) {
		const product: Record<string, TJsonValue> = Object.create(null);
		let didError = false;
		for (const handler of handlers) {
			try {
				handler(product, productNode);
			} catch (ee) {
				didError = true;
				const e: Error = ee as Error;
				let msg = "";
				if (handler.name) {
					msg = `Internal handler error with handler '` + handler.name + `': `;
				}
				if (product["isbn13"]) {
					msg += " [isbn13 = " + product["isbn13"] + "]";
				}
				if (product["pdfIsbn13"]) {
					msg += " [pdfIsbn13 = " + product["pdfIsbn13"] + "]";
				}
				msg += e.toString();
				if (e.stack && typeof e.stack === "string") {
					msg += " [" + e.stack + "]";
				}
				const isbn = product["pdfIsbn13"] || product["isbn13"] || product["issnId"];
				allErrors.push({
					message: msg,
					isbn: isbn as string,
				});
			}
		}
		if (!didError) {
			if (product["issnId"] && !product["isbn13"] && !product["pdfIsbn13"]) {
				product["pdfIsbn13"] = product["isbn13"] = product["issnId"];
			}
			const errors = productErrorCheck(product);
			for (const err of errors) {
				allErrors.push({
					message: err,
					isbn: product["pdfIsbn13"] as string,
				});
			}
			if (!errors.length) {
				ret.push(product);
			}
		}
	}
	return {
		errors: allErrors,
		products: ret,
	};
};

export const activateAssets = async (pool: Pool) => {
	await pool.query(`
		UPDATE
			asset
		SET
			active_born_digital = TRUE,
			page_count = asset_metadata.page_count,
			ocr = asset_metadata.ocr,
			color_scale = asset_metadata.color_scale

		FROM
			asset_metadata
		WHERE
			(
				asset.pdf_isbn13 = asset_metadata.isbn
				OR asset.isbn13 = asset_metadata.isbn
				OR asset.alternate_isbn13 = asset_metadata.isbn
			)
			AND asset.is_born_digital = TRUE
	`);
};
