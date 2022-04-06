import React from "react";
import apiBaseOrigin from "../../common/apiBaseOrigin";
import ProminentIconButton from "./index";

const hwbLoginUrl = apiBaseOrigin + "/auth/oauth/hwb/login";

const HwbButton = () => (
	<ProminentIconButton
		href={hwbLoginUrl}
		image={require("../../assets/images/hwb-logo.svg")}
		verticalOffset="3px"
		tooltip="Hwb is the digital Platform for learning and teaching in Wales."
	>
		Sign in with Hwb
	</ProminentIconButton>
);

export default HwbButton;
