import React from "react";
import { Link } from "react-router-dom";
import Header from "../../widgets/Header";
import PageWrap from "../../widgets/PageWrap";
import styled from "styled-components";
import theme from "../../common/theme";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";

const JUMP_TO_CONTENT_ID = "main-content";

const Wrap = styled(PageWrap)`
	text-align: center;
	justify-content: center;
`;

export default class NotFoundPage extends React.PureComponent {
	render() {
		return (
			<>
				<HeadTitle title={PageTitle.notFound} />
				<Header jumpToContentId={JUMP_TO_CONTENT_ID} />
				<Wrap padding={true} id={JUMP_TO_CONTENT_ID}>
					<div>
						<h2>Page not found</h2>
						<p>That page could not be found.</p>
						<p>
							Please <Link to="/">click here</Link> to return home.
						</p>
					</div>
				</Wrap>
			</>
		);
	}
}
