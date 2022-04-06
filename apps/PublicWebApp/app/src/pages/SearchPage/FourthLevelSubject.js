import React from "react";
import CheckBox from "./CheckBox";
import { withFlyoutManager } from "../../common/FlyoutManager";

export default withFlyoutManager(
	class FourthLevelSubject extends React.PureComponent {
		state = {
			open: true,
			breakpoint: null,
		};

		doChange = (filterId, isChecked) => {
			const selected = [];

			// toggle checkbox normally
			selected.push({
				isChecked: isChecked,
				filterId: filterId,
				filterGroup: this.props.group,
			});

			this.props.selectFilter(selected);
			if (this.props.flyouts_getFirstUnseenIndex("search") === 5) {
				this.props.flyouts_setNext("search");
			}
		};

		render() {
			const { childSubject, selected, selectFilter, group, collapsed } = this.props;

			return (
				<CheckBox key={"FourLevelSubject" + childSubject.id} onChange={this.doChange} checked={selected} value={childSubject.id}>
					{childSubject.title} ({childSubject.count})
				</CheckBox>
			);
		}
	}
);
