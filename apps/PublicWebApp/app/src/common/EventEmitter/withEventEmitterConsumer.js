import React from "react";
import EventEmitterContext from "./EventEmitterContext";

export default function (WrappedComponent) {
	return function WithEventEmitterConsumer(props) {
		return (
			<EventEmitterContext.Consumer>
				{(value) => <WrappedComponent eventEmitter_emit={value.emit} eventEmitter_off={value.off} eventEmitter_on={value.on} {...props} />}
			</EventEmitterContext.Consumer>
		);
	};
}
