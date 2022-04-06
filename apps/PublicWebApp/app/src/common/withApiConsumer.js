import React from "react";
import ApiContext from "./ApiContext";

export default function (WrappedComponent) {
	return function WithApiConsumer(props) {
		return <ApiContext.Consumer>{(value) => <WrappedComponent api={value} {...props} />}</ApiContext.Consumer>;
	};
}
