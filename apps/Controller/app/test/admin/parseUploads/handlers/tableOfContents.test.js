const tableOfContentsHandlers = require("../../../../core/admin/parseUploads/handlers/tableOfContents");
const parseXmlString = require("../../../common/parseXmlString");

let p, xmlValue;

function resetAll() {
	p = {};
	xmlValue = `<Product>
					<CollateralDetail>
						<TextContent>
						<TextType>04</TextType>
						<ContentAudience>05</ContentAudience>
						<Text textformat="05">
							<div class="toc">
								<ul>
									<li>
										<span class="label">Introduction</span>
										<span class="page">4</span>
									</li>
									<li>
										<span class="label">Using RSC School Shakespeare</span>
										<span class="page">6</span>
									</li>
									<li>
										<span class="label">Editing choices</span>
										<span class="page">8</span>
									</li>
									<li>
										<span class="label">Working collaboratively</span>
										<span class="page">9</span>
									</li>
									<li>
										<span class="label">Questioning</span>
										<span class="page">10</span>
									</li>
									<li>
										<span class="label">Creating a character</span>
										<span class="page">11</span>
									</li>
									<li>
										<span class="label">Layering</span>
										<span class="page">12</span>
									</li>
									<li>
										<span class="label">Creative constraints</span>
										<span class="page">13</span>
									</li>
									<li>
										<span class="label">Speaking text aloud</span>
										<span class="page">14</span>
									</li>
									<li>
										<span class="label">Embodying text</span>
										<span class="page">15</span>
									</li>
									<li>
										<span class="label">Glossary</span>
										<span class="page">16</span>
									</li>
								</ul>
							</div>
						</Text>
						</TextContent>
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
								<ResourceLink>http://ukcatalogue.oup.com/images/en_US/covers/large/9780198369257_450.jpg</ResourceLink>
							</ResourceVersion>
						</SupportingResource>
					</CollateralDetail>
				</Product>`;
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Parse xml without any tableOfContents`, async () => {
	xmlValue = `<Product></Product>`;
	tableOfContentsHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({});
});

test(`Parse xml with empty TOC`, async () => {
	xmlValue = `<Product></Product>`;
	tableOfContentsHandlers(
		p,
		await parseXmlString(`
		<Product>
			<CollateralDetail>
				<TextContent>
					<TextType>04</TextType>
					<ContentAudience>05</ContentAudience>
					<Text textformat="05">
						<div class="toc"></div>
					</Text>
				</TextContent>
			</CollateralDetail>
		</Product>
	`)
	);
	expect(p).toEqual({});
});

test(`Parse xml have tableOfContents`, async () => {
	tableOfContentsHandlers(p, await parseXmlString(xmlValue));
	expect(p.toc).toBe(
		`<ul> <li> <span class=\"label\">Introduction</span> <span class=\"page\">4</span> </li> <li> <span class=\"label\">Using RSC School Shakespeare</span> <span class=\"page\">6</span> </li> <li> <span class=\"label\">Editing choices</span> <span class=\"page\">8</span> </li> <li> <span class=\"label\">Working collaboratively</span> <span class=\"page\">9</span> </li> <li> <span class=\"label\">Questioning</span> <span class=\"page\">10</span> </li> <li> <span class=\"label\">Creating a character</span> <span class=\"page\">11</span> </li> <li> <span class=\"label\">Layering</span> <span class=\"page\">12</span> </li> <li> <span class=\"label\">Creative constraints</span> <span class=\"page\">13</span> </li> <li> <span class=\"label\">Speaking text aloud</span> <span class=\"page\">14</span> </li> <li> <span class=\"label\">Embodying text</span> <span class=\"page\">15</span> </li> <li> <span class=\"label\">Glossary</span> <span class=\"page\">16</span> </li> </ul>`
	);
});
