import React from "react";
import sendEmailList from "../../common/sendEmailList";

/**
 * FAQ data
 */

const emailCLA = sendEmailList.supportCLA;
const emailEP = sendEmailList.supportEP;

const FaqList = [
	{
		title: <div>Why should I use this rather than a photocopier?</div>,
		description: (
			<div>
				<p>The Education Platform does not take away your ability to photocopy, but it does present some significant benefits:</p>
				<ul>
					<li>Access unlocked books to make copies from anywhere with an internet connection.</li>
					<li>Avoid the loss of quality that typically accompanies photocopying.</li>
					<li>
						Review your holdings easily — you can review books unlocked by other members of staff for leads on more resources for lesson planning.
					</li>
					<li>
						Restore your work from one year to the next — if you want to use a copy you made in subsequent academic years, you can simply restore it
						for use in the following academic year.
					</li>
					<li>
						{" "}
						Work with fewer interruptions — lessen the need to hunt for books, queue for the copier or to stand over it when making copies for your
						students.
					</li>
				</ul>
			</div>
		),
	},
	{
		title: <div>How do I get access to the Education Platform?</div>,
		description: (
			<div>
				<p>The Education Platform is provided at no additional cost to holders of the CLA Education Licence.</p>
				<p>
					Your institution needs to be registered on the Platform, and each teacher or other member of staff needing access will also need to&nbsp;
					<a href="/how-to-register" title="how to register" target="_blank">
						register
					</a>
					.
				</p>
			</div>
		),
	},
	{
		title: <div>How do we know if we have a CLA licence?</div>,
		description: (
			<ul>
				<li>All state-funded schools in the UK hold the CLA Licence through central agreements with regional education bodies.</li>
				<li>
					{" "}
					Most Independent schools also hold the licence, but just check with IAPs, SCIS or 
					<a href={"mailto:" + emailCLA} title="CLA">
						CLA
					</a>
					.
				</li>
				<li>
					We licence sixth form colleges and further education colleges directly, so just get in touch with 
					<a href={"mailto:" + emailCLA} title={emailCLA}>
						CLA
					</a>{" "}
					if you're unsure that your institution has the licence.
				</li>
			</ul>
		),
	},
	{
		title: <div>What books can I have access to?</div>,
		description: (
			<div>
				<p>
					The Platform enables you to make copies from books that are owned by your institution. You can make copies of up to 5% or a chapter of a
					book per class, as per the terms of the CLA Education Licence.
				</p>
				<p>
					We are constantly requesting and adding new books to the Platform. If you would like us to request a book on your behalf from the publisher,
					please contact us at{" "}
					<a href={"mailto:" + emailEP} title={emailEP}>
						{emailEP}
					</a>
					.
				</p>
			</div>
		),
	},
	{
		title: <div>How do I unlock a book?</div>,
		description: (
			<div>
				<p>To scan books on the Platform, you will need a computer with a webcam or a smartphone with a camera.</p>
				<p>
					Once you have logged in to the Platform, select the Unlock content button and follow the instructions; you need to use the built-in camera
					on your device to scan the barcode on the back cover, and if the book is on the Platform it will become available for you to use and create
					copies from it.
				</p>
				<p>
					If you don't have a suitable device for unlocking, please contact us at{" "}
					<a href={"mailto:" + emailEP} title={emailEP}>
						{emailEP}
					</a>
					. We will find an alternative way to unlock your copies.
				</p>
			</div>
		),
	},
	{
		title: <div>I'm having trouble unlocking a book. What might I be doing wrong?</div>,
		description: (
			<p>
				To successfully unlock a book you need to hold the book steady and ensure the barcode occupies a sizeable portion of the camera frame; the
				resolution of the camera on some older devices may not be sufficient to recognise the detail of the barcode, in which case please 
				<a href="/how-to-copy" title="how to copy" target="_blank">
					view our guide
				</a>{" "}
				or contact us at{" "}
				<a href={"mailto:" + emailEP} title={emailEP}>
					{emailEP}
				</a>
				.
			</p>
		),
	},
	{
		title: (
			<div>
				How many copies of a textbook do we need to have purchased to be able to unlock the book? Do we need to hold an e-book version of the book or
				is a paper copy enough for us to have access on the Platform?
			</div>
		),
		description: (
			<p>
				Under the Licence, you need one source copy purchased by the institution to unlock the material and for it to be of a book included in the
				licence. Either print or electronic is fine. You can make copies of up to 5% of a book per class, as per the terms of the CLA Education
				Licence.
			</p>
		),
	},
	{
		title: <div>What are the limits on copying?</div>,
		description: <p>You can copy 5% of a book per class, per academic year.</p>,
	},
	{
		title: <div>What if another teacher wants to copy from the same book?</div>,
		description: (
			<p>
				This is possible. If two are copying for the same class, they will need to share the licence limit. Different teachers copying for separate
				classes should not conflict on the Platform. If you have trouble making copies, please 
				<a href="/how-to-copy" title="how to copy" target="_blank">
					view our guide
				</a>
				 or contact us at{" "}
				<a href={"mailto:" + emailEP} title={emailEP}>
					{emailEP}
				</a>
				.
			</p>
		),
	},
	{
		title: <div>Are you trying to get other publishers on board? Are there plans to have plays and fiction on the Platform as well?</div>,
		description: (
			<div>
				<p>
					We are approaching as many relevant publishers as we can, including publishers of fiction. If you own books that you commonly copy, and they
					are not available on the Platform, please let us know and we'd be happy to contact them to make requests on your behalf.
				</p>
				<p>
					You can send in any lists of books that you would like to see on the Platform to{" "}
					<a href={"mailto:" + emailEP} title={emailEP}>
						{emailEP}
					</a>
					.
				</p>
			</div>
		),
	},
	{
		title: (
			<div>
				Will you be working with non-UK publishers? We are a bilingual school, so we use French textbooks as well as UK-published IB textbooks.
			</div>
		),
		description: (
			<div>
				<p>
					In principle, books published outside the UK could be included. Please let us know which books texts you would most like to see on the
					Platform and we can contact the relevant publishers.
				</p>
				<p>
					You can send in any lists of books you would like to see on the Platform texts to{" "}
					<a href={"mailto:" + emailEP} title={emailEP}>
						{emailEP}
					</a>
					.
				</p>
			</div>
		),
	},
	{
		title: <div>I'm scanning some barcodes and finding that the books aren't available to make copies.</div>,
		description: (
			<div>
				<p>There are a couple of reasons why this might be:</p>
				<ul>
					<li>
						{" "}
						It may beyond the scope of the Education Platform — the Education Platform is primarily designed for use with textbooks, revision guides,
						and similar resources for students.
					</li>
					<li>It is specifically excluded — some books, for example workbooks are not included in the CLA licence.</li>
					<li>
						It hasn't been added yet — the development team and our publisher partners are adding more content to the Platform. You can send in any
						lists of books you would like to see on the Platform to{" "}
						<a href={"mailto:" + emailEP} title={emailEP}>
							{emailEP}
						</a>
						.
					</li>
					<li> The barcode scan needs to be checked — make sure that your scan result was accurate, re-scan when in doubt.</li>
				</ul>
			</div>
		),
	},
	{
		title: <div>Is the Education Platform integrated with VLEs?</div>,
		description: (
			<div>
				<p>Currently we don't have a direct or automated integration.</p>
				<p>You can post links to copies on a VLE for your class or share it with them via email or another direct service.</p>
			</div>
		),
	},
	{
		title: <div>Can we share copies with other schools in our Multi Academy Trust?</div>,
		description: (
			<div>
				<p>
					The CLA Education Licence covers individual educational establishments on a single school's site, and copies can be shared with teachers in
					an individual school.
				</p>
				<p>These copies may not be shared across a group of schools such as a MAT.</p>
			</div>
		),
	},
];

export default FaqList;
