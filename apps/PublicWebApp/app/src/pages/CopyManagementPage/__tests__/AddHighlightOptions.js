import theme from "../../../common/theme";
import AddHighlightOptionRaw from "../AddHighlightOptions";

let dataOptions = [];

function resetAll() {
	dataOptions = [
		{ key: "#option1", text: "Yellow", value: theme.colours.noteYellow, toolTip: "Highlight content in yellow", colour: theme.colours.noteYellow },
		{ key: "#option2", text: "Green", value: theme.colours.noteGreen, toolTip: "Highlight content in green", colour: theme.colours.noteGreen },
		{ key: "#option3", text: "Pink", value: theme.colours.notePink, toolTip: "Highlight content in pink", colour: theme.colours.notePink },
		{ key: "#option4", text: "Blue", value: theme.colours.noteBlue, toolTip: "Highlight content in blue", colour: theme.colours.noteBlue },
		{ key: "#option5", text: "Delete", value: "Delete", toolTip: "Remove highlighting", icon: "far fa-eraser" },
	];
}

beforeEach(resetAll);
afterEach(resetAll);

/** function return correctly */
test("Return Array with Text, Value & Colour ", async () => {
	const item = dataOptions;
	expect(item[0].text).toEqual("Yellow");
	expect(item[1].text).toEqual("Green");
	expect(item[4].icon).toEqual("far fa-eraser");
});
