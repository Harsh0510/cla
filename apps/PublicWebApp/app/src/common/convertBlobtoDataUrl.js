function blobToDataURL(blob) {
	return new Promise((fulfill, reject) => {
		let reader = new FileReader();
		reader.onerror = reject;
		reader.onload = (e) => fulfill(reader.result);
		reader.readAsDataURL(blob);
	});
}

export default blobToDataURL;
