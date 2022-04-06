import "../../mocks/formDataMock.mock";
import CustomFormData from "./../CustomFormData";

/** function renders correctly */
test("function renders correctly", async () => {
	const html = '<div><input type="text" value="abc"></div>';
	const item = CustomFormData(html);
	const result = typeof item === "object" ? true : false;
	expect(result).toBe(true);
});
