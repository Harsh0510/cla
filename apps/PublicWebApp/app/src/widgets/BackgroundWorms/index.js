import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import withPageSize from "../../common/withPageSize";

const Wrap = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: -1;
	overflow: hidden;

	@media print and (min-width: 480px) {
		display: none;
	}
`;

const WrapInner = styled.div`
	margin: 0 auto;
	max-width: ${theme.siteWidth + 100}px;
	position: relative;
`;

const Img = styled.img`
	display: block;
	position: absolute;
`;

const Img1 = styled(Img)`
	top: 82px;
	left: -512px;
`;

const Img2 = styled(Img)`
	top: 220px;
	right: -760px;
`;

const Img3 = styled(Img)`
	top: 0;
	right: -400px;
`;

export default withPageSize(function BackgroundWorms(p) {
	if (p.breakpoint < withPageSize.TABLET) {
		return <div />;
	}

	return (
		<Wrap>
			<WrapInner>
				{/* <Img3 src={require('./3b.png')} />
				<Img1 src={require('./1b.png')} />
				<Img2 src={require('./2b.png')} /> */}
			</WrapInner>
		</Wrap>
	);
});
