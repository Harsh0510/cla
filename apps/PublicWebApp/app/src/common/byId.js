module.exports = (obj) => {
	const ret = Object.create(null);
	for (const o of obj) {
		ret[o.id] = o.name;
	}
	return ret;
};
