export default interface IAsset {
	id: number;
	pdf_isbn13: string;
	page_offset_roman: number;
	page_offset_arabic: number;
	page_count: number;
	withdrawn: boolean;
}
