import React from "react";
import TableGrid from "../../widgets/TableGrid";
import styled, { css } from "styled-components";
import theme from "../../common/theme";

//set the defualt behaviour of column header
const COLUMN_ALIGN_LEFT = "left";
const COLUMN_ALIGN_CENTER = "center";

const WrapperSection = styled.div`
	width: 100%;
	padding-bottom: 3em;
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		padding-bottom: 2em;
	}
`;

export default class UnlockList extends React.PureComponent {
	urlEncodeAsset = (asset) => {
		const title = asset.title.replace(/[^A-Za-z0-9_-]+/g, "-").toLowerCase();
		return asset.pdf_isbn13 + "-" + title;
	};

	getAuthors(authors) {
		return authors ? authors.map((author) => author.firstName + " " + author.lastName).join(", ") : "";
	}

	getTable = (unlockedData) => {
		if (!unlockedData || unlockedData.length === 0) {
			return "";
		}

		//declare columns
		let columns = [
			{ name: "title", title: "Title" },
			{ name: "pdf_isbn13", title: "ISBN" },
			{ name: "authors", title: "Authors" },
			{ name: "isbn13", title: "eISBN" },
		];

		//arrange the column records
		const rows = unlockedData.map((item) => {
			const row = Object.create(null);
			row.title = (
				<a target="_blank" href={`works/${this.urlEncodeAsset(item)}`}>
					{item.title}
				</a>
			);
			row.isbn13 = item.isbn13;
			row.pdf_isbn13 = item.pdf_isbn13;
			row.authors = this.getAuthors(item.authors);
			return row;
		});

		//column resizing
		let defaultColumnWidths = [
			{ columnName: "title", width: 450 },
			{ columnName: "isbn13", width: 150 },
			{ columnName: "pdf_isbn13", width: 150 },
			{ columnName: "authors", width: 250 },
		];

		//default sorting
		let defaultSorting = [];

		//column initilization and alignment
		let tableColumnExtensions = [
			{ columnName: "title", align: COLUMN_ALIGN_LEFT },
			{ columnName: "isbn13", align: COLUMN_ALIGN_LEFT },
			{ columnName: "pdf_isbn13", align: COLUMN_ALIGN_LEFT },
			{ columnName: "authors", align: COLUMN_ALIGN_LEFT },
		];

		//default disable column for sorting
		let sortingStateColumnExtensions = [
			{ columnName: "title", sortingEnabled: false },
			{ columnName: "isbn13", sortingEnabled: false },
			{ columnName: "pdf_isbn13", sortingEnabled: false },
			{ columnName: "authors", sortingEnabled: false },
		];

		//for set fixed column
		let leftColumns = ["title"];
		let rightColumns = ["authors"];
		//date type column names
		let dateColumnsName = [];

		return (
			<>
				<TableGrid
					column={columns}
					row={rows}
					resize={defaultColumnWidths}
					tableColumnExtensions={tableColumnExtensions}
					defaultSorting={defaultSorting}
					sortingStateColumnExtensions={sortingStateColumnExtensions}
					loading={false}
					leftColumns={leftColumns}
					rightColumns={rightColumns}
					dateColumnsName={dateColumnsName}
				/>
			</>
		);
	};

	render() {
		const props = this.props;
		const unlockListTable = this.getTable(props.unlockedData);
		return <WrapperSection>{unlockListTable}</WrapperSection>;
	}
}
