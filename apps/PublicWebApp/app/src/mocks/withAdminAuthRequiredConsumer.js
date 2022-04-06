import React from "react";

export default function (WrappedComponent) {
	return function WithAdminAuthRequiredConsumer(props) {
		return <WrappedComponent {...props} />;
	};
}
