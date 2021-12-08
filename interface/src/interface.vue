<template>
	<div class="linkmeta">
		<v-input
			:disabled="disabled"
			:autofocus="autofocus"
			:placeholder="placeholder"
			:model-value="localUrl"
			class="url-input"
			@update:model-value="onChange"
		>
			<template #prepend>
				<v-icon v-if="loading" v-tooltip="t('loading')" class="loading" name="motion_photos_on" />
				<v-icon v-else-if="!isChanged && value" v-tooltip="t('success')" name="done_all" />
				<v-icon v-else name="link" />
			</template>

			<template v-if="!loading" #append>
				<v-icon v-if="canRefresh" v-tooltip="t('update')" name="refresh" @click="onRefresh" />
			</template>
		</v-input>

		<div>
			<v-notice v-if="localUrl && value && Object.keys(value).length === 1" type="warning" class="noround">
				{{ t('errors.INVALID_PAYLOAD') }}
			</v-notice>

			<v-notice v-else-if="error" type="warning" class="noround">
				{{ error }}
			</v-notice>

			<div v-else-if="preview.length > 0 && value" class="preview">
				<div
					v-for="previewItem in preview"
					:key="previewItem"
					class="preview-item"
					:class="'preview-item-' + previewItem"
				>
					<div class="property">{{ previewItem }}</div>
					<div class="value">
						<img
							v-if="['image', 'logo'].includes(previewItem) && value[previewItem]"
							:src="getImageUrl(value[previewItem])"
						/>
						<a
							v-else-if="previewItem === 'url' && value[previewItem]"
							:href="value[previewItem]"
							rel="noopener"
							target="_blank"
						>
							{{ value[previewItem] }}
						</a>
						<div
							v-else-if="previewItem === 'iframe' && value[previewItem]"
							class="iframe-wrapper-bound"
							v-html="value[previewItem]"
						/>
						<var v-else-if="value[previewItem]">{{ value[previewItem] }}</var>
						<value-null v-else />
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import axios, { AxiosPromise } from 'axios';
import { throttle, debounce } from 'lodash';
import { useI18n } from 'vue-i18n';
import { defineComponent, ref, watch, computed, inject, PropType } from 'vue';

export default defineComponent({
	props: {
		value: {
			type: Object as PropType<Record<string, any>>,
			default: null,
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
			type: Array as PropType<string[]>,
			default: () => [],
		},
		preview: {
			type: Array as PropType<string[]>,
			default: () => ['image', 'title', 'url'],
		},
		store: {
			type: Array as PropType<string[]>,
			default: () => ['image', 'url', 'title', 'publisher', 'author', 'date', 'lang', 'logo', 'iframe'],
		},
	},
	emits: ['input'],
	setup(props, { emit }) {
		const { t } = useI18n();
		const api = inject('api');
		const error = ref<string | null>(null);
		const loading = ref<boolean>(false);
		const localUrl = ref<string>(props.value && props.value.url ? props.value.url : '');

		const fetchResults =
			props.trigger === 'debounce'
				? debounce(processUrl, Number(props.rate))
				: throttle(processUrl, Number(props.rate));

		const patterns = props.urlAllowList.map(
			(pattern) => new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\*/giu, '.*'), 'i')
		);

		const isChanged = computed(() => localUrl.value !== (props.value && props.value.url ? props.value.url : ''));

		const canRefresh = computed(() => props.value && props.value.url && isChanged);

		watch(
			() => props.value,
			(newVal, oldVal) => {
				if (oldVal === newVal) return;

				if (newVal && newVal.url) {
					localUrl.value = newVal.url;
				}
			}
		);

		return {
			t,

			error,
			loading,

			localUrl,

			isChanged,
			canRefresh,

			getImageUrl,

			onRefresh,
			onChange,
		};

		function isUrlAllowed(url: string): boolean {
			if (!patterns || patterns.length < 1) return true;
			return patterns.some((pattern) => pattern.test(url));
		}

		function isValidUrl(url: string): boolean {
			if (!url) return false;

			try {
				new URL(url);
				return isUrlAllowed(url);
			} catch {
				return false;
			}
		}

		function onChange(newUrl: string) {
			if (!newUrl) {
				localUrl.value = '';
				error.value = null;
				emit('input', null);
				return;
			}

			localUrl.value = newUrl.trim();
			fetchResults(localUrl.value);
		}

		function onRefresh() {
			processUrl(localUrl.value);
		}

		async function processUrl(url: string) {
			if (!url) {
				error.value = null;
				localUrl.value = '';
				emit('input', null);
				return;
			}

			if (!isValidUrl(url)) {
				error.value = t('errors.INVALID_QUERY');
				emit('input', null);
				return;
			}

			loading.value = true;
			error.value = null;

			try {
				const response = (await createFetcher(url)).data;
				if (response.status !== 'success' || !response.data) {
					throw Error(response.message);
				}

				const data: Record<string, any> = response.data;

				// Force storing original URL.
				data.url = url;

				if (props.store && props.store.length > 0) {
					emit(
						'input',
						Object.assign({}, ...props.store.map((key: string) => (key in data ? { [key]: data[key] } : {})))
					);
				} else {
					emit('input', data);
				}
			} catch (err) {
				error.value = err.toString();
				emit('input', null);
			}

			loading.value = false;
		}

		function createFetcher(url: string): AxiosPromise<any> {
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
	},
});

function getImageUrl(imageObject: { url: string } | string) {
	if (typeof imageObject === 'string') return imageObject;

	if (typeof imageObject === 'object' && imageObject.url) return imageObject.url;
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

.url-input:deep(.input) {
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
	border-top-left-radius: 0 !important;
	border-top-right-radius: 0 !important;
}

.preview {
	background-color: var(--v-card-background-color);
	border-top: var(--border-width) solid var(--border-normal);
	border-bottom-left-radius: var(--border-radius);
	border-bottom-right-radius: var(--border-radius);
	display: table;
	table-layout: fixed;
	width: 100%;
	vertical-align: top;
}

.preview-item {
	display: table-row;
}

.preview-item .property,
.preview-item .value {
	display: table-cell;
	vertical-align: top;
	padding: 8px;
}

.preview-item .property {
	border-right: var(--border-width) solid var(--border-subdued);
	width: 120px;
	font-weight: 600;
	text-align: right;
}

.preview a {
	color: var(--primary);
	text-decoration: underline;
	overflow-wrap: break-word;
}

.preview-item img {
	max-width: 100%;
	max-height: 240px;
	height: auto;
	width: auto;
	object-fit: contain;
}

.preview-item-logo img {
	max-height: 96px;
}

.preview-item-iframe .value {
	width: 360px;
	max-width: 100%;
}

.iframe-wrapper-bound {
	position: relative;
	height: 0;
	padding-bottom: 56.25%;
}

.iframe-wrapper-bound :deep(iframe) {
	position: absolute !important;
	top: 0 !important;
	left: 0 !important;
	width: 100% !important;
	height: 100% !important;
}
</style>
