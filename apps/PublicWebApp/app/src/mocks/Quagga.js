const Quagga = {
	init(settings, callback) {
		callback();
	},

	start() {},

	stop() {},

	onDetected(callback) {
		let result = {
			codeResult: {
				// code: '4871836482365' // Unlocked
				code: "9870836489178", // Locked
			},
		};
		setTimeout(() => {
			callback(result);
		}, 1500);
	},

	offDetected(callback) {},
};

export const QuaggaUnlocked = Object.assign(
	{
		init(settings, callback) {
			callback("Error");
		},
	},
	Quagga
);

export default Quagga;
