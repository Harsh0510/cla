import authors from "./handlers/authors";
import channel from "./handlers/channel";
import collection from "./handlers/collection";
import contentForm from "./handlers/contentForm";
import copyExcludedPages from "./handlers/copyExcludedPages";
import coverUris from "./handlers/coverUris";
import description from "./handlers/description";
import doi from "./handlers/doi";
import edition from "./handlers/edition";
import educationalYearGroup from "./handlers/educationalYearGroup";
import exam from "./handlers/exam";
import examBoard from "./handlers/examBoard";
import extent from "./handlers/extent";
import imprint from "./handlers/imprint";
import isbn13 from "./handlers/isbn13";
import issnId from "./handlers/issnId";
import issueNumber from "./handlers/issueNumber";
import keyStage from "./handlers/keyStage";
import language from "./handlers/language";
import level from "./handlers/level";
import pageOffsetArabic from "./handlers/pageOffsetArabic";
import pageOffsetRoman from "./handlers/pageOffsetRoman";
import parentAsset from "./handlers/parentAsset";
import pdfIsbn13 from "./handlers/pdfIsbn13";
import publicationDate from "./handlers/publicationDate";
import publisher from "./handlers/publisher";
import recordReference from "./handlers/recordReference";
import scottishLevel from "./handlers/scottishLevel";
import subjects from "./handlers/subjects";
import subtitle from "./handlers/subtitle";
import tableOfContents from "./handlers/tableOfContents";
import title from "./handlers/title";
import volumeNumber from "./handlers/volumeNumber";

const allHandlers = [
	// ISBN handles intentionally come first so we know on which ISBN errors occurred
	isbn13,
	pdfIsbn13,
	issnId,
	// Title also comes early so we definitely have a title in case errors occur.
	title,

	authors,
	channel,
	collection,
	contentForm,
	copyExcludedPages,
	coverUris,
	description,
	doi,
	edition,
	educationalYearGroup,
	exam,
	examBoard,
	extent,
	imprint,
	issueNumber,
	keyStage,
	language,
	level,
	pageOffsetArabic,
	pageOffsetRoman,
	parentAsset,
	publicationDate,
	publisher,
	recordReference,
	scottishLevel,
	subjects,
	subtitle,
	tableOfContents,
	volumeNumber,
];

export default allHandlers;
