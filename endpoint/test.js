const assert = require("assert");
const metascraper = require("./fetcher-metascraper.js");

assert.doesNotReject(
	metascraper("http/invalidurl").then(result => {
		assert.strictEqual(result.status, "error");
	})
);

assert.doesNotReject(
	metascraper("http://nonexistingurl.nonexistingurl").then(result => {
		assert.strictEqual(result.status, "error");
	})
);

assert.doesNotReject(
	metascraper("https://www.youtube.com/watch?v=aqz-KE-bpKQ").then(result => {
		assert.strictEqual(result.status, "success");
		assert.strictEqual(typeof result.data, "object");
		assert.strictEqual(result.data.publisher, "YouTube");
		assert.strictEqual(
			result.data.image,
			"https://img.youtube.com/vi/aqz-KE-bpKQ/maxresdefault.jpg"
		);
		assert.strictEqual(
			result.data.url,
			"https://www.youtube.com/watch?v=aqz-KE-bpKQ"
		);
		assert.strictEqual(
			result.data.title,
			"Big Buck Bunny 60fps 4K - Official Blender Foundation Short Film"
		);
		assert.match(result.data.description, /Blender/i);
		console.log("OK, Data", result.data);
	})
);

assert.doesNotReject(
	metascraper("https://github.com/directus/directus").then(result => {
		assert.strictEqual(result.status, "success");
		assert.strictEqual(typeof result.data, "object");
		assert.strictEqual(result.data.publisher, "GitHub");
		assert.strictEqual(result.data.author, "directus");
		assert.strictEqual(
			result.data.image,
			"https://repository-images.githubusercontent.com/7122594/419d3580-d649-11ea-9a91-a9e845a215da"
		);
		assert.strictEqual(result.data.url, "https://github.com/directus/directus");
		assert.strictEqual(
			result.data.logo,
			"https://github.githubassets.com/favicons/favicon.svg"
		);
		assert.match(result.data.description, /🐰/i);
		console.log("OK, Data", result.data);
	})
);
