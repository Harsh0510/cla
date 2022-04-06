module.exports = async function (isWatermarked, isbn13, extractOid, pages, userIp) {
	return pages.map((pg, idx) => `https://dummyimage.com/1200x${idx === 0 ? `1000` : `1700`}/ee0000/333.png&text=${pg}`);
};
