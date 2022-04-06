const getBlobProps = require("../../../core/admin/azure/getBlobProps");

test("no params", () => {
	expect(getBlobProps()).toBeUndefined();
});

test("just filepath", () => {
	expect(getBlobProps(null, "/foo/bar.txt")).toEqual({
		blobHTTPHeaders: {
			blobContentType: "text/plain",
		},
	});
});

test("cache control", () => {
	expect(
		getBlobProps({
			cacheControl: "foo",
		})
	).toEqual({
		blobHTTPHeaders: {
			blobCacheControl: "foo",
		},
	});
});

test("content type", () => {
	expect(
		getBlobProps({
			contentType: "text/plain",
		})
	).toEqual({
		blobHTTPHeaders: {
			blobContentType: "text/plain",
		},
	});
});

test("content type and cache control", () => {
	expect(
		getBlobProps({
			contentType: "text/plain",
			cacheControl: "foo",
		})
	).toEqual({
		blobHTTPHeaders: {
			blobCacheControl: "foo",
			blobContentType: "text/plain",
		},
	});
});

test("file path and cache control", () => {
	expect(getBlobProps({ cacheControl: "foo" }, "/path/to/foo.txt")).toEqual({
		blobHTTPHeaders: {
			blobCacheControl: "foo",
			blobContentType: "text/plain",
		},
	});
});
