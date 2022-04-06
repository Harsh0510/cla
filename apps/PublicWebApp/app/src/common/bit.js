const MAX_BITS = 31;

export const isset = (value, idx) => (value & (1 << idx)) > 0;
export const set = (value, idx) => (value = value | (1 << idx));
export const getFirstNotSet = (value) => {
	if (value <= 0) {
		return 0;
	}
	for (let i = 0; i < MAX_BITS; ++i) {
		if (!isset(value, i)) {
			return i;
		}
	}
	return MAX_BITS + 1;
};
