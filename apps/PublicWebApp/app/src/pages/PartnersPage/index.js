import React from "react";
import Header from "../../widgets/Header";
import styled from "styled-components";
import { Link } from "react-router-dom";
import theme from "../../common/theme";
import RandomShuffle from "../../common/randomShuffle";
import { HeadTitle, PageTitle } from "../../widgets/HeadTitle";
import { colLg1, colLg11, colLg12, colMd12, colMd2, colMd4, colXs12 } from "../../common/style";
import { Container } from "../../widgets/Layout/Container";
import { Row } from "../../widgets/Layout/Row";
import { PageContentLarge } from "../../widgets/Layout/PageContentLarge";

const JUMP_TO_CONTENT_ID = "main-content";

const MainTitleWrap = styled.div`
	padding: 20px 0 8px;
	background-color: ${theme.colours.bgDarkPurple};
	color: ${theme.colours.white};
`;

const FormIcon = styled.div`
	height: 63px;
	width: 63px;
	line-height: 60px;
	text-align: center;
	background-color: white;
	color: ${theme.colours.bgDarkPurple};
	border-radius: 50%;
	i {
		font-size: 35px;
		vertical-align: middle;
	}

	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		margin-bottom: 1em;
	}
`;

const FormTitle = styled(PageContentLarge)`
	font-size: 16px;
	h1 {
		font-size: 38px;
		line-height: 1.2;
		margin-bottom: 0;
		margin-top: 9px;
	}

	@media screen and (max-width: ${theme.breakpoints.tablet}) {
		h1 {
			font-size: 25px;
		}
		p {
			font-size: 17px;
		}
	}
	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		h1 {
			line-height: 1;
		}
		p {
			font-size: 17px;
		}
	}
	${colLg11}
`;

const PartnerWrap = styled(Link)`
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: ${theme.shadow};
	vertical-align: middle;
	text-align: center;
	margin: 1em 0;
	min-width: 30%;
	height: 150px;
	padding: 15px;
	cursor: pointer;
	box-shadow: 3px 3px 8px 2px rgba(50, 0, 0, 0.2);

	@media screen and (max-width: ${theme.breakpoints.desktopSmall}) {
		min-width: 30%;
		min-height: 100px;
	}

	@media screen and (max-width: ${theme.breakpoints.mobile}) {
		min-width: 90%;
	}
`;

const PartnerImage = styled.img`
	max-width: 100%;
	max-height: 100%;

	@media screen and (max-width: ${theme.breakpoints.desktopSmall}) {
		max-width: 90%;
		max-height: 100px;
	}
`;

const ContentSection = styled(Row)`
	justify-content: center;
`;

const PartnerSection = styled.div`
	${colMd4}
	${colXs12}
`;

const ItemWrap = styled.div`
	${colMd2}
	${colLg1}
`;

const PartnerSectionWrap = styled(Row)``;

const PartnerWrapper = styled.div`
	${colLg12}
	${colMd12}
`;

export default class PartnersPage extends React.PureComponent {
	state = {
		partnersArray: [
			{
				partner: "Amber Books Ltd",
				image: require("./images/amber.png"),
				width: "274px",
				height: "164px",
			},
			{
				partner: "Burleigh Dodds Science Publishing",
				image: require("./images/burleigh_dodds.png"),
				width: "480px",
				height: "111px",
			},
			{
				partner: "Wiley",
				image: require("./images/wiley.png"),
				width: "380px",
				height: "80px",
			},
			{
				partner: "Red Robin Books",
				image: require("./images/red_robin_books.png"),
				width: "323px",
				height: "175px",
			},
			{
				partner: "LCO CAD Consultants",
				image: require("./images/lco_cad_consultants.png"),
				width: "381px",
				height: "276px",
			},
			{
				partner: "Jessica Kingsley Publishers",
				image: require("./images/jessica_kingsley_publishers.png"),
				width: "374px",
				height: "327px",
			},
			{
				partner: "Future Publishing",
				image: require("./images/future_publishing.png"),
				width: "360px",
				height: "168px",
			},
			{
				partner: "Family Links",
				image: require("./images/family_links.png"),
				width: "360px",
				height: "137px",
			},
			{
				partner: "Kitchen Chemistry",
				image: require("./images/kitchen-chemistry.jpg"),
				width: "164px",
				height: "164px",
			},
			{
				partner: "Scholastic",
				image: require("./images/scholastic.png"),
				width: "219px",
				height: "27px",
			},
			{
				partner: "Immediate Media",
				search_name: "Immediate Media/BBC Studios",
				image: require("./images/immediate_media.png"),
				height: "146px",
				width: "418px",
			},
			{
				partner: "David & Charles",
				image: require("./images/dc_logo.png"),
				height: "272px",
				width: "120px",
			},
			{
				partner: "SPCK",
				image: require("./images/spck.png"),
				height: "176px",
				width: "176px",
			},
			{
				partner: "Brilliant Publications",
				search_name: "Brilliant Publications Limited",
				image: require("./images/brilliant_publications.jpg"),
				height: "146px",
				width: "418px",
			},
			{
				partner: "Gwasg Carreg Gwalch",
				image: require("./images/gwasg_carreg_gwalch.png"),
				height: "273px",
				width: "146px",
			},
			{
				partner: "Rily",
				image: require("./images/rily.png"),
				height: "284px",
				width: "250px",
			},
			{
				partner: "Gwasg Prifysgol Cymru / University of Wales Press",
				image: require("./images/uwp.jpg"),
				height: "210px",
				width: "211px",
			},
			{
				partner: "Maths – No Problem!",
				image: require("./images/Partner_1_MathsNoProblem.svg"),
				height: "48px",
				width: "123px",
			},
			{
				partner: "Pearson Education Limited",
				image: require("./images/Partner_2_Pearson.svg"),
				height: "54px",
				width: "140px",
			},
			{
				partner: "Cambridge University Press",
				image: require("./images/Partner_3_CambridgeUniversityPress.svg"),
				height: "57px",
				width: "180px",
			},
			{
				partner: "Bloomsbury Publishing",
				image: require("./images/Partner_4_BloomsBury.svg"),
				height: "43px",
				width: "181px",
			},
			{
				partner: "HarperCollins Publishers",
				image: require("./images/Collins_logo_redband_485_RGB.jpg"),
				height: "92px",
				width: "298px",
			},
			{
				partner: "Oxford University Press",
				image: require("./images/oxford_university_press.png"),
				height: "135px",
				width: "384px",
			},
			{
				partner: "Taylor and Francis",
				image: require("./images/Partner_7_TaylorFranciesGroup.svg"),
				height: "60px",
				width: "207px",
			},
			{
				partner: "Elmwood Education",
				image: require("./images/Partner_8_ElmWoodEducation.svg"),
				height: "73px",
				width: "194px",
			},
			{
				partner: "Hodder Education Group",
				image: require("./images/Partner_9_HodderEducation.svg"),
				height: "66px",
				width: "122px",
			},
			{
				partner: "Critical Publishing",
				image: require("./images/Partner_10_CriticalPublishing.png"),
				height: "119px",
				width: "298px",
			},
			{
				partner: "Search Press",
				image: require("./images/Partner_11_SearchPress.jpg"),
				height: "60px",
				width: "298px",
			},
			{
				partner: "Y Lolfa",
				image: require("./images/ylolfa.png"),
				width: "288px",
				height: "95px",
			},
			{
				partner: "Hachette",
				image: require("./images/Partner_13_Hachette.png"),
				height: "150px",
				width: "159px",
			},
			{
				partner: "Coordination Group Publications",
				image: require("./images/cgp.png"),
				height: "149px",
				width: "297px",
			},
			{
				partner: "Faber & Faber",
				image: require("./images/Faber-Logo.png"),
				height: "150px",
				width: "266px",
			},
			{
				partner: "PG Online Ltd",
				image: require("./images/pg-online-logo_blue.png"),
				height: "70px",
				width: "298px",
			},
			{
				partner: "Atebol",
				image: require("./images/atebol.png"),
				height: "993px",
				width: "840px",
			},
			{
				partner: "Crown House Publishing",
				image: require("./images/CrownHouse.png"),
				height: "530px",
				width: "800px",
			},
			{
				partner: "Graffeg",
				image: require("./images/Graffeg.png"),
				height: "198px",
				width: "1440px",
			},
			{
				partner: "Illuminate Publishing",
				image: require("./images/Illuminate_logo.png"),
				height: "498px",
				width: "608px",
			},
			{
				partner: "Little Tiger Group",
				search_name: "Little Tiger Press",
				image: require("./images/little_tiger_group.png"),
				width: "312px",
				height: "171px",
			},
			{
				partner: "MA Education",
				search_name: "Mark Allen",
				image: require("./images/MA_Education.png"),
				height: "131px",
				width: "131px",
			},
			{
				partner: "Tarquin Publications",
				image: require("./images/Tarquin.jpg"),
				height: "115px",
				width: "438px",
			},
			{
				partner: "John Catt",
				search_name: "John Catt Educational",
				image: require("./images/john_catt.png"),
				height: "168px",
				width: "300px",
			},
			{
				partner: "B Small",
				search_name: "b small publishing",
				image: require("./images/bsmall.jpg"),
				height: "236px",
				width: "275px",
			},
			{
				partner: "Barrington Stoke",
				image: require("./images/barrington_stoke.png"),
				height: "300px",
				width: "300px",
			},
			{
				partner: "Colourpoint Creative",
				image: require("./images/cpe_logo.png"),
				height: "188px",
				width: "144px",
			},
			{
				partner: "Springer Nature",
				image: require("./images/springer_nature.png"),
				height: "85px",
				width: "864px",
			},
			{
				partner: "Random House",
				search_name: "Penguin Books Ltd,Penguin Random House Children's UK,Random House",
				image: require("./images/random_house.png"),
				height: "582px",
				width: "1991px",
			},
			{
				partner: "Linguascope",
				image: require("./images/linguascope.png"),
				height: "453px",
				width: "720px",
			},
			{
				partner: "CAA Cymru",
				image: require("./images/caa_cymru.png"),
				height: "113px",
				width: "191px",
			},
			{
				partner: "Kogan Page",
				image: require("./images/Kogan_Page.png"),
				height: "120px",
				width: "120px",
			},
			{
				partner: "Thames and Hudson",
				search_name: "Thames & Hudson",
				image: require("./images/thames_hudson.png"),
				height: "338px",
				width: "137px",
			},
		],
		randomeArray: [],
		limit: 20,
	};

	componentDidMount() {
		this.getRandomImage();
	}

	getRandomImage = () => {
		const pubImages = RandomShuffle(this.state.partnersArray.slice(0));
		this.setState({ randomeArray: pubImages });
	};

	render() {
		const partnersSection = this.state.randomeArray.map((item, index) => {
			return (
				<PartnerSection key={index}>
					<PartnerWrap to={"/works?filter_publisher=" + encodeURIComponent(item.search_name || item.partner)}>
						<PartnerImage src={item.image} alt={item.alt || "Logo of " + item.partner} />
					</PartnerWrap>
				</PartnerSection>
			);
		});
		return (
			<>
				<HeadTitle title={PageTitle.partners} hideSuffix={true} />
				<Header jumpToContentId={JUMP_TO_CONTENT_ID} />
				{/* <MainTitle title="Our Partners" icon="fa-handshake" icon_outside="true"/> */}
				<MainTitleWrap id={JUMP_TO_CONTENT_ID}>
					<Container>
						<ContentSection>
							<PageContentLarge>
								<Row>
									<ItemWrap>
										<FormIcon>
											<i className="fal fa-handshake"></i>
										</FormIcon>
									</ItemWrap>
									<FormTitle>
										<h1> Our Partners </h1>
										<p className="Description">Access books from our partner publishers</p>
									</FormTitle>
								</Row>
							</PageContentLarge>
						</ContentSection>
					</Container>
				</MainTitleWrap>
				<Container>
					<ContentSection>
						<PageContentLarge>
							<Row>
								<PartnerWrapper>
									<PartnerSectionWrap>{partnersSection}</PartnerSectionWrap>
								</PartnerWrapper>
							</Row>
						</PageContentLarge>
					</ContentSection>
				</Container>
			</>
		);
	}
}
