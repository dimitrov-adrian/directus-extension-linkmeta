import processUrl from './fetcher-metascraper.js';

export default (/** @type {import('express').Application} */ router) => {
	router.get('', async function linkMetaEndpoint(req, res) {
		if (!req || !req?.accountability?.role) {
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
