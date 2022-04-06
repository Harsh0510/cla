import React from "react";
import Datepicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { subDays } from "date-fns";
import styled from "styled-components";
import theme from "../../common/theme";
import date from "../../common/date";

const WrapDatePicker = styled(Datepicker)`
	height: 38px;
	padding: 2px 8px;
	color: ${theme.colours.primary};
	border: 1px solid ${theme.colours.inputBorder};

	::placeholder {
		color: ${theme.colours.inputText};
		font-weight: 300;
	}
`;
class DateInputField extends React.PureComponent {
	handleDateChange = (value) => {
		this.props.onChange(date.getEncodedDate(value), this.props.name);
	};

	render() {
		const { placeholderText, showTimeSelect, isClearable, required, showPreviousDates, value, name, disabled } = this.props;
		let hiddenDates = !showPreviousDates ? new Date() : null;
		hiddenDates =
			this.props.disableUpcomingDates && this.props.disableUpcomingDates != 0
				? subDays(new Date(), -Math.abs(this.props.disableUpcomingDates))
				: hiddenDates;
		return (
			<div>
				<WrapDatePicker
					id={this.props.id}
					placeholderText={placeholderText}
					dateFormat="yyyy-MM-dd  HH:mm"
					selected={date.getDecodedDate(value)}
					onChange={this.handleDateChange}
					showTimeSelect={showTimeSelect}
					isClearable={isClearable}
					required={required}
					minDate={hiddenDates}
					name={name}
					disabled={disabled}
				/>
			</div>
		);
	}
}
export default DateInputField;
