import React, { Component } from "react";
import withAdminAuthRequiredConsumer from "../../common/withAdminAuthRequiredConsumer";
import withApiConsumer from "../../common/withApiConsumer";

// export default withAdminAuthRequiredConsumer(
// 	{ "cla-admin": true },
// 	withApiConsumer(
// 		class Student extends React.PureComponent {
// 			constructor(props) {
// 				super(props);
// 			}
// 			componentDidMount() {
// 				this.props
// 					.api(`/admin/student-create`, {
// 						first_name: "raja",
// 						last_name: "shah",
// 						enroll_number: "1234",
// 						email: "raj112@gmail.com",
// 						school_id: 51627,
// 						department: "abc",
// 						class: "class 2",
// 						city: "birmingham",
// 						mobile_number: "9988998899",
// 						address: "a",
// 					})
// 					.then((result) => {
// 						console.log(result);
// 					})
// 					.catch((error) => {
// 						console.log(error);
// 					});
// 			}
// 			render() {
// 				return <h2>task</h2>;
// 			}
// 		}
// 	)
// );

// export default withAdminAuthRequiredConsumer(
// 	{ "cla-admin": true },
// 	withApiConsumer(
// 		class Student extends React.PureComponent {
// 			constructor(props) {
// 				super(props);
// 			}
// 			componentDidMount() {
// 				this.props
// 					.api(`/admin/all-students-get`, { sort_direction: "D", sort_field: "id" })
// 					.then((result) => {
// 						console.log(result.data);
// 					})
// 					.catch((error) => {
// 						console.log(error);
// 					});
// 			}
// 			render() {
// 				return <h2>task</h2>;
// 			}
// 		}
// 	)
// );
export default withAdminAuthRequiredConsumer(
	{ "cla-admin": true },
	withApiConsumer(
		class Student extends React.PureComponent {
			constructor(props) {
				super(props);
			}
			componentDidMount() {
				this.props
					.api(`/admin/student-delete`, { id: 1 })
					.then((result) => {
						console.log(result);
					})
					.catch((error) => {
						console.log(error);
					});
			}
			render() {
				return <h2>task</h2>;
			}
		}
	)
);
