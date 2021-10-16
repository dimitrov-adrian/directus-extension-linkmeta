import utils from 'util';
import metascraper from './fetcher-metascraper.js';

const url = process.argv.slice(-1)[0];
if (/^https?:/.test(url)) {
	const data = await metascraper(url);
	process.stdout.write(utils.inspect(data, true, 3, true));
}
