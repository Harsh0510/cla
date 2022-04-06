import "../../mocks/MockNavigator";
import CustomNavigator from "./../CustomNavigator";

/** Component renders correctly */
test("Component renders correctly", async () => {
	const item = CustomNavigator();
	const result = typeof item === "object" ? true : false;
	expect(result).toBe(true);
});
