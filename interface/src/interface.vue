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
				<v-icon v-if="loading" name="more_horiz" />
				<v-icon v-else-if="!isChanged && value" v-tooltip="t('success')" name="done_all" />
				<v-icon v-else name="link" />
			</template>

			<template #append>
				<v-icon v-if="loading" v-tooltip="t('loading')" class="loading" name="motion_photos_on" />
				<v-icon v-else-if="canRefresh" v-tooltip="t('update')" class="refresh" name="refresh" @click="onRefresh" />
			</template>
		</v-input>

		<div>
			<v-notice v-if="localUrl && value && Object.keys(value).length === 1" type="warning" class="noround">
				{{ t('errors.INVALID_PAYLOAD') }}
			</v-notice>

			<v-notice v-else-if="currentError" type="warning" class="noround">
				{{ currentError }}
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
							v-if="!service && ['image', 'logo'].includes(previewItem) && value[previewItem]"
							:src="getImageUrl(value[previewItem])"
						/>

						<a
							v-else-if="['image', 'logo', 'url'].includes(previewItem) && value[previewItem]"
							:href="value[previewItem]"
							rel="noopener"
							target="_blank"
						>
							{{ value[previewItem] }}
						</a>

						<var v-else-if="value[previewItem]">{{ value[previewItem] }}</var>

						<value-null v-else />
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import axios, { AxiosPromise, Axios } from 'axios';
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
		const api = inject('api') as Axios;
		const currentError = ref<string | null>(null);
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

			currentError,
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
				currentError.value = null;
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
				currentError.value = null;
				localUrl.value = '';
				emit('input', null);
				return;
			}

			if (!isValidUrl(url)) {
				currentError.value = t('errors.INVALID_QUERY');
				emit('input', null);
				return;
			}

			loading.value = true;
			currentError.value = null;

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
			} catch (error: any) {
				if (error) {
					currentError.value = error.toString();
				} else {
					currentError.value = t('unexpected_error');
				}

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

			const headers: Record<string, any> = {
				'Content-Type': 'application/json',
			};

			if (props.apikey) {
				headers.apiKey = props.apikey;
			}

			return axios(`https://${props.service}?url=${encodeURIComponent(url)}`, { headers });
		}

		function getToken(): string | null {
			return api.defaults.headers.common['Authorization']?.split(' ')[1] || null;
		}

		function getImageUrl(imageObject: { url: string } | string) {
			const imgSrc =
				typeof imageObject === 'string'
					? imageObject
					: typeof imageObject === 'object' && imageObject.url
					? imageObject.url
					: null;

			if (!imgSrc) return;

			return `/directus-extension-linkmeta-endpoint/img?url=${encodeURIComponent(imgSrc)}&access_token=${getToken()}`;
		}
	},
});
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

.refresh {
	cursor: pointer;
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
	display: table;
	width: 100%;
	vertical-align: top;
	table-layout: fixed;
	background-color: var(--v-card-background-color);
	border-top: var(--border-width) solid var(--border-normal);
	border-bottom-right-radius: var(--border-radius);
	border-bottom-left-radius: var(--border-radius);
}

.preview-item {
	display: table-row;
}

.preview-item .property,
.preview-item .value {
	display: table-cell;
	padding: 0.4em;
	vertical-align: top;
}

.preview-item .property {
	width: 120px;
	font-weight: 600;
	text-align: right;
	border-right: var(--border-width) solid var(--border-subdued);
}

.preview-item .value var {
	white-space: pre-wrap;
	cursor: text;
	user-select: all;
}

.preview-item .value a {
	color: var(--primary);
	text-decoration: underline;
	overflow-wrap: break-word;
	user-select: all;
}

.preview-item .value img {
	width: auto;
	max-width: 100%;
	height: auto;
	max-height: 24vh;
	object-fit: contain;
}

.preview-item.preview-item-logo .value img {
	max-height: 4em;
}
</style>
