const asyncQueueRaw = require("../../common/asyncQueue");
const Context = require("../common/Context");
let ctx;

function resetAll() {
	ctx = new Context();
}

beforeEach(resetAll);
afterEach(resetAll);

const task = async () => {
	return true;
};

test(`Pass the task in queue`, async () => {
	expect(await asyncQueueRaw.push(task)).toBe(undefined);
});
