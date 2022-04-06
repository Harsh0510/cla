import React from "react";
import { shallow } from "enzyme";
import EventEmitterProvider from "../../EventEmitter/EventEmitterProvider";
let mockCalled, mockCallBackFunction;
/**
 * Reset function
 */
function resetAll() {
	mockCalled = [];
	mockCallBackFunction = (a, b, c) => {
		mockCalled.push(a, b, c);
	};
}
beforeEach(resetAll);
afterEach(resetAll);
/** wait function */
function wait(millis) {
	return new Promise((resolve, reject) => setTimeout(resolve, millis));
}
/** Component renders correctly */
test(`Component renders correctly`, async () => {
	const item = shallow(<EventEmitterProvider children={"test"} />);
	expect(item.props().children).toEqual("test");
});
test(`Executing onEvent with callback and emit`, async () => {
	const item = shallow(<EventEmitterProvider children={"test"} />);
	const key1 = {};
	item.instance().onEvent(key1, mockCallBackFunction);
	item.instance().emit(key1, 5, 6, 7);
	expect(mockCalled).toEqual([5, 6, 7]);
});
test(`Executing offEvent and emit`, async () => {
	const item = shallow(<EventEmitterProvider children={"test"} />);
	const key1 = {};
	item.instance().offEvent(key1, mockCallBackFunction);
	item.instance().emit(key1, 5, 6, 7);
	expect(mockCalled).toEqual([]);
});
test(`Executing onEvent with callback, emit and offEvent`, async () => {
	const item = shallow(<EventEmitterProvider children={"test"} />);
	const key1 = {};
	item.instance().onEvent(key1, mockCallBackFunction);
	item.instance().emit(key1, 5, 6, 7);
	item.instance().offEvent(key1, mockCallBackFunction);
	expect(mockCalled).toEqual([5, 6, 7]);
});
test(`Executing twice onEvent with callback`, async () => {
	const item = shallow(<EventEmitterProvider children={"test"} />);
	const key1 = {};
	item.instance().onEvent(key1, mockCallBackFunction);
	item.instance().onEvent(key1, mockCallBackFunction);
	expect(mockCalled).toEqual([]);
});
test(`Executing twice offEvent with callback twice with different callback`, async () => {
	const item = shallow(<EventEmitterProvider children={"test"} />);
	const cb = (a, b, c) => {
		mockCalled.push(a, b, c);
	};
	const cb2 = (a) => {
		mockCalled.push(a);
	};
	const key1 = {};
	item.instance().onEvent(key1, cb);
	item.instance().onEvent(key1, cb2);
	item.instance().offEvent(key1, cb);
	expect(mockCalled).toEqual([]);
});
