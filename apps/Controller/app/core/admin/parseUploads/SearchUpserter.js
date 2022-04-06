module.exports = class {
	setUpsertEndpoint(endpoint) {
		this.endpoint = endpoint;
	}

	setAxios(axios) {
		this.axios = axios;
	}

	async upsert(product, assetId, active) {
		if (typeof active === "undefined") {
			active = true;
		}
		return await this.axios.post(
			this.endpoint,
			{
				data: product,
				assetId: assetId,
				active: active,
			},
			{
				headers: {
					"X-CSRF": "y",
				},
			}
		);
	}
};
