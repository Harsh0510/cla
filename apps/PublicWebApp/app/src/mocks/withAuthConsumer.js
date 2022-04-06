import React from "react";

export default function (WrappedComponent) {
	return function WithAuthConsumer(props) {
		return <WrappedComponent {...props} />;
	};
}
