import React from "react";
import CheckBoxField from "../../widgets/CheckBoxField";
import {
	FormWrapAddEdit,
	FormBodyContainer,
	FormContainerFull,
	FormContainerHalf,
	FormTopCornerCancel,
	FormSectionTopRow,
	FormSectionHalf,
	FormInput,
} from "../../widgets/AdminStyleComponents";

export default class ProcessingLogDataShow extends React.PureComponent {
	render() {
		const { cancelAddEdit, fields } = this.props;

		return (
			<FormWrapAddEdit>
				<FormSectionTopRow>
					<FormSectionHalf></FormSectionHalf>
					<FormSectionHalf>
						<FormTopCornerCancel type="button" to="/" title="Return to Top" className="close_btn" onClick={cancelAddEdit}>
							Return to Top
							<i className="fa fa-times" size="sm" />
						</FormTopCornerCancel>
					</FormSectionHalf>
				</FormSectionTopRow>

				<FormBodyContainer>
					<FormContainerFull>
						<FormContainerHalf>
							<label htmlFor="id">ID: </label>
							<FormInput readOnly={true} type="number" name="id" value={fields.id || ""} />
						</FormContainerHalf>

						<FormContainerHalf>
							<label htmlFor="date_created">Date Created: </label>
							<FormInput readOnly={true} type="text" name="date_created" value={fields.date_created || ""} />
						</FormContainerHalf>
					</FormContainerFull>
					<FormContainerFull>
						<FormContainerHalf>
							<label htmlFor="stage">Stage: </label>
							<FormInput readOnly={true} type="text" name="stage" value={fields.stage || ""} />
						</FormContainerHalf>

						<FormContainerHalf>
							<label htmlFor="sub_stage">Sub Stage: </label>
							<FormInput readOnly={true} type="text" name="sub_stage" value={fields.sub_stage || ""} />
						</FormContainerHalf>
					</FormContainerFull>
					<FormContainerFull>
						<FormContainerHalf>
							<label htmlFor="asset_identifier">Asset Identifier: </label>
							<FormInput readOnly={true} type="text" name="asset_identifier" value={fields.asset_identifier || ""} />
						</FormContainerHalf>
					</FormContainerFull>
					<label htmlFor="content">Content: </label>
					<FormContainerFull>
						<textarea readOnly={true} id="content" name="content" rows="4" cols="140" value={fields.content || ""} />
					</FormContainerFull>
					<FormContainerFull>
						<FormContainerHalf>
							<CheckBoxField readOnly={true} name="success" title="Success" checked={fields.success} value={false} isValid={true} />
						</FormContainerHalf>
					</FormContainerFull>
				</FormBodyContainer>
			</FormWrapAddEdit>
		);
	}
}
