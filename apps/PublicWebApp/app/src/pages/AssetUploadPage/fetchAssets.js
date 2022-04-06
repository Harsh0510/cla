import api from "../../common/api";

export default async (query) => {
	const result = await api("/search/external-assets", { query: query.toString() });
	return result.results;
};
