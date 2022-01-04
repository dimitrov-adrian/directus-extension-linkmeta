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

const metascrape = metascraper([
	Metascraper_youtube(),
	Metascraper_soundcloud(),
	Metascraper_spotify(),
	Metascraper_amazon(),
	Metascraper_author(),
	Metascraper_date(),
	Metascraper_description(),
	Metascraper_image(),
	Metascraper_logo_favicon(),
	Metascraper_logo(),
	Metascraper_clearbit(),
	Metascraper_publisher(),
	Metascraper_title(),
	Metascraper_lang(),
	Metascraper_video(),
	Metascraper_readability(),
	Metascraper_iframe(),
	Metascraper_url(),
	Metascraper_manifest(),
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
		// There is some issue with the scraping, it could crash the directus app
		// https://github.com/sindresorhus/got/issues/1489

		const { body: html, url } = await got(targetUrl);
		const data = await metascrape({ html, url });

		return {
			status: 'success',
			data,
		};
	} catch (error) {
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
