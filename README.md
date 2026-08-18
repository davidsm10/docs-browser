# Docs browser

Simple documents browser [webxdc](https://webxdc.org).

## Getting the documents archives

- [MDN](http://developer.mozilla.org/): Follow the build instructions at https://github.com/davidsm10/mdn-static-files and optionally remove some folders before packing the .tar.xz file.

- [Webxdc](https://webxdc.org): Follow the build instructions at https://github.com/webxdc/website/blob/main/src-docs/README.md but use https://github.com/camerondugan/mdbook-tiny/ as backend/renderer for mdbook and then pack the output from the tiny renderer in a .tar.xz archive.

## Reuse with other documents archives

You can reuse the webxdc frontend with other documents as long as they are .tar.xz archives with static html or markdown files.

Add the .tar.xz files in the root of the project and edit the `docs.json` file with the updated list of the files like in the next example:

```json
["archive1.tar.xz", "archive2.tar.xz"]
```

## Development

### Install dependencies

```sh
pnpm install
```

### Run in the browser

```sh
pnpm dev
```

### Build

```sh
pnpm build
```
