const assert = require('assert');
const metascraper = require('./fetcher-metascraper.js');

process.stdout.write('Running tests');

assert.doesNotReject(
	metascraper('http/invalidurl').then((result) => {
		assert.strictEqual(result.status, 'error');
	})
);

assert.doesNotReject(
	metascraper('http://nonexistingurl.nonexistingurl').then((result) => {
		assert.strictEqual(result.status, 'error');
	})
);

assert.doesNotReject(
	metascraper('https://gmail.com').then((result) => {
		assert.strictEqual(result.status, 'success');
		assert.strictEqual(typeof result.data, 'object');
		assert.strictEqual(result.data.publisher, 'Google');
	}),
	'Test with http2 domain'
);

assert.doesNotReject(
	metascraper('https://http2.github.io/').then((result) => {
		assert.strictEqual(result.status, 'success');
		assert.strictEqual(typeof result.data, 'object');
		assert.strictEqual(result.data.publisher, 'HTTP/2');
	}),
	'Test with http2 domain'
);

assert.doesNotReject(
	metascraper('https://www.youtube.com/watch?v=aqz-KE-bpKQ').then((result) => {
		assert.strictEqual(result.status, 'success');
		assert.strictEqual(typeof result.data, 'object');
		assert.strictEqual(result.data.publisher, 'YouTube');
		assert.strictEqual(result.data.image, 'https://img.youtube.com/vi/aqz-KE-bpKQ/maxresdefault.jpg');
		assert.strictEqual(result.data.url, 'https://www.youtube.com/watch?v=aqz-KE-bpKQ');
		assert.strictEqual(result.data.title, 'Big Buck Bunny 60fps 4K - Official Blender Foundation Short Film');
		assert.match(result.data.description, /Blender/i);
	})
);

assert.doesNotReject(
	metascraper('https://github.com/directus/directus').then((result) => {
		assert.strictEqual(result.status, 'success');
		assert.strictEqual(typeof result.data, 'object');
		assert.strictEqual(result.data.publisher, 'GitHub');
		assert.strictEqual(result.data.author, 'directus');
		assert.strictEqual(typeof result.data.image, 'string', 'Image is not string');
		assert.strictEqual(typeof result.data.url, 'string', 'URL is not string');
		assert.strictEqual(typeof result.data.logo, 'string', 'Logo is not string');
		assert.match(result.data.description, /🐰/i);
	})
);
