const { defineEndpoint } = require('@directus/shared/utils');
const processUrl = require('./fetcher-metascraper.js');

module.exports = defineEndpoint((router, { exceptions }) => {
	router.get('/', async function linkMetaEndpoint(req, res, next) {
		if (!req.accountability?.role) {
			return next(new exceptions.ForbiddenException());
		}

		if (!req?.query?.url) {
			return next(new exceptions.InvalidQueryException('Missing "url" query argument'));
		}

		try {
			res.send(await processUrl(req.query.url.toString()));
		} catch (error) {
			return next(new exceptions.ServiceUnavailableException(error));
		}
	});
});
