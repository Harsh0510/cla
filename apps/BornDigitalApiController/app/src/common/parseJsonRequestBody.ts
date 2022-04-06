import JsonBigNative from "./JsonBigNative";
import TJsonValue from "./TJsonValue";

export default (body?: string | null | undefined) => {
	if (!body) {
		return {};
	}
	try {
		return JsonBigNative.parse(body);
	} catch (e) {
		(e as Record<string, TJsonValue>)["status"] = 400;
		(e as Record<string, TJsonValue>)["expose"] = true;
		throw e;
	}
};
