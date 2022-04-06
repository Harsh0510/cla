import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import withAdminAuthRequiredConsumer from "../../common/withAdminAuthRequiredConsumer";
import Header from "../../widgets/Header";
import Upload from "./Upload";
import Search from "./Search";
import SearchResults from "./SearchResults";
import UsageForm from "./UsageForm";

export default withAdminAuthRequiredConsumer(
	{ "school-admin": true, teacher: true },
	class AssetUploadPage extends React.PureComponent {
		render() {
			return (
				<>
					<Header />
					<Switch>
						<Route path="/asset-upload" exact={true}>
							<Redirect to="/asset-upload/before-we-start" />
						</Route>
						<Route path="/asset-upload/before-we-start" exact={true} component={Search} />
						<Route path="/asset-upload/search" exact={true} component={SearchResults} />
						<Route path="/asset-upload/upload-content" exact={true} component={Upload} />
						<Route path="/asset-upload/copy-confirm" exact={true} component={UsageForm} />
						<Route>
							<Redirect to="/not-found" />
						</Route>
					</Switch>
				</>
			);
		}
	}
);
