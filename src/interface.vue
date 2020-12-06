<template>
  <div>

    <v-input :disabled="disabled"
             :value="localUrl"
             :placeholder="placeholder"
             class="url-input"
             @input="inputUrlHandler"
             @change="changeUrlHandler"
    >
      <template #prepend>
        <v-icon name="error" v-if="localUrl && !isUri(localUrl)"/>
        <v-icon name="verified" v-else-if="localUrl && value && value.url && value.url === localUrl"/>
        <v-icon name="link" v-else/>
      </template>
      <template #append>
        <v-icon v-if="canRefresh" name="sync" @click="refresh" v-tooltip="$t('update')"/>
        <v-icon v-else-if="isUri(localUrl)" name="done" @click="changeUrlHandlerFromLocal" v-tooltip="$t('update')"/>
      </template>
    </v-input>

    <v-notice type="warning" v-if="hasError">
      {{ hasError }}
    </v-notice>

    <transition-expand v-if="preview.length > 0">
      <div v-if="loading">
        <v-skeleton-loader>
          <div class="loading-text">{{ $t('loading') }}</div>
        </v-skeleton-loader>
      </div>
      <v-list v-else-if="value && typeof value === 'object'" class="preview">
        <v-list-item
            v-for="previewItem in preview"
            v-if="value[previewItem]"
            :key="previewItem"
            :class="'preview-item-' + previewItem"
        >
          <template v-if="['image', 'logo'].includes(previewItem) && value[previewItem]">
            <img :src="getImageUrl(value[previewItem])" rel="noopener"/>
          </template>
          <template v-else-if="previewItem === 'url' && value[previewItem]">
            <a :href="value[previewItem]" target="_blank" rel="noopener">
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
            <value-null v-else/>
          </template>
        </v-list-item>
      </v-list>
    </transition-expand>

  </div>
</template>

<script>
import validUrl from 'valid-url'

export default {
  inject: ['system'],
  props: {
    value: {
      type: Object,
      default: () => ({}),
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
      default: null,
    },
    service: {
      type: String,
      default: '',
    },
    preview: {
      type: Array,
      default: () => ['image', 'title', 'url'],
    },
  },

  data: function () {
    return {
      loading: false,
      localUrl: this.value?.url,
      hasError: false,
    }
  },

  watch: {
    value: function (newVal, oldVal) {
      if (!oldVal && newVal.url) {
        this.localUrl = newVal.url.trim()
      }
    },
  },

  computed: {
    canRefresh: function () {
      return this.value?.url && this.localUrl && this.localUrl === this.value?.url
    },
  },

  methods: {

    isUri: validUrl.isWebUri,

    refresh: function () {
      if (this.value?.url) {
        this.processUrl(this.value.url)
      }
    },

    processUrlByMicrolink: function (url) {
      return this.system.axios.get(`https://api.microlink.io?url=${encodeURIComponent(url)}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
    },

    processUrlByExtension: function (url) {
      return this.system.api.get(`/custom/directus-extension-linkpreview-endpoint?url=${encodeURIComponent(url)}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
    },

    processUrl: function (url) {
      if (!this.isUri(url)) {
        this.hasError = 'Invalid URL'
        return
      }

      this.loading = true
      this.hasError = false

      const requester = {
        microlink: this.processUrlByMicrolink,
      }[this.$props.service] || this.processUrlByExtension

      requester(url)
          .then(response => response.data)
          .then(response => {
            this.loading = false
            if (response.status === 'success' && response.data) {
              return response.data
            }
            else {
              throw Error(response.message)
            }
          })
          .then(data => {
            this.localUrl = url
            this.$emit('input', data)
          })
          .catch((error) => {
            this.hasError = error.toString()
          })
    },

    changeUrlHandler: function (event) {
      const url = event.target.value.trim()
      this.localUrl = url
      if (this.value && this.value.url && this.value.url === url) {
        return
      }
      this.processUrl(url)
    },

    changeUrlHandlerFromLocal: function () {
      if (this.localUrl) {
        this.processUrl(this.localUrl)
      }
    },

    inputUrlHandler: function (newValue) {
      this.localUrl = newValue
    },

    getImageUrl: function (imageObject) {
      if (typeof imageObject === 'string') {
        return imageObject
      }
      else if (typeof imageObject === 'object' && imageObject.url) {
        return imageObject.url
      }
      else {
        return null
      }
    },
  },
}
</script>

<style lang="css" scoped>
.url-input {
  --v-input-font-family: var(--family-monospace);
}

.loading-text {
  padding: 1em;
  text-align: center;
}

.preview {
  background-color: var(--v-card-background-color);
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
  margin-inline-end: .4em;
}

.preview .property:after {
  content: ':'
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

