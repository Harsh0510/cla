import detectCamAvailability from "../../common/detectCamAvailability";
let cbFunctionResult;
const { navigator } = window;
/**
 * Reset function
 */
function resetAll() {
	cbFunctionResult = false;
}

function mockFunction(result) {
	cbFunctionResult = result;
}

const successCallBack = jest.fn();
const failureCallBack = jest.fn();
const stream = {
	getTracks: () => {
		return [{ stop: jest.fn() }];
	},
};

beforeEach(resetAll);
afterEach(resetAll);

test("Function working correctly", async () => {
	window.navigator.getMedia = (media, successCallBack, failureCallBack) => {
		if (media.video) {
			successCallBack(stream);
		} else {
			failureCallBack(true);
		}
	};
	detectCamAvailability(successCallBack);
	expect(successCallBack).toHaveBeenCalled();
});

test("Function working correctly", async () => {
	window.navigator.getMedia = (media, successCallBack, failureCallBack) => {
		if (media.video) {
			failureCallBack(false);
		} else {
			() => {};
		}
	};

	detectCamAvailability(failureCallBack);
	expect(failureCallBack).toHaveBeenCalled();
});
