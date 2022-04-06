import execFile from "../execFile";

const ratioDiff = (a: number, b: number, offset = 1) => (Math.max(a, b) + offset) / (Math.min(a, b) + offset);

/**
 * Determine whether a PDF is color, greyscale, or monochrome (black and white) as follows:
 *
 * If the Cyan, Magenta and Yellow differ by more than 1% on any page, it's definitely color.
 * Else if there is at least one page where the total amount of CMYK on the page exceeds 10% then it's greyscale.
 * Else it's monochrome.
 */
export default async (
	ghostscriptBinaryPath: string,
	pdfFilePath: string,
	pageCount: number
): Promise<"color" | "greyscale" | "monochrome"> => {
	const [firstPage, lastPage] = (() => {
		if (pageCount <= 3) {
			return [1, pageCount];
		}
		if (pageCount <= 6) {
			return [2, pageCount - 1];
		}
		return [5, pageCount - 1];
	})();
	const stdout = await execFile(ghostscriptBinaryPath, [
		"-q",
		"-dFirstPage=" + firstPage,
		"-dLastPage=" + lastPage,
		"-o",
		"-",
		"-sDEVICE=inkcov",
		pdfFilePath,
	]);
	const text = stdout.toString();
	const lines = text.split(/\n+/g);
	const colors = [];
	for (const line of lines) {
		const match = line.match(
			/^\s*([0-9]+\.[0-9]+)\s+([0-9]+\.[0-9]+)\s+([0-9]+\.[0-9]+)\s+([0-9]+\.[0-9]+)\s+CMYK\s+OK\s*$/
		);
		if (!match) {
			continue;
		}
		colors.push({
			cyan: parseFloat(match[1] as string),
			magenta: parseFloat(match[2] as string),
			yellow: parseFloat(match[3] as string),
			black: parseFloat(match[4] as string),
		});
	}
	const isColor = colors.some(
		(color) =>
			ratioDiff(color.cyan, color.magenta, 0.1) > 1.01 ||
			ratioDiff(color.cyan, color.yellow, 0.1) > 1.01 ||
			ratioDiff(color.magenta, color.yellow, 0.1) > 1.01
	);
	if (isColor) {
		return "color";
	}
	const isGreyscale = colors.some((color) => color.cyan + color.magenta + color.yellow + color.black > 0.1);
	if (isGreyscale) {
		return "greyscale";
	}
	return "monochrome";
};
