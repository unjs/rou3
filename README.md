# 🌳 radix3

<!-- automd:badges -->

[![npm version](https://img.shields.io/npm/v/radix3)](https://npmjs.com/package/radix3)
[![npm downloads](https://img.shields.io/npm/dm/radix3)](https://npmjs.com/package/radix3)

<!-- /automd -->

Lightweight and fast router for JavaScript.

> [!NOTE]
> You are on the main branch looking at v2 docs. See [v1 branch](https://github.com/unjs/radix3/tree/v1) for current release.

## Usage

**Install:**

<!-- automd:pm-install -->

```sh
# ✨ Auto-detect
npx nypm install radix3

# npm
npm install radix3

# yarn
yarn add radix3

# pnpm
pnpm install radix3

# bun
bun install radix3
```

<!-- /automd -->

**Import:**

<!-- automd:jsimport cdn cjs src="./src/index.ts"-->

**ESM** (Node.js, Bun)

```js
import {
  createRouter,
  addRoute,
  findRoute,
  removeRoute,
  matchAllRoutes,
} from "radix3";
```

**CommonJS** (Legacy Node.js)

```js
const {
  createRouter,
  addRoute,
  findRoute,
  removeRoute,
  matchAllRoutes,
} = require("radix3");
```

**CDN** (Deno, Bun and Browsers)

```js
import {
  createRouter,
  addRoute,
  findRoute,
  removeRoute,
  matchAllRoutes,
} from "https://esm.sh/radix3";
```

<!-- /automd -->

**Create a router instance and insert routes:**

```js
import { createRouter, addRoute } from "radix3";

const router = createRouter(/* options */);

addRoute(router, "/path", { payload: "this path" });
addRoute(router, "/path/:name", { payload: "named route" });
addRoute(router, "/path/foo/**", { payload: "wildcard route" });
addRoute(router, "/path/foo/**:name", { payload: "named wildcard route" });
```

**Match route to access matched data:**

```js
// Returns { payload: 'this path' }
findRoute(router, "/path");

// Returns { payload: 'named route', params: { name: 'fooval' } }
findRoute(router, "/path/fooval");

// Returns { payload: 'wildcard route' }
findRoute(router, "/path/foo/bar/baz");

// Returns undefined (no route matched for/)
findRoute(router, "/");
```

## Methods

## Options

You can initialize router instance with options:

```ts
const router = createRouter({
  strictTrailingSlash: true,
});
```

- `strictTrailingSlash`: By default router ignored trailing slash for matching and adding routes. When set to `true`, matching with trailing slash is different.

## Performance

See [benchmark](./benchmark).

## License

Based on original work of [`charlieduong94/radix-router`](https://github.com/charlieduong94/radix-router)
by [Charlie Duong](https://github.com/charlieduong94) (MIT)

[MIT](./LICENSE) - Made with ❤️

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/radix3?style=flat&colorA=18181B&colorB=F0DB4F
[npm-version-href]: https://npmjs.com/package/radix3
[npm-downloads-src]: https://img.shields.io/npm/dm/radix3?style=flat&colorA=18181B&colorB=F0DB4F
[npm-downloads-href]: https://npmjs.com/package/radix3
[codecov-src]: https://img.shields.io/codecov/c/gh/unjs/radix3/main?style=flat&colorA=18181B&colorB=F0DB4F
[codecov-href]: https://codecov.io/gh/unjs/radix3
[bundle-src]: https://img.shields.io/bundlephobia/minzip/radix3?style=flat&colorA=18181B&colorB=F0DB4F
[bundle-href]: https://bundlephobia.com/result?p=radix3
[license-src]: https://img.shields.io/github/license/unjs/radix3.svg?style=flat&colorA=18181B&colorB=F0DB4F
[license-href]: https://github.com/unjs/radix3/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsDocs.io-reference-18181B?style=flat&colorA=18181B&colorB=F0DB4F
[jsdocs-href]: https://www.jsdocs.io/package/radix3
