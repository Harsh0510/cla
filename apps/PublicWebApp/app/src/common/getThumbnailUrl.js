export default function (isbn13) {
	return `${process.env.ASSET_ORIGIN}/coverpages/${isbn13}.png`;
}
