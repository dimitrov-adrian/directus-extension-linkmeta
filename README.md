![](https://raw.githubusercontent.com/dimitrov-adrian/directus-extension-linkmeta/main/screenshot.png)

## Installation

In your Directus installation root

```bash
npm install directus-extension-linkmeta
```

Restart directus

## How to use

The interface extension uses `JSON` type to store metadata.

1. Create new standard field with JSON type
2. For interface select **LinkMeta** and set **LinkMeta Extension** for scrape service

## FAQ

### What a the api.microlink.io and pro.microlink.io options?

These options make requests to https://microlink.io/ service API. The hosted solution has some benefits like better
performance because of cache in their side. You could take a look on their site. And the pro version requires custom API
token to be set.

### What service to choose?

Except if you not need some super performance and analytics to be made, inhouse extension service (selected by default)
is best bang.
