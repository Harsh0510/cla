import React from "react";
import theme from "./theme";

const desktop = window.matchMedia(`(min-width: ${theme.breakpoints.desktop})`);
const tablet = window.matchMedia(`(min-width: ${parseInt(theme.breakpoints.tablet, 10) + 1 + "px"}) and (max-width: ${theme.breakpoints.desktop})`);
const mobile = window.matchMedia(
	`(min-width: ${parseInt(theme.breakpoints.mobileSmall, 10) + 1 + "px"}) and (max-width: ${theme.breakpoints.tablet})`
);
const tinyMobile = window.matchMedia(`(max-width: ${theme.breakpoints.mobileSmall})`);

const desktopBreak = 30;
const tabletBreak = 20;
const mobileBreak = 10;
const tinyMobileBreak = 5;

const withPageSize = function (WrappedComponent) {
	return class WithPageSize extends React.PureComponent {
		state = {
			breakpoint: 0,
		};

		componentDidMount() {
			this.isDesktop(desktop);
			this.isTablet(tablet);
			this.isMobile(mobile);
			this.isTinyMobile(tinyMobile);

			desktop.addListener(this.isDesktop);
			tablet.addListener(this.isTablet);
			mobile.addListener(this.isMobile);
			tinyMobile.addListener(this.isTinyMobile);
		}

		componentWillUnmount() {
			tinyMobile.removeListener(this.isTinyMobile);
			mobile.removeListener(this.isMobile);
			tablet.removeListener(this.isTablet);
			desktop.removeListener(this.isDesktop);
		}

		isDesktop = (e) => {
			if (e.matches) {
				this.setState({ breakpoint: desktopBreak });
			}
		};

		isTablet = (e) => {
			if (e.matches) {
				this.setState({ breakpoint: tabletBreak });
			}
		};

		isMobile = (e) => {
			if (e.matches) {
				this.setState({ breakpoint: mobileBreak });
			}
		};

		isTinyMobile = (e) => {
			if (e.matches) {
				this.setState({ breakpoint: tinyMobileBreak });
			}
		};

		render() {
			return <WrappedComponent breakpoint={this.state.breakpoint} {...this.props} />;
		}
	};
};

Object.defineProperty(withPageSize, "DESKTOP", {
	value: desktopBreak,
	writable: false,
	configurable: false,
});
Object.defineProperty(withPageSize, "TABLET", {
	value: tabletBreak,
	writable: false,
	configurable: false,
});
Object.defineProperty(withPageSize, "MOBILE", {
	value: mobileBreak,
	writable: false,
	configurable: false,
});
Object.defineProperty(withPageSize, "TINY_MOBILE", {
	value: tinyMobileBreak,
	writable: false,
	configurable: false,
});

export default withPageSize;
