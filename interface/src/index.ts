import { defineInterface } from '@directus/shared/utils';
import InterfaceComponent from './interface.vue';

export default defineInterface({
	id: 'extension-linkmeta',
	name: 'Link Meta',
	description: 'Store link metadata using Open Graph, JSON+LD, oEmbed or HTML metadata',
	icon: 'link',
	component: InterfaceComponent,
	recommendedDisplays: ['formatted-json-value'],
	types: ['json'],
	options: [
		{
			field: 'placeholder',
			name: '$t:placeholder',
			meta: {
				width: 'full',
				interface: 'text-input',
				options: {
					placeholder: '$t:enter_a_placeholder',
				},
			},
			schema: {
				default_value: '',
			},
		},
		{
			field: 'trigger',
			name: '$t:interfaces.input-autocomplete-api.trigger',
			type: 'string',
			schema: {
				default_value: 'debounce',
			},
			meta: {
				width: 'half',
				interface: 'select-dropdown',
				options: {
					choices: [
						{
							text: 'Throttle',
							value: 'throttle',
						},
						{
							text: 'Debounce',
							value: 'debounce',
						},
					],
				},
			},
		},
		{
			field: 'rate',
			name: '$t:interfaces.input-autocomplete-api.rate',
			type: 'integer',
			schema: {
				default_value: 500,
			},
			meta: {
				width: 'half',
				interface: 'input',
			},
		},
		{
			field: 'url_allowlist',
			name: 'URL Allow List ',
			type: 'string',
			meta: {
				width: 'full',
				interface: 'tags',
				options: {
					placeholder: 'Add allowed URLs, leave empty to allow all. (eg: example.com/*/embed)',
					iconRight: 'filter_alt',
				},
			},
		},
		{
			field: 'preview',
			name: '$t:layout_preview',
			type: 'csv',
			schema: {
				default_value: ['image', 'title'],
			},
			meta: {
				width: 'half',
				interface: 'select-multiple-dropdown',
				options: {
					placeholder: '$t:none',
					choices: [
						{ value: 'image', text: 'image' },
						{ value: 'title', text: 'title' },
						{ value: 'publisher', text: 'publisher' },
						{ value: 'author', text: 'author' },
						{ value: 'audio', text: 'audio' },
						{ value: 'date', text: 'date' },
						{ value: 'lang', text: 'lang' },
						{ value: 'logo', text: 'logo' },
						{ value: 'video', text: 'video' },
						{ value: 'iframe', text: 'iframe' },
					],
				},
			},
		},
		{
			field: 'store',
			name: '$t:save',
			type: 'csv',
			schema: {
				default_value: [],
			},
			meta: {
				width: 'half',
				interface: 'select-multiple-dropdown',
				options: {
					allowNone: true,
					placeholder: '$t:all',
					choices: [
						{ value: 'image', text: 'image' },
						{ value: 'title', text: 'title' },
						{ value: 'publisher', text: 'publisher' },
						{ value: 'author', text: 'author' },
						{ value: 'audio', text: 'audio' },
						{ value: 'date', text: 'date' },
						{ value: 'lang', text: 'lang' },
						{ value: 'logo', text: 'logo' },
						{ value: 'video', text: 'video' },
						{ value: 'iframe', text: 'iframe' },
					],
				},
			},
		},
		{
			field: 'service',
			name: 'Scrape Service',
			type: 'string',
			meta: {
				width: 'half',
				interface: 'select-dropdown',
				options: {
					choices: [
						{ value: '', text: 'LinkMeta Extension' },
						{ value: 'api.microlink.io', text: 'microlink.io (Free)' },
						{ value: 'pro.microlink.io', text: 'microlink.io (Pro)' },
					],
				},
			},
			schema: {
				default_value: '',
			},
		},
		{
			field: 'apikey',
			name: '$t:fields.directus_users.token',
			meta: {
				width: 'half',
				interface: 'text-input',
				hidden: true,
				options: {
					placeholder: '$t:fields.directus_users.token_placeholder',
					iconLeft: 'vpn_key',
					font: 'monospace',

				},
				conditions: [
					{
						name: 'hide',
						rule: {
							"service": {
								"_in": ['pro.microlink.io']
							}
						},
						hidden: false,
					},
				],
			},
			schema: {
				default_value: '',
			},
		},
	],
});
