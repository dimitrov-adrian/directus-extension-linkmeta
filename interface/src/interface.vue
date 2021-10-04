<template>
	<div class="linkmeta">
		<v-input
			:disabled="disabled"
			:autofocus="autofocus"
			:placeholder="placeholder"
			:model-value="localUrl"
			@update:model-value="onChange"
			class="url-input"
		>
			<template #prepend>
				<v-icon v-if="loading" class="loading" name="data_usage" v-tooltip="t('loading')" />
				<v-icon v-else-if="localUrl && !isValidUrl" name="priority_high" v-tooltip="t('errors.INVALID_QUERY')" />
				<v-icon v-else-if="!isChanged" name="verified" v-tooltip="t('success')" />
				<v-icon v-else name="link" />
			</template>

			<template v-if="!loading" #append>
				<v-icon v-if="canRefresh" v-tooltip="t('update')" name="refresh" @click="onRefresh" />
			</template>
		</v-input>

		<transition-expand>
			<v-notice v-if="error" type="warning" class="noround">
				{{ error }}
				<div class="spacer" />
				<button v-if="isChanged" @click="() => emit('input', { url: localUrl })">Set it anyway</button>
			</v-notice>

			<v-notice
				v-else-if="localValue && localValue.url && Object.keys(localValue).length === 1"
				type="warning"
				class="noround"
			>
				{{ t('errors.INVALID_PAYLOAD') }}
			</v-notice>

			<v-list v-else-if="preview.length > 0 && localValue" class="preview">
				<v-list-item v-for="previewItem in preview" :key="previewItem" :class="'preview-item-' + previewItem">
					<template v-if="!localValue[previewItem]">
						<code class="property">{{ previewItem }}</code>
						<value-null />
					</template>
					<img
						v-else-if="['image', 'logo'].includes(previewItem) && localValue[previewItem]"
						:src="getImageUrl(localValue[previewItem])"
						rel="noopener"
					/>
					<a
						v-else-if="previewItem === 'url' && localValue[previewItem]"
						:href="localValue[previewItem]"
						rel="noopener"
						target="_blank"
					>
						{{ localValue[previewItem] }}
					</a>
					<div v-else-if="previewItem === 'iframe' && localValue[previewItem]" class="iframe-wrapper-bound">
						<div class="iframe-wrapper" v-html="localValue[previewItem]"></div>
					</div>
					<template v-else-if="localValue[previewItem]">
						<code class="property">{{ previewItem }}</code>
						<var>{{ localValue[previewItem] }}</var>
					</template>
				</v-list-item>
			</v-list>
		</transition-expand>
	</div>
</template>

<script>
import axios from 'axios';
import { throttle, debounce } from 'lodash';
import { useI18n } from 'vue-i18n';
import { defineComponent, ref, watch, computed, inject } from 'vue';

export default defineComponent({
	emits: ['input'],
	props: {
		value: {
			type: Object,
			default: () => ({}),
		},
		disabled: {
			type: Boolean,
			default: false,
		},
		autofocus: {
			type: Boolean,
			default: false,
		},
		placeholder: {
			type: String,
			default: null,
		},
		trigger: {
			type: String,
			default: 'debounce',
		},
		rate: {
			type: [Number, String],
			default: 500,
		},
		service: {
			type: String,
			default: '',
		},
		apikey: {
			type: String,
			default: '',
		},
		urlAllowList: {
			type: Array,
			default: () => [],
		},
		preview: {
			type: Array,
			default: () => ['image', 'title', 'url'],
		},
		store: {
			type: Array,
			default: () => ['image', 'url', 'title', 'publisher', 'author', 'date', 'lang', 'logo', 'iframe'],
		},
	},

	setup(props, { emit }) {
		const { t } = useI18n();
		const api = inject('api');
		const error = ref(null);
		const loading = ref(false);
		const localUrl = ref(props.value && props.value.url ? props.value.url : '');
		const localValue = ref(props.value);
		const isValidUrl = computed(() => localUrl.value && isUrl(localUrl.value));
		const isChanged = computed(() => localUrl !== (props.value && props.value.url ? props.value.url : ''));
		const canRefresh = computed(
			() =>
				isValidUrl.value &&
				props.value &&
				props.value.url &&
				localValue.value &&
				localValue.value.url &&
				localValue.value.url === props.value.url
		);

		const patterns = props.urlAllowList.map(
			(pattern) => new RegExp(escapeRegExp(pattern).replace(/\\\*/giu, '.*'), 'i')
		);

		watch(
			() => props.value,
			(newVal, oldVal) => {
				if (oldVal === newVal) return;

				if (!newVal) {
					localUrl.value = '';
					localValue.value = {};
				} else if (newVal && newVal.url) {
					localUrl.value = newVal.url;
					localValue.value = newVal;
				}
			}
		);

		const fetchResults =
			props.trigger === 'debounce'
				? debounce(processUrl, Number(props.rate))
				: throttle(processUrl, Number(props.rate));

		return {
			t,

			error,
			loading,

			localUrl,
			localValue,

			isValidUrl,
			isChanged,
			isUrl,
			canRefresh,

			getImageUrl,

			onRefresh,
			onChange,
		};

		function onChange(newUrl) {
			if (!newUrl) {
				localUrl.value = '';
				localValue.value = null;
				return;
			}
			localUrl.value = newUrl.trim();
			fetchResults(localUrl.value);
		}

		function onRefresh() {
			if (localUrl.value && !isValidUrl.value) return;
			processUrl(localUrl.value);
		}

		function isUrl(url) {
			try {
				new URL(url);
			} catch {
				return false;
			}

			if (!patterns || patterns.length < 1) return true;
		}

		function processUrl(url) {
			if (!url) {
				error.value = null;
				localUrl.value = '';
				emit('input', null);
				return;
			}

			if (!isUrl(url)) {
				error.value = t('errors.INVALID_QUERY');
				return;
			}

			if (patterns.some((pattern) => pattern.test(url))) {
				error.value = t('validationError.neq').replace('{invalid}', url);
				return;
			}

			loading.value = true;
			error.value = null;

			return createFetcher(url)
				.then((response) => response.data)
				.then((response) => {
					if (response.status === 'success' && response.data) return response.data;

					throw Error(response.message);
				})
				.then((data) => {
					if (props.store && props.store.length > 0) {
						const result = {};
						for (const key of props.store) {
							if (key in data) {
								result[key] = data[key];
							}
						}
						return result;
					}

					return data;
				})
				.then((data) => {
					// Store original URL
					data.url = url;
					emit('input', data);
					return data;
				})
				.catch((err) => {
					error.value = err.toString();
				})
				.finally(() => {
					loading.value = false;
				});
		}

		function createFetcher(url) {
			if (!props.service) {
				return api.get(`/directus-extension-linkmeta-endpoint?url=${encodeURIComponent(url)}`, {
					headers: {
						'Content-Type': 'application/json',
					},
				});
			}

			const headers = {
				'Content-Type': 'application/json',
			};

			if (props.apikey) {
				headers.apiKey = props.apikey;
			}

			return axios(`https://${props.service}?url=${encodeURIComponent(url)}`, { headers });
		}

		function getImageUrl(imageObject) {
			if (typeof imageObject === 'string') return imageObject;
			if (typeof imageObject === 'object' && imageObject.url) return imageObject.url;
			return null;
		}
	},
});

function escapeRegExp(string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
</script>

<style lang="css" scoped>
@keyframes spin {
	100% {
		transform: rotate(360deg);
	}
}

.linkmeta {
	border: var(--border-width) solid var(--border-normal);
	border-radius: var(--border-radius);
}

.linkmeta:hover {
	color: var(--v-input-color);
	background-color: var(--background-page);
	border-color: var(--border-normal-alt);
}

.linkmeta:focus-within {
	color: var(--v-input-color);
	background-color: var(--background-page);
	border-color: var(--primary);
}

.url-input {
	--v-input-font-family: var(--family-monospace);
}

.url-input::v-deep(.input) {
	border: none;
}

.loading {
	animation: spin 1s infinite;
	animation-timing-function: linear;
}

.spacer {
	flex-grow: 1;
}

.noround {
	border-top-right-radius: 0 !important;
	border-top-left-radius: 0 !important;
}

.preview {
	background-color: var(--v-card-background-color);
	border-top-right-radius: 0;
	border-top-left-radius: 0;
	border-top: var(--border-width) solid var(--border-normal);
}

.preview a {
	color: var(--primary);
	text-decoration: underline;
}

.preview-item-image img {
	height: auto;
}

.preview .property {
	font-weight: 600;
	margin-inline-end: 0.4em;
}

.preview .property:after {
	content: ':';
}

.preview-item-image img,
.preview-item-iframe .iframe-wrapper-bound {
	width: 360px;
	max-width: 100%;
}

.preview-item-iframe .iframe-wrapper-bound .iframe-wrapper {
	position: relative;
	padding-bottom: 56.25%;
	height: 0;
}

.preview-item-iframe .iframe-wrapper-bound .iframe-wrapper::v-deep(iframe) {
	position: absolute !important;
	top: 0 !important;
	left: 0 !important;
	width: 100% !important;
	height: 100% !important;
}
</style>
