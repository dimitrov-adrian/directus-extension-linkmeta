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
				interface: "dropdown",
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
			field: "preview",
			name: "Preview",
			type: "csv",
			schema: {
				default_value: ["image", "url", "title"]
			},
			meta: {
				width: "half",
				interface: "dropdown-multiselect",
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
				interface: "dropdown-multiselect",
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
