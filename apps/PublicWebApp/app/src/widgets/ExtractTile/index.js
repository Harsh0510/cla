import React from "react";
import { Link } from "react-router-dom";

const ExtractTile = (p) => {
	const { extract } = p;
	const lastAuthorIndex = extract.work_authors.length - 1;
	return (
		<li>
			<div>Number of pages copied: {extract.page_count}</div>
			<div>Title of copy: {extract.title}</div>
			<div>Date of copy (year): {extract.date_created.slice(0, 4)}</div>
			<div>Course name: {extract.course_name}</div>
			<div>Book title: {extract.work_title}</div>
			<div>
				Book authors:{" "}
				{extract.work_authors.map((item, idx) => (
					<span key={item}>{item.firstName + " " + item.lastName + (idx !== lastAuthorIndex ? ", " : "")}</span>
				))}
			</div>
			<Link to={`/profile/management/${extract.oid}`}>View</Link>
		</li>
	);
};

export default ExtractTile;
