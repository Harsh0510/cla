const pdfIsbn13Handlers = require("../../../../core/admin/parseUploads/handlers/pdfIsbn13");
const parseXmlString = require("../../../common/parseXmlString");

test(`Parse xml without any isbn13`, async () => {
	const xmlValue = `<Product></Product>`;
	const p = {};
	pdfIsbn13Handlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({});
});

test(`Parse xml with isbn`, async () => {
	const xmlValue = `
		<Product><!--P.1 Record reference, type and source-->
			<RecordReference>gwales.com.9781783161393</RecordReference>
			<NotificationType>03</NotificationType>
			<!--P.2 Product identifiers-->
			<!--element generated by CLA via transformation from 2.1 to 3.0 at 2021-07-02T19:22:35.540358Z-->
			<ProductIdentifier>
				<ProductIDType>01</ProductIDType>
				<IDTypeName>CLA: content file ISBN</IDTypeName>
				<IDValue>9781783161423</IDValue>
			</ProductIdentifier>
		</Product>
	`;
	const p = {};
	pdfIsbn13Handlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ pdfIsbn13: "9781783161423" });
});