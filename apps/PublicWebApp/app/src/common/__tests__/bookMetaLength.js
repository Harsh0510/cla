import bookMetaLength from "../bookMetaLength";

test("Number Of Objct to be exported", () => {
	expect(Object.keys(bookMetaLength).length).toBe(4);
});
