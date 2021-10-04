const processUrl = require('./fetcher-metascraper.js');

module.exports = (router) => {
	router.get('', async function linkMetaEndpoint(req, res) {
		if (!req || !req.accountability || !req.accountability.role) {
			res.status(403).send({
				status: 'fail',
				message: 'FORBIDDEN',
			});
		} else {
			try {
				res.send(await processUrl(req.query.url));
			} catch (error) {
				res.send(error.toString());
			}
		}
	});
};
