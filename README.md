# LinkPreview Extension Bundle

![](https://repository-images.githubusercontent.com/318790147/a5879480-cd17-11eb-8375-7c68f2d2ebab)

> ### This extension is in development and could have breaking changes until Directus 9 official releases.

## How to install

This extension is from two parts - interface and endpoint, in order to get work as expected,
you need to install both of them. In theory each could works independans, but the point is not this.

```bash
cd <your directus project>/extensions
git clone https://github.com/dimitrov-adrian/directus-extension-linkpreview endpoints/linkpreview
(cd endpoints/linkpreview && npm i)
(cd interfaces && ln -s ../endpoints/linkpreview/dist/extensions/interfaces/linkpreview .)
```

Restart directus

## How to use

The interface extension uses `JSON` type to store metadata.

1. Create new standard field with JSON type
2. For interface select **LinkPreview** and set **LinkPreview Extension** for scrape service
