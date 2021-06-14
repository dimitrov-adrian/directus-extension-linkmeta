<template>
	<div class="linkpreview">
		<v-input
			:disabled="disabled || loading"
			:placeholder="placeholder"
			:value="localUrl"
			class="url-input"
			@change="changeUrlHandler"
			@input="inputUrlHandler"
		>
			<template #prepend>
				<v-icon v-if="loading" class="loading" name="timelapse" />
				<v-icon
					v-else-if="value && value.url && Object.keys(value).length === 1"
					name="sync_problem"
					v-tooltip="$t('errors.INVALID_QUERY')"
				/>
				<v-icon
					v-else-if="localUrl && !isUri(localUrl)"
					name="priority_high"
					v-tooltip="$t('invalid_url')"
				/>
				<v-icon
					v-else-if="localUrl && value && value.url && value.url === localUrl"
					name="verified"
					v-tooltip="$t('success')"
				/>
				<v-icon v-else name="link" />
			</template>
			<template v-if="!loading" #append>
				<v-icon
					v-if="canRefresh"
					v-tooltip="$t('update')"
					name="refresh"
					@click="refresh"
				/>
				<v-icon
					v-else-if="isUri(localUrl)"
					v-tooltip="$t('update')"
					name="done"
					@click="changeUrlHandlerFromLocal"
				/>
			</template>
		</v-input>

		<transition-expand>
			<v-notice v-if="hasError" type="warning">
				{{ hasError }} &nbsp; <a @click="setOnlyUrl" class="a">Set it anyway</a>
			</v-notice>

			<v-list
				v-else-if="
					preview && preview.length > 0 && value && typeof value === 'object'
				"
				class="preview"
			>
				<v-list-item
					v-for="previewItem in preview"
					v-if="value[previewItem]"
					:key="previewItem"
					:class="'preview-item-' + previewItem"
				>
					<template
						v-if="['image', 'logo'].includes(previewItem) && value[previewItem]"
					>
						<img :src="getImageUrl(value[previewItem])" rel="noopener" />
					</template>
					<template v-else-if="previewItem === 'url' && value[previewItem]">
						<a :href="value[previewItem]" rel="noopener" target="_blank">
							{{ value[previewItem] }}
						</a>
					</template>
					<template v-else-if="previewItem === 'iframe' && value[previewItem]">
						<div class="iframe-wrapper-bound">
							<div class="iframe-wrapper" v-html="value[previewItem]"></div>
						</div>
					</template>
					<template v-else-if="value[previewItem]">
						<code class="property">{{ previewItem }}</code>
						<var v-if="value[previewItem]">{{ value[previewItem] }}</var>
						<value-null v-else />
					</template>
				</v-list-item>
			</v-list>
		</transition-expand>
	</div>
</template>

<script>
function escapeRegExp(string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default {
	inject: ["system"],
	props: {
		value: {
			type: Object,
			default: () => ({})
		},
		disabled: {
			type: Boolean,
			default: false
		},
		placeholder: {
			type: String,
			default: null
		},
		service: {
			type: String,
			default: ""
		},
		url_allowlist: {
			type: Array,
			default: () => []
		},
		preview: {
			type: Array,
			default: () => ["image", "title", "url"]
		},
		store: {
			type: Array,
			default: () => [
				"image",
				"url",
				"title",
				"publisher",
				"author",
				"date",
				"lang",
				"logo",
				"iframe"
			]
		}
	},

	data: function() {
		const patterns = this.url_allowlist.map(
			pattern => new RegExp(escapeRegExp(pattern).replace(/\\\*/giu, ".*"), "i")
		);

		return {
			loading: false,
			localUrl: this.value?.url,
			hasError: false,
			patterns
		};
	},

	watch: {
		value: function(newVal, oldVal) {
			if (!oldVal && newVal.url) {
				this.localUrl = newVal.url.trim();
			}
		}
	},

	computed: {
		canRefresh: function() {
			return (
				this.value?.url && this.localUrl && this.localUrl === this.value?.url
			);
		}
	},

	methods: {
		isUri: function(url) {
			try {
				new URL(url);
			} catch (error) {
				return false;
			}
			if (!this.patterns || this.patterns.length < 1) return true;
			return this.patterns.some(pattern => pattern.test(url));
		},

		refresh: function() {
			if (this.value?.url) {
				this.processUrl(this.value.url);
			}
		},

		processUrlByMicrolink: function(url) {
			return this.system.axios.get(
				`https://api.microlink.io?url=${encodeURIComponent(url)}`,
				{
					headers: {
						"Content-Type": "application/json"
					}
				}
			);
		},

		processUrlByExtension: function(url) {
			return this.system.api.get(
				`/custom/linkpreview?url=${encodeURIComponent(url)}`,
				{
					headers: {
						"Content-Type": "application/json"
					}
				}
			);
		},

		setOnlyUrl: function() {
			this.$emit("input", {
				url: this.localUrl
			});
		},

		processUrl: function(url) {
			if (!url) {
				this.hasError = false;
				this.localUrl = "";
				this.$emit("input", null);
				return;
			}

			if (this.localUrl && this.value?.url === this.localUrl && this.hasError) {
				this.hasError = false;
				return;
			}

			if (!this.isUri(url)) {
				this.hasError = "Invalid URL";
				return;
			}

			this.loading = true;
			this.hasError = false;

			const requester =
				{
					microlink: this.processUrlByMicrolink
				}[this.$props.service] || this.processUrlByExtension;

			requester(url)
				.then(response => response.data)
				.then(response => {
					this.loading = false;
					if (response.status === "success" && response.data) {
						return response.data;
					} else {
						throw Error(response.message);
					}
				})
				.then(data => {
					this.localUrl = url;
					if (this.store && this.store.length > 0) {
						const result = {
							url: url
						};
						for (const key of this.store) {
							if (data[key]) {
								result[key] = data[key];
							}
						}
						this.$emit("input", result);
					} else {
						this.$emit("input", data);
					}
				})
				.catch(error => {
					this.hasError = error.toString();
				});
		},

		changeUrlHandler: function(event) {
			const url = event.target.value.trim();
			this.localUrl = url;
			this.processUrl(url);
		},

		changeUrlHandlerFromLocal: function() {
			this.processUrl(this.localUrl);
		},

		inputUrlHandler: function(newValue) {
			this.localUrl = newValue;
		},

		getImageUrl: function(imageObject) {
			if (typeof imageObject === "string") {
				return imageObject;
			} else {
				if (typeof imageObject === "object" && imageObject.url) {
					return imageObject.url;
				} else {
					return null;
				}
			}
		}
	}
};
</script>

<style lang="css" scoped>
@keyframes spin {
	100% {
		transform: rotate(360deg);
	}
}

.linkpreview {
	border: var(--border-width) solid var(--border-normal);
	border-radius: var(--border-radius);
}

.linkpreview:hover {
	color: var(--v-input-color);
	background-color: var(--background-page);
	border-color: var(--border-normal-alt);
}

.linkpreview:focus-within {
	color: var(--v-input-color);
	background-color: var(--background-page);
	border-color: var(--primary);
}

.a {
	cursor: pointer;
	text-decoration: underline;
}

.url-input {
	--v-input-font-family: var(--family-monospace);
}

.url-input >>> .input {
	border: none;
}

.loading {
	animation: spin 1s infinite;
	animation-timing-function: linear;
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
	content: ":";
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

.preview-item-iframe .iframe-wrapper-bound .iframe-wrapper >>> iframe {
	position: absolute !important;
	top: 0 !important;
	left: 0 !important;
	width: 100% !important;
	height: 100% !important;
}
</style>
