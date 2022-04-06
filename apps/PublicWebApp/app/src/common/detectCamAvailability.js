navigator.getMedia =
	navigator.getUserMedia || // use the proper vendor prefix
	navigator.webkitGetUserMedia ||
	navigator.mozGetUserMedia ||
	navigator.msGetUserMedia;
export default function (cb) {
	navigator.getMedia(
		{ video: true },
		function (stream) {
			if (typeof stream.stop === "function") {
				stream.stop();
			} else {
				stream.getTracks().forEach((trk) => trk.stop());
			}
			cb(true);
		},
		function () {
			cb(false);
		}
	);
}
