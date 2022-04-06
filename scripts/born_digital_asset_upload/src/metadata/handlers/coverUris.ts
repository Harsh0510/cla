import { URL } from "url";

import TJsonValue from "../../TJsonValue";
import XmlNode from "../XmlNode";

function guessDimensionFromUri(uri: string) {
	let u;
	try {
		u = new URL(uri);
	} catch (e) {
		return 7;
	}
	u = u.pathname + u.search;
	if (u.match(/large|big/i)) {
		return 10;
	}
	if (u.match(/small|tiny/i)) {
		return 4;
	}
	return 7;
}

export default function (product: Record<string, TJsonValue>, productNode: XmlNode) {
	// Get all the potential cover URI resources
	const potentialResources = productNode.query(`
		> CollateralDetail
		> SupportingResource:has(
			> ResourceContentType:equals(01)
		)
		> ResourceVersion:has(
			> ResourceForm:equals(02)
		):has(
			> ResourceLink:not(:empty)
		)
	`);

	const coverResources = potentialResources
		.map((resourceNode) => {
			// The width node (if given)
			const widthNode = resourceNode.queryOne(`
				> ResourceVersionFeature:has(
					> ResourceVersionFeatureType:equals(03)
				) > FeatureValue:not(:empty)
			`);

			// The height node (if given)
			const heightNode = resourceNode.queryOne(`
				> ResourceVersionFeature:has(
					> ResourceVersionFeatureType:equals(02)
				) > FeatureValue:not(:empty)
			`);

			const linkNode = resourceNode.queryOne(`
				> ResourceLink
			`);

			const uri = (linkNode?.getInnerText() || "").trim();

			let width;
			if (widthNode) {
				width = parseInt(widthNode.getInnerText() || "", 10);
			} else {
				width = guessDimensionFromUri(uri);
			}

			let height;
			if (heightNode) {
				height = parseInt(heightNode.getInnerText() || "", 10);
			} else {
				height = guessDimensionFromUri(uri);
			}
			return {
				width: width,
				height: height,
				uri: uri,
			};
		})
		.sort((resource1, resource2) => {
			// Sort the resources so the resource with the largest area comes first
			const area1 = resource1.width * resource1.height;
			const area2 = resource2.width * resource2.height;
			return area1 > area2 ? -1 : area1 < area2 ? 1 : 0;
		})
		.map((resource) => resource.uri);

	product["coverUris"] = coverResources;
}
