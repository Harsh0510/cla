import React from "react";
import WhiteOutContext from "./WhiteOutContext";

export default function (WrappedComponent) {
	return function withWhiteOutConsumer(props) {
		return (
			<WhiteOutContext.Consumer>
				{(value) => <WrappedComponent whiteOut_updateBoundingBox={value.updateBoundingBox} {...props} />}
			</WhiteOutContext.Consumer>
		);
	};
}

// export const withWhiteOutConsumer = WrappedComponent => {
// 	return props => {
// 		return (
// 			<WhiteOutContext.Consumer>
// 				{value => {
// 					return (
// 						<WrappedComponent
// 							whiteOut_updateBoundingBox={value.updateBoundingBox}
// 							{...props}
// 						/>
// 					);
// 				}}
// 			</WhiteOutContext.Consumer>
// 		);
// 	};
// };
