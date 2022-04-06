import React from "react";
import styled, { css } from "styled-components";
import theme from "../../common/theme";
import withAuthConsumer from "../../common/withAuthConsumer";
import withApiConsumer from "../../common/withApiConsumer";
import UserAssetAccessMessage from "../../widgets/UserAssetAccessMessage";
import { noGuttersMargin } from "../../common/style";
import { Row } from "../../widgets/Layout/Row";
import { ColExtraSmallWithNoGutters } from "../../widgets/Layout/ColExtraSmallWithNoGutters";

const LockBook = styled.div`
	padding-left: 50px;
	max-width: 100%;
	display: flex;
	align-items: center;
	position: relative;

	@media screen and (max-width: ${theme.breakpoints.desktopSmall}) {
		max-width: 100%;
	}
	@media screen and (max-width: ${theme.breakpoints.mobileLarge}) {
		max-width: 350px;
	}
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		max-width: 100%;
	}
	.lock_unlock_book {
		position: absolute;
		top: 0;
		left: 0;
	}
`;

const MobRow = styled(Row)`
	flex-wrap: nowrap;
	${noGuttersMargin}
`;

const MobTextIconWrap = styled.div`
	display: flex;
	align-items: center;
	justify-content: flex-start;
	padding: 0.5em 1em;
`;

const IconText = styled.div`
	font-size: 14px;
	padding-left: 1em;
	line-height: 1;
`;

const WrapUserAssetAccessMessage = styled.div`
	font-size: 14px;
`;

const LockBookIcon = styled.i`
	font-size: 2.375em;
	@media screen and (max-width: ${theme.breakpoints.mobileSmall}) {
		font-size: 2.1875em;
	}
`;

export default withApiConsumer(
	withAuthConsumer(
		class AssetMessageAccess extends React.PureComponent {
			render() {
				const { isMobile = false } = this.props;

				if (isMobile) {
					return (
						<MobRow>
							<ColExtraSmallWithNoGutters>
								<MobTextIconWrap>
									<LockBookIcon className="far fa-unlock-alt"></LockBookIcon>
									<IconText>
										<UserAssetAccessMessage />
									</IconText>
								</MobTextIconWrap>
							</ColExtraSmallWithNoGutters>
						</MobRow>
					);
				} else {
					return (
						<LockBook>
							<i className="far fa-unlock-alt h1 lock_unlock_book"></i>
							<WrapUserAssetAccessMessage>
								<UserAssetAccessMessage />
							</WrapUserAssetAccessMessage>
						</LockBook>
					);
				}
			}
		}
	)
);
