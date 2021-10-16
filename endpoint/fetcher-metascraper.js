import axios from 'axios';
import metascraper from 'metascraper';
import Metascraper_author from 'metascraper-author';
import Metascraper_date from 'metascraper-date';
import Metascraper_description from 'metascraper-description';
import Metascraper_image from 'metascraper-image';
import Metascraper_logo from 'metascraper-logo';
import Metascraper_logo_favicon from 'metascraper-logo-favicon';
import Metascraper_clearbit from 'metascraper-clearbit';
import Metascraper_publisher from 'metascraper-publisher';
import Metascraper_title from 'metascraper-title';
import Metascraper_lang from 'metascraper-lang';
import Metascraper_video from 'metascraper-video';
import Metascraper_youtube from 'metascraper-youtube';
import Metascraper_soundcloud from 'metascraper-soundcloud';
import Metascraper_spotify from 'metascraper-spotify';
import Metascraper_amazon from 'metascraper-amazon';
import Metascraper_iframe from 'metascraper-iframe';
import Metascraper_readability from 'metascraper-readability';
import Metascraper_url from 'metascraper-url';

const rules = [
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
];

/**
 * @param {string} url
 */
export default async function processUrl(url) {
	if (!isUrl(url)) {
		return {
			status: 'error',
			message: 'INVALID_URL',
		};
	}

	try {
		const response = await axios.get(url);
		const data = await metascraper(rules)({
			html: response && response.data ? response.data : '',
			url,
		});

		return {
			status: 'success',
			data,
		};
	} catch (error) {
		return {
			status: 'error',
			message: error.toString(),
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
