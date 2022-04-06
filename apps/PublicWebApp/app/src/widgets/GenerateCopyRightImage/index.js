function getLines(ctx, text, maxWidth) {
	let words = text.split(" ");
	let lines = [];
	let currentLine = words[0];

	for (let i = 1, len = words.length; i < len; i++) {
		let word = words[i];
		let width = ctx.measureText(currentLine + " " + word).width;
		if (width < maxWidth) {
			currentLine += " " + word;
		} else {
			lines.push(currentLine);
			currentLine = word;
		}
	}
	lines.push(currentLine);
	return lines;
}

const GenerateCopyRightImage = (data) => {
	let canvasEl = document.getElementById("canvas");
	if (!canvasEl) {
		canvasEl = document.createElement("canvas");
		canvasEl.setAttribute("id", "canvas");
		canvasEl.setAttribute("width", "1200");
		canvasEl.setAttribute("height", "120");
		canvasEl.classList.add("cla-hidden");

		//append method not working in IE
		document.body.appendChild(canvasEl);
	}

	const FONT_SIZE = 16;

	let ctx = canvasEl.getContext("2d");
	ctx.font = `${FONT_SIZE}px 'Elliot Sans', sans-serif`;
	ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
	ctx.lineWidth = 2;
	ctx.textAlign = "right";
	ctx.miterLimit = 2;
	ctx.fillStyle = "black";

	const lines = getLines(ctx, data.toString(), 1180).reverse();

	let verticalPosition = 118;

	for (const line of lines) {
		ctx.strokeText(line, 1190, verticalPosition);
		ctx.fillText(line, 1190, verticalPosition);
		verticalPosition -= FONT_SIZE + 2;
	}

	const url = canvasEl.toDataURL();
	return url;
};

export default GenerateCopyRightImage;
