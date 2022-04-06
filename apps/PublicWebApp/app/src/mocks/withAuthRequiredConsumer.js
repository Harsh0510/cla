import React from "react";

export default function (WrappedComponent) {
	return function WithAuthRequiredConsumer(props) {
		return <WrappedComponent {...props} />;
	};
}
