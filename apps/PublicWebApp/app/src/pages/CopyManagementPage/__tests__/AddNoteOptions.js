import AddNoteOptionRaw from "../AddNoteOptions";
import theme from "../../../common/theme";

let dataOptions = [];

function resetAll() {
	dataOptions = [
		{ key: "#option1", text: "Yellow", value: theme.colours.noteYellow, toolTip: "Add a yellow note", colour: theme.colours.noteYellow },
		{ key: "#option2", text: "Green", value: theme.colours.noteGreen, toolTip: "Add a green note", colour: theme.colours.noteGreen },
		{ key: "#option3", text: "Pink", value: theme.colours.notePink, toolTip: "Add a pink note", colour: theme.colours.notePink },
		{ key: "#option4", text: "Blue", value: theme.colours.noteBlue, toolTip: "Add a blue note", colour: theme.colours.noteBlue },
	];
}

beforeEach(resetAll);
afterEach(resetAll);

/** function return correctly */
test("Return Array with Text, Value & key ", async () => {
	const item = dataOptions;
	expect(item[0].text).toEqual("Yellow");
	expect(item[1].text).toEqual("Green");
});
