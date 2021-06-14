import Interface from "./interface.vue";

export default {
	id: "extension-linkpreview",
	name: "Link Preview",
	description:
		"Store link metadata using Open Graph, JSON+LD, oEmbed or HTML metadata",
	icon: "preview",
	component: Interface,
	recommendedDisplays: ["formatted-json-value"],
	types: ["json"],
	options: [
		{
			field: "placeholder",
			name: "Placeholder",
			meta: {
				width: "half",
				interface: "text-input"
			},
			schema: {
				default_value: "Enter link URL..."
			}
		},
		{
			field: "service",
			name: "Scrape Service",
			type: "string",
			meta: {
				width: "half",
				interface: "select-dropdown",
				options: {
					choices: [
						{ value: "", text: "LinkPreview Extension" },
						{ value: "microlink", text: "microlink.io" }
					]
				}
			},
			schema: {
				default_value: ""
			}
		},
		{
			field: "url_allowlist",
			name: "URL Allow List ",
			type: "string",
			meta: {
				width: "full",
				interface: "tags",
				options: {
					placeholder:
						"Add allowed URLs, leave empty to allow all. (eg: example.com/*/embed)",
					iconRight: "filter_alt"
				}
			}
		},
		{
			field: "preview",
			name: "Preview",
			type: "csv",
			schema: {
				default_value: ["image", "url", "title"]
			},
			meta: {
				width: "half",
				interface: "select-multiple-dropdown",
				options: {
					placeholder: "None",
					choices: [
						{ value: "image", text: "image" },
						{ value: "url", text: "url" },
						{ value: "title", text: "title" },
						{ value: "publisher", text: "publisher" },
						{ value: "author", text: "author" },
						{ value: "date", text: "date" },
						{ value: "lang", text: "lang" },
						{ value: "logo", text: "logo" },
						{ value: "iframe", text: "iframe" }
					]
				}
			}
		},
		{
			field: "store",
			name: "Store Only",
			type: "csv",
			schema: {
				default_value: []
			},
			meta: {
				width: "half",
				interface: "select-multiple-dropdown",
				options: {
					allowNone: true,
					placeholder: "All",
					choices: [
						{ value: "image", text: "image" },
						{ value: "title", text: "title" },
						{ value: "publisher", text: "publisher" },
						{ value: "author", text: "author" },
						{ value: "audio", text: "author" },
						{ value: "date", text: "date" },
						{ value: "lang", text: "lang" },
						{ value: "logo", text: "logo" },
						{ value: "video", text: "video" },
						{ value: "iframe", text: "iframe" }
					]
				}
			}
		}
	]
};
