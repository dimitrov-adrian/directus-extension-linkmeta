import Interface from './interface.vue';

export default {
	id: 'extension-linkpreview',
	name: 'Link Preview',
	description: 'Store link metadata using Open Graph, JSON+LD, oEmbed or HTML metadata',
	icon: 'preview',
	component: Interface,
	recommendedDisplays: ['formatted-json-value'],
	types: ['json'],
	options: [
		{
			field: 'placeholder',
			name: 'Placeholder',
			meta: {
				width: 'half',
				interface: 'text-input',
			},
		},
		{
			field: 'service',
			name: 'Scrape Service',
			type: 'string',
			meta: {
				width: 'half',
				interface: 'dropdown',
				options: {
					choices: [
						{value: '', text: 'LinkPreview Extension'},
						{value: 'microlink', text: 'microlink.io'},
					],
				},
			},
			schema: {
				default_value: '',
			},
		},
		{
			field: 'preview',
			name: 'Preview',
			type: 'csv',
			schema: {
				default_value: ['image', 'url', 'title'],
			},
			meta: {
				width: 'half',
				interface: 'dropdown-multiselect',
				options: {
					choices: [
						{value: 'image', text: 'image'},
						{value: 'url', text: 'url'},
						{value: 'title', text: 'title'},
						{value: 'publisher', text: 'publisher'},
						{value: 'author', text: 'author'},
						{value: 'date', text: 'date'},
						{value: 'lang', text: 'lang'},
						{value: 'logo', text: 'logo'},
						{value: 'iframe', text: 'iframe'},
					],
				},
			},
		},
	],
};
