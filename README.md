# 🌳 rou3

<!-- automd:badges -->

[![npm version](https://img.shields.io/npm/v/rou3)](https://npmjs.com/package/rou3)
[![npm downloads](https://img.shields.io/npm/dm/rou3)](https://npmjs.com/package/rou3)

<!-- /automd -->

Lightweight and fast router for JavaScript.

> [!NOTE]
> Radix3 migrated to Rou3! See [#108](https://github.com/unjs/radix3/issues/108) for notes and [radix3 branch](https://github.com/unjs/rou3/tree/radix3) for legacy codebase.

## Usage

**Install:**

<!-- automd:pm-install -->

```sh
# ✨ Auto-detect
npx nypm install rou3

# npm
npm install rou3

# yarn
yarn add rou3

# pnpm
pnpm install rou3

# bun
bun install rou3
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
} from "rou3";
```

**CommonJS** (Legacy Node.js)

```js
const {
  createRouter,
  addRoute,
  findRoute,
  removeRoute,
  matchAllRoutes,
} = require("rou3");
```

**CDN** (Deno, Bun and Browsers)

```js
import {
  createRouter,
  addRoute,
  findRoute,
  removeRoute,
  matchAllRoutes,
} from "https://esm.sh/rou3";
```

<!-- /automd -->

**Create a router instance and insert routes:**

```js
import { createRouter, addRoute } from "rou3";

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

<!-- automd:contributors license=MIT author="pi0" -->

Published under the [MIT](https://github.com/unjs/h3/blob/main/LICENSE) license.
Made by [@pi0](https://github.com/pi0) and [community](https://github.com/unjs/h3/graphs/contributors) 💛
<br><br>
<a href="https://github.com/unjs/h3/graphs/contributors">
<img src="https://contrib.rocks/image?repo=unjs/h3" />
</a>

<!-- /automd -->

<!-- automd:with-automd -->

---

_🤖 auto updated with [automd](https://automd.unjs.io)_

<!-- /automd -->
