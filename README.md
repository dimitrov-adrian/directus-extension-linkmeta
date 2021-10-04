> ### This extension is in development and most probably will have file structure change when Directus 9 official releases. Meanwhile breaking changes are possible in anytime.

![](https://repository-images.githubusercontent.com/318790147/a5879480-cd17-11eb-8375-7c68f2d2ebab)

## Installation

In your Directus installation root

```bash
npm install dimitrov-adrian/directus-extension-linkmeta
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
