const { defineEndpoint } = require('@directus/shared/utils');

/** @type {import('got').Got} */
const got = require('got');

const processUrl = require('./fetcher-metascraper.js');

module.exports = defineEndpoint((router, { exceptions }) => {
	router.get('/', linkMetaEndpoint);
	router.get('/img', imgProxy);

	async function linkMetaEndpoint(req, res, next) {
		if (!req?.accountability?.role) {
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
	}

	async function imgProxy(req, res, next) {
		if (!req?.accountability?.role) {
			return next(new exceptions.ForbiddenException());
		}

		if (!req?.query?.url) {
			return next(new exceptions.InvalidQueryException('Missing "url" query argument'));
		}

		try {
			const data = await got(req?.query?.url, { decompress: true, http2: true });

			if (data.headers['content-length']) {
				// Limit to 1MB
				if (parseInt(data.headers['content-length']) > 1024 * 1024) {
					throw Error('Image is too big');
				}

				res.set('Content-Length', data.headers['content-length']);
			}

			if (data.headers['content-type']) {
				res.set('Content-Type', data.headers['content-type']);
				res.contentType(data.headers['content-type']);
			}

			res.end(data.rawBody, 'binary');
		} catch (error) {
			return next(new exceptions.ServiceUnavailableException(error));
		}
	}
});
