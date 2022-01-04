const utils = require('util');
const metascraper = require('./fetcher-metascraper.js');

(async (url) => {
	if (!/^https?:/.test(url)) {
		process.stdout.write('Not an URL');
		return;
	}

	const data = await metascraper(url);
	process.stdout.write(utils.inspect(data, true, 3, true));
})(process.argv.slice(-1)[0]);
