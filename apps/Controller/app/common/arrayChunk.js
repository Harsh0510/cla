module.exports = (arr, chunkSize) => {
	const chunked = [];
	for (let i = 0, len = arr.length; i < len; i += chunkSize) {
		let max = Math.min(len, i + chunkSize);
		const chunk = [];
		for (let j = i; j < max; ++j) {
			chunk.push(arr[j]);
		}
		chunked.push(chunk);
	}
	return chunked;
};
