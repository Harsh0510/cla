import React from "react";
import EventEmitterContext from "./EventEmitterContext";

export default class EventEmitterProvider extends React.PureComponent {
	subscriptions = new WeakMap();

	emit = (event, ...args) => {
		const listeners = this.subscriptions.get(event);
		if (listeners) {
			for (const listener of listeners) {
				listener(...args);
			}
		}
	};

	onEvent = (event, callback) => {
		let listeners = this.subscriptions.get(event);
		if (!listeners) {
			listeners = new Set();
			this.subscriptions.set(event, listeners);
		}
		listeners.add(callback);
	};

	offEvent = (event, callback) => {
		let listeners = this.subscriptions.get(event);
		if (listeners) {
			listeners.delete(callback);
			if (listeners.size == 0) {
				this.subscriptions.delete(event);
			}
		}
	};

	value = {
		emit: this.emit,
		on: this.onEvent,
		off: this.offEvent,
	};

	render() {
		return <EventEmitterContext.Provider children={this.props.children} value={this.value} />;
	}
}
