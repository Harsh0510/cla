import React from "react";
import MockApi from "./MockApi";

export default function (WrappedComponent) {
	return function WithApiConsumer(props) {
		return <WrappedComponent api={MockApi} {...props} />;
	};
}
