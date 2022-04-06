let cache = Object.create(null);
let numKeysInCache = 0;

const MAX_KEYS = 100; // don't set this too high otherwise memory usage might climb too high
const TTL = 10000; // cache entries live for this many milliseconds before they expire and are refetched

export const clearAll = () => {
	cache = {};
	numKeysInCache = 0;
};

const DELETE_COUNT = Math.ceil(MAX_KEYS / 10);

/**
 * Create a cached version of the provided async function (i.e. function that
 * returns a promise).
 * If you use this to create a cached version of an API call, then the API call
 * should simply fetch data (e.g. fetch some assets) and not perform any
 * actions (e.g. creating a class or deleting a user).
 */
export const createCachedAsyncFn =
	(fn) =>
	async (...args) => {
		// NB: all arguments must be JSON stringifyable! So no RegExp or Date objects for example - just simple objects/arrays/strings etc.
		const key = JSON.stringify([...args]);
		let existing = cache[key];
		const now = Date.now();
		if (existing) {
			// already exists in cache...
			if (existing.end < now) {
				// ...but the cache entry has expired - refetch
				existing.end = now + TTL;
				existing.result = await fn(...args);
			}
			return existing.result;
		}
		// doesn't exist in cache - have to call function again
		if (numKeysInCache >= MAX_KEYS) {
			// we've exceeded the maximum number of keys - delete the first DELETE_COUNT keys to make room
			let i = 0;
			for (const key in cache) {
				delete cache[key];
				i++;
				if (i >= DELETE_COUNT) {
					break;
				}
			}
			numKeysInCache -= DELETE_COUNT;
		}
		existing = cache[key] = {
			end: now + TTL,
		};
		numKeysInCache++;
		existing.result = await fn(...args);
		return existing.result;
	};
