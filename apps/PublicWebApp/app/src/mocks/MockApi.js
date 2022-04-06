import MockWorks from "./MockWorks";
import MockResults, { MockPaginatedResults, Mockfilters, MockcopiesData } from "./MockSearchResults";
import MockCourses from "./MockCourses";

/**
 * Simulates {@link api} for testing purposes
 * @param {string} a API endpoint
 * @param {any} b Supplied data, usually an object
 */
export default function MockApi(a, b) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			switch (a) {
				/**
				 * SEARCH CONTROLLER
				 */
				case "/search/search": {
					if (b.limit === 2) {
						resolve(MockPaginatedResults);
					} else {
						resolve(MockResults);
					}
					break;
				}

				/**
				 * PUBLIC WEB APP CONTROLLER
				 */
				case "/public/asset-get-one": {
					const result = MockWorks.find((item) => item.isbn13 == b.isbn13) || null;
					resolve({ result: result });
					break;
				}

				case "/public/get-extract-limits": {
					const result = MockWorks.find((item) => item.isbn13 == b.isbn13) || null;
					resolve({ result: result });
					break;
				}

				case "/public/unlock": {
					if (b.isbn13 === "reject") {
						reject("Error");
					}
					const work = MockWorks.find((item) => item.isbn13 == b.isbn13) || null;
					let result;
					if (work === null) {
						result = { message: "Asset not found" };
					} else if (work.is_unlocked === false) {
						result = { message: "success" };
					} else if (work.is_unlocked === true) {
						// result = {message: 'This title is already unlocked'}
						reject("Asset already unlocked");
					}
					resolve({ results: result });
					break;
				}

				case "/public/course-get-all-for-school": {
					resolve({ result: MockCourses });
					break;
				}

				case "/public/course-get-one": {
					let result = MockCourses.find((item) => parseInt(item.oid) === parseInt(b.oid)) || null;
					resolve({ result: result });
					break;
				}

				case "/public/course-create": {
					if (typeof b === "object" && b.title && b.year_group && b.identifier) {
						resolve(b);
					} else {
						reject("Invalid format submitted");
					}
					break;
				}

				case "/public/course-edit": {
					if (typeof b === "object" && b.oid) {
						resolve({ result: { edited: true, oid: b.oid } });
					} else {
						reject("Invalid format submitted");
					}
					break;
				}

				case "/public/course-delete": {
					if (typeof b === "object" && b.oid) {
						resolve({ result: { deleted: true, oid: b.oid } });
					} else {
						reject("Invalid format submitted");
					}
					break;
				}

				case "/search/get-filters": {
					resolve(Mockfilters);
					break;
				}

				case "/public/extract-search": {
					resolve({
						extracts: MockcopiesData.extracts,
						unfiltered_count: MockcopiesData.unfilteredCount,
						academic_year_end: MockcopiesData.academic_year_end,
					});
					break;
				}

				case "/public/extract-get-filters": {
					resolve(MockcopiesData.filter_data);
					break;
				}

				case "/public/course-get-one-for-school": {
					resolve(MockcopiesData.course_oid);
					break;
				}

				/**
				 * DEFAULT
				 */
				default: {
					reject("Invalid API call");
				}
			}
		}, 20);
	});
}
