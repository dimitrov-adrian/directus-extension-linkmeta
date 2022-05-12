const { defineEndpoint } = require('@directus/shared/utils');

/** @type {import('got').Got} */
const got = require('got');

const processUrl = require('./fetcher-metascraper.js');

module.exports = defineEndpoint((router, { exceptions }) => {
	router.get('/', async (req, res, next) => {
		if (!req?.accountability?.role) return next(new exceptions.ForbiddenException());

		if (!req?.query?.url) return next(new exceptions.InvalidQueryException('Missing "url" query argument'));

		try {
			return res.send(await processUrl(req.query.url.toString()));
		} catch (error) {
			return next(new exceptions.ServiceUnavailableException(error));
		}
	});

	router.get('/img', async (req, res, next) => {
		if (!req?.accountability?.role) return next(new exceptions.ForbiddenException());

		if (!req?.query?.url) return next(new exceptions.InvalidQueryException('Missing "url" query argument'));

		try {
			const data = await got(req?.query?.url, { decompress: true, http2: true });

			if (data.headers['content-length']) {
				res.set('Content-Length', data.headers['content-length']);
			}

			if (data.headers['content-type']) {
				res.set('Content-Type', data.headers['content-type']);
			}

			if (!data.headers['content-type']?.startsWith('image/')) {
				return next(new exceptions.InvalidPayloadException());
			}

			res.set('Cache-Control', 'public, max-age=2592000');
			res.set('Last-Modified', new Date().toGMTString());

			return res.end(data.rawBody, 'binary');
		} catch (error) {
			return next(new exceptions.ServiceUnavailableException(error));
		}
	});
});
