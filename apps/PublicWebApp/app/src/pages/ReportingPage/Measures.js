import React from "react";
import styled from "styled-components";
import { Container } from "../../widgets/Layout/Container";
import { Row } from "../../widgets/Layout/Row";
import { col12, colSm4 } from "../../common/style";
import theme from "../../common/theme";

const Section = styled.div`
	${col12}
	${colSm4}
	padding-left: 0;
	padding-right: 0;
	margin-bottom: 20px;
`;

const Count = styled.div`
	font-size: 32px;
	font-weight: bold;
`;

const Icon = styled.i`
	cursor: pointer;
`;

const PageWrap = styled(Container)`
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		margin-top: 20px;
	}
`;

export default class Measures extends React.PureComponent {
	render() {
		const { unlockedTitles, copiedTitles, copiesTotal, studentViews } = this.props;
		return (
			<>
				<PageWrap>
					<div>
						<Row>
							<Section>
								<Count>{unlockedTitles}</Count>
								Unlocked titles{" "}
								<Icon
									className="far fa-question-circle"
									title="Total number of content items currently unlocked for your institution, including any temporary unlocked titles."
								/>
								<br />
								<em>Current total</em>
							</Section>
						</Row>
						<Row>
							<Section>
								<Count>{copiedTitles}</Count>
								Copied titles{" "}
								<Icon
									className="far fa-question-circle"
									title="Total number of unlocked titles with one or more copies created (as new, reinstated or cloned) during the current academic year."
								/>
								<br />
								<em>Current academic year</em>
							</Section>
							<Section>
								<Count>{copiesTotal}</Count>
								Copies{" "}
								<Icon
									className="far fa-question-circle"
									title="Total number of copies created (as new, reinstated or cloned) during the current academic year."
								/>
								<br />
								<em>Current academic year</em>
							</Section>
							<Section>
								<Count>{studentViews}</Count>
								Student views{" "}
								<Icon className="far fa-question-circle" title="Total number of views on copy share links during the current academic year." />
								<br />
								<em>Current academic year</em>
							</Section>
						</Row>
					</div>
				</PageWrap>
			</>
		);
	}
}
