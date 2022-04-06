/**
 * getPostionInPercentage()
 * this wil set the left, top, width position based on wrap area
 * @param {*} left
 * @param {*} top
 * @param {*} width
 * @param {*} height
 * @param {*} totalWidth
 * @param {*} totalHeight
 */
export default function (left, top, width, height, totalWidth, totalHeight) {
	let cal_left = left;
	let cal_top = top;
	let cal_width = width;
	let cal_height = height;
	if (left < 0) {
		cal_left = 0;
	}

	if (top < 0) {
		cal_top = 0;
	}

	if (left < 0) {
		cal_left = 0;
	}
	if (top < 0) {
		cal_top = 0;
	}

	if (cal_left + width > totalWidth) {
		cal_left = totalWidth - width;
	}

	if (cal_top + height > totalHeight) {
		cal_top = totalHeight - height;
	}

	if (cal_width > totalWidth) {
		cal_width = totalWidth;
		cal_left = 0;
	}

	if (cal_height > totalHeight) {
		cal_height = totalHeight;
		cal_top = 0;
	}

	const per_left = Number.parseFloat(cal_left !== 0 && totalWidth != 0 ? (cal_left * 100) / totalWidth : 0);
	const per_top = Number.parseFloat(cal_top !== 0 && totalHeight != 0 ? (cal_top * 100) / totalHeight : 0);
	const per_width = Number.parseFloat(cal_width !== 0 && totalWidth != 0 ? (cal_width * 100) / totalWidth : 0);
	const per_height = Number.parseFloat(cal_height !== 0 && totalHeight != 0 ? (cal_height * 100) / totalHeight : 0);

	return {
		left: per_left,
		top: per_top,
		width: per_width,
		height: per_height,
	};
}
