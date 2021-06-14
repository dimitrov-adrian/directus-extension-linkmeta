const processUrl = require("./fetcher-metascraper.js");

module.exports = router => {
	router.get("", async function linkPreviewEndpoint(req, res) {
		if (!req?.accountability.role) {
			res.status(403).send({
				status: "fail",
				message: "Forbidden. Authenticated user with role is required."
			});
		} else {
			res.send(await processUrl(req.query.url));
		}
	});
};
