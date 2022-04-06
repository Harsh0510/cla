const coverUrisHandlers = require("../../../../core/admin/parseUploads/handlers/coverUris");
const parseXmlString = require("../../../common/parseXmlString");

let p, xmlValue;

function resetAll() {
	p = {};
	xmlValue = `<Product>
					<CollateralDetail>
						<SupportingResource>
							<ResourceContentType>01</ResourceContentType>
							<ContentAudience>00</ContentAudience>
							<ResourceMode>03</ResourceMode>
							<ResourceVersion>
								<ResourceForm>02</ResourceForm>
								<ResourceVersionFeature>
									<ResourceVersionFeatureType>01</ResourceVersionFeatureType>
									<FeatureValue>D502</FeatureValue>
								</ResourceVersionFeature>
								<ResourceLink>http://assets.cambridge.org/97811084/47423/cover/9781108447423.jpg</ResourceLink>
							</ResourceVersion>
							
							<ResourceVersion>
								<ResourceForm>02</ResourceForm>
									<ResourceVersionFeature>
										<ResourceVersionFeatureType>02</ResourceVersionFeatureType>
										<FeatureValue>500</FeatureValue>
										<FeatureNote>Variable height and width</FeatureNote>
									</ResourceVersionFeature>
								<ResourceLink>http://plan-g.harpercollins.co.uk/imagestore/Titles/041000/041069-fct.tif</ResourceLink>
							</ResourceVersion>

							<ResourceVersion>
								<ResourceForm>02</ResourceForm>
								<ResourceVersionFeature>
									<ResourceVersionFeatureType>03</ResourceVersionFeatureType>
									<FeatureValue>600</FeatureValue>
									<FeatureNote>Variable Height and Width</FeatureNote>
								</ResourceVersionFeature>
								<ResourceLink>http://plan-g.harpercollins.co.uk/imagestore/Titles/051800/051891-fc50.jpg</ResourceLink>
							</ResourceVersion>
						</SupportingResource>
					</CollateralDetail>
				</Product>
	`;
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Parse xml without any cover uris`, async () => {
	xmlValue = `<Product></Product>`;
	coverUrisHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ coverUris: [] });
});

test(`Parse xml have cover uris`, async () => {
	coverUrisHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({
		coverUris: [
			"http://plan-g.harpercollins.co.uk/imagestore/Titles/051800/051891-fc50.jpg",
			"http://plan-g.harpercollins.co.uk/imagestore/Titles/041000/041069-fct.tif",
			"http://assets.cambridge.org/97811084/47423/cover/9781108447423.jpg",
		],
	});
});

test(`Parse xml have area 1 is more then area 2`, async () => {
	xmlValue = `<Product>
					<CollateralDetail>
						<SupportingResource>
							<ResourceContentType>01</ResourceContentType>
							<ContentAudience>00</ContentAudience>
							<ResourceMode>03</ResourceMode>
							<ResourceVersion>
								<ResourceForm>02</ResourceForm>
								<ResourceVersionFeature>
									<ResourceVersionFeatureType>03</ResourceVersionFeatureType>
									<FeatureValue>750</FeatureValue>
									<FeatureNote>Variable Height and Width</FeatureNote>
								</ResourceVersionFeature>
								<ResourceLink>http://plan-g.harpercollins.co.uk/imagestore/Titles/051800/051891-fc50.jpg</ResourceLink>
							</ResourceVersion>

							<ResourceVersion>
								<ResourceForm>02</ResourceForm>
									<ResourceVersionFeature>
										<ResourceVersionFeatureType>02</ResourceVersionFeatureType>
										<FeatureValue>250</FeatureValue>
										<FeatureNote>Variable height and width</FeatureNote>
									</ResourceVersionFeature>
								<ResourceLink>http://plan-g.harpercollins.co.uk/imagestore/Titles/041000/041069-fct.tif</ResourceLink>
							</ResourceVersion>

						</SupportingResource>
					</CollateralDetail>
				</Product>
	`;
	coverUrisHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({
		coverUris: [
			"http://plan-g.harpercollins.co.uk/imagestore/Titles/051800/051891-fc50.jpg",
			"http://plan-g.harpercollins.co.uk/imagestore/Titles/041000/041069-fct.tif",
		],
	});
});

test(`Parse xml have area 1 is less then area 2`, async () => {
	xmlValue = `<Product>
					<CollateralDetail>
						<SupportingResource>
							<ResourceContentType>01</ResourceContentType>
							<ContentAudience>00</ContentAudience>
							<ResourceMode>03</ResourceMode>
							<ResourceVersion>
								<ResourceForm>02</ResourceForm>
								<ResourceVersionFeature>
									<ResourceVersionFeatureType>03</ResourceVersionFeatureType>
									<FeatureValue>250</FeatureValue>
									<FeatureNote>Variable Height and Width</FeatureNote>
								</ResourceVersionFeature>
								<ResourceLink>http://plan-g.harpercollins.co.uk/imagestore/Titles/051800/051891-fc50.jpg</ResourceLink>
							</ResourceVersion>

							<ResourceVersion>
								<ResourceForm>02</ResourceForm>
									<ResourceVersionFeature>
										<ResourceVersionFeatureType>02</ResourceVersionFeatureType>
										<FeatureValue>750</FeatureValue>
										<FeatureNote>Variable height and width</FeatureNote>
									</ResourceVersionFeature>
								<ResourceLink>http://plan-g.harpercollins.co.uk/imagestore/Titles/041000/041069-fct.tif</ResourceLink>
							</ResourceVersion>

						</SupportingResource>
					</CollateralDetail>
				</Product>
	`;
	coverUrisHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({
		coverUris: [
			"http://plan-g.harpercollins.co.uk/imagestore/Titles/041000/041069-fct.tif",
			"http://plan-g.harpercollins.co.uk/imagestore/Titles/051800/051891-fc50.jpg",
		],
	});
});

test(`ResourceLink URL without 'http://'`, async () => {
	xmlValue = `<Product>
					<CollateralDetail>
						<SupportingResource>
							<ResourceContentType>01</ResourceContentType>
							<ContentAudience>00</ContentAudience>
							<ResourceMode>03</ResourceMode>
							<ResourceVersion>
								<ResourceForm>02</ResourceForm>
								<ResourceVersionFeature>
									<ResourceVersionFeatureType>03</ResourceVersionFeatureType>
									<FeatureValue>250</FeatureValue>
									<FeatureNote>Variable Height and Width</FeatureNote>
								</ResourceVersionFeature>
								<ResourceLink>plan-g.harpercollins.co.uk/imagestore/Titles/051800/051891-fc50.jpg</ResourceLink>
							</ResourceVersion>
						</SupportingResource>
					</CollateralDetail>
				</Product>
	`;
	coverUrisHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ coverUris: ["plan-g.harpercollins.co.uk/imagestore/Titles/051800/051891-fc50.jpg"] });
});

test(`ResourceLink URL with large`, async () => {
	xmlValue = `<Product>
					<CollateralDetail>
						<SupportingResource>
							<ResourceContentType>01</ResourceContentType>
							<ContentAudience>00</ContentAudience>
							<ResourceMode>03</ResourceMode>
							<ResourceVersion>
								<ResourceForm>02</ResourceForm>
								<ResourceVersionFeature>
									<ResourceVersionFeatureType>03</ResourceVersionFeatureType>
									<FeatureValue>250</FeatureValue>
									<FeatureNote>Variable Height and Width</FeatureNote>
								</ResourceVersionFeature>
								<ResourceLink>http://plan-g.harpercollins.co.uk/imagestore/Titles/large/051800/051891-fc50.jpg</ResourceLink>
							</ResourceVersion>
						</SupportingResource>
					</CollateralDetail>
				</Product>
	`;
	coverUrisHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ coverUris: ["http://plan-g.harpercollins.co.uk/imagestore/Titles/large/051800/051891-fc50.jpg"] });
});

test(`ResourceLink URL with big`, async () => {
	xmlValue = `<Product>
					<CollateralDetail>
						<SupportingResource>
							<ResourceContentType>01</ResourceContentType>
							<ContentAudience>00</ContentAudience>
							<ResourceMode>03</ResourceMode>
							<ResourceVersion>
								<ResourceForm>02</ResourceForm>
								<ResourceVersionFeature>
									<ResourceVersionFeatureType>03</ResourceVersionFeatureType>
									<FeatureValue>250</FeatureValue>
									<FeatureNote>Variable Height and Width</FeatureNote>
								</ResourceVersionFeature>
								<ResourceLink>http://plan-g.harpercollins.co.uk/imagestore/Titles/big/051800/051891-fc50.jpg</ResourceLink>
							</ResourceVersion>
						</SupportingResource>
					</CollateralDetail>
				</Product>
	`;
	coverUrisHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ coverUris: ["http://plan-g.harpercollins.co.uk/imagestore/Titles/big/051800/051891-fc50.jpg"] });
});

test(`ResourceLink URL with big`, async () => {
	xmlValue = `<Product>
					<CollateralDetail>
						<SupportingResource>
							<ResourceContentType>01</ResourceContentType>
							<ContentAudience>00</ContentAudience>
							<ResourceMode>03</ResourceMode>
							<ResourceVersion>
								<ResourceForm>02</ResourceForm>
								<ResourceVersionFeature>
									<ResourceVersionFeatureType>03</ResourceVersionFeatureType>
									<FeatureValue>250</FeatureValue>
									<FeatureNote>Variable Height and Width</FeatureNote>
								</ResourceVersionFeature>
								<ResourceLink>http://plan-g.harpercollins.co.uk/imagestore/Titles/small/051800/051891-fc50.jpg</ResourceLink>
							</ResourceVersion>
						</SupportingResource>
					</CollateralDetail>
				</Product>
	`;
	coverUrisHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ coverUris: ["http://plan-g.harpercollins.co.uk/imagestore/Titles/small/051800/051891-fc50.jpg"] });
});

test(`ResourceLink URL with tiny`, async () => {
	xmlValue = `<Product>
					<CollateralDetail>
						<SupportingResource>
							<ResourceContentType>01</ResourceContentType>
							<ContentAudience>00</ContentAudience>
							<ResourceMode>03</ResourceMode>
							<ResourceVersion>
								<ResourceForm>02</ResourceForm>
								<ResourceVersionFeature>
									<ResourceVersionFeatureType>03</ResourceVersionFeatureType>
									<FeatureValue>250</FeatureValue>
									<FeatureNote>Variable Height and Width</FeatureNote>
								</ResourceVersionFeature>
								<ResourceLink>http://plan-g.harpercollins.co.uk/imagestore/Titles/tiny/051800/051891-fc50.jpg</ResourceLink>
							</ResourceVersion>
						</SupportingResource>
					</CollateralDetail>
				</Product>
	`;
	coverUrisHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ coverUris: ["http://plan-g.harpercollins.co.uk/imagestore/Titles/tiny/051800/051891-fc50.jpg"] });
});
