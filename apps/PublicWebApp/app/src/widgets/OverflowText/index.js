import React from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

const Wrapper = styled.div`
	position: relative;
	cursor: pointer;
`;

const Text = styled.div`
	width: calc(100% - 15px);
`;

const ChevronTag = styled.div`
	position: absolute;
	right: 0;
	top: 0;
`;

class OverflowText extends React.PureComponent {
	render() {
		const { children, limit, className, style, onClick, isShowFullText } = this.props;
		if (!children) {
			return null;
		}

		if (isShowFullText) {
			return (
				<Wrapper onClick={onClick}>
					<Text className={className} style={style} title={children}>
						{children}
					</Text>
					<ChevronTag>
						<FontAwesomeIcon icon={faChevronUp} />
					</ChevronTag>
				</Wrapper>
			);
		}

		if (!limit || children.length <= limit) {
			return <>{children}</>;
		}

		return (
			<Wrapper onClick={onClick}>
				<Text className={className} style={style} title={children}>
					{children.slice(0, limit)}...
				</Text>
				<ChevronTag>
					<FontAwesomeIcon icon={faChevronDown} />
				</ChevronTag>
			</Wrapper>
		);
	}
}

export default OverflowText;
