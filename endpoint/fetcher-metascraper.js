/** @type {import('got').Got} */
const got = require('got');

const metascraper = require('metascraper');
const Metascraper_author = require('metascraper-author');
const Metascraper_manifest = require('metascraper-manifest');
const Metascraper_date = require('metascraper-date');
const Metascraper_description = require('metascraper-description');
const Metascraper_image = require('metascraper-image');
const Metascraper_logo = require('metascraper-logo');
const Metascraper_logo_favicon = require('metascraper-logo-favicon');
const Metascraper_clearbit = require('metascraper-clearbit');
const Metascraper_publisher = require('metascraper-publisher');
const Metascraper_title = require('metascraper-title');
const Metascraper_lang = require('metascraper-lang');
const Metascraper_video = require('metascraper-video');
const Metascraper_youtube = require('metascraper-youtube');
const Metascraper_soundcloud = require('metascraper-soundcloud');
const Metascraper_spotify = require('metascraper-spotify');
const Metascraper_amazon = require('metascraper-amazon');
const Metascraper_iframe = require('metascraper-iframe');
const Metascraper_readability = require('metascraper-readability');
const Metascraper_url = require('metascraper-url');

// There is some issue with the scraping, it could crash the directus app
// https://github.com/sindresorhus/got/issues/1489
// Found that it is caused only for http2 requests, as gmail.com,... etc.
const gotOpts = { decompress: true, http2: true };

const metascrape = metascraper([
	Metascraper_youtube({ gotOpts }),
	Metascraper_soundcloud({ gotOpts }),
	Metascraper_spotify({ gotOpts }),
	Metascraper_amazon({ gotOpts }),
	Metascraper_author({ gotOpts }),
	Metascraper_date({ gotOpts }),
	Metascraper_description({ gotOpts }),
	Metascraper_image({ gotOpts }),
	Metascraper_logo_favicon({ gotOpts }),
	Metascraper_logo({ gotOpts }),
	Metascraper_clearbit({ gotOpts }),
	Metascraper_publisher({ gotOpts }),
	Metascraper_title({ gotOpts }),
	Metascraper_lang({ gotOpts }),
	Metascraper_video({ gotOpts }),
	Metascraper_readability({ gotOpts }),
	Metascraper_iframe({ gotOpts }),
	Metascraper_url({ gotOpts }),
	Metascraper_manifest({ gotOpts }),
]);

module.exports = processUrl;

/**
 * @param {string} targetUrl
 */
async function processUrl(targetUrl) {
	if (!isUrl(targetUrl)) {
		return {
			status: 'error',
			message: 'errors.INVALID_QUERY',
		};
	}

	try {
		const { body: html, url, headers } = await got(targetUrl, gotOpts);
		const data = await metascrape({ html, url });

		if (/^image\//.test(headers['content-type'] || '')) {
			data.image = url;
		}

		return {
			status: 'success',
			data,
		};
	} catch (/** @type {any} */ error) {
		return {
			status: 'error',
			message: error ? error.toString() : 'errors.UNKNOWN',
		};
	}
}

/**
 * @param {string} url
 */
function isUrl(url) {
	try {
		new URL(url);
	} catch {
		return false;
	}

	return /^https?:/i.test(url);
}
