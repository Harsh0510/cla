module.exports = connectionString => {
	const parts = connectionString.split(/;/g);
	const ret = Object.create(null);
	for (const part of parts) {
		const eq = part.split('=');
		const key = eq.shift();
		ret[key] = eq.join('=');
	}
	ret.ConnectionString = connectionString;
	ret.BlobAccountUrl = ret.DefaultEndpointsProtocol + '://' + ret.AccountName + '.blob.' + ret.EndpointSuffix;
	ret.FileAccountUrl = ret.DefaultEndpointsProtocol + '://' + ret.AccountName + '.file.' + ret.EndpointSuffix;
	return ret;
};
