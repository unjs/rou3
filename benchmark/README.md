# Benchmarks

This directory holds various benchmark and testing scripts.

> [!IMPORTANT]
> Please consider that benchmarks provided are **ONLY** a measurement to find internal improvement opportunities.
>
> Raw low-level benchmarks do **NOT** directly reflect your application performances and most of the time, the main blocker is the application logic itself and not the route matcher.
>
> Each router is designed for specific applications and has different characteristics and trade-offs.
>
> Choose the library that best fits your needs and preferences not based on these numbers!

## Specifications

All routers defined with a common wrapper interface in [routers/\*](./routers/)

[test.mjs](./test.mjs) runs before the benchmark to make sure all routers pass the expected outputs.

Routes defined in [`input/routes.mjs`](./input/routes.mjs) and requests defined in [`input/requests.mjs`](./input/requests.mjs)

We benchmark 3 different scenarios:

1. **Request matching:** `(method, path) => handler + dynamic params object`
2. **Pattern matching:** `(method, path) => handler` (without resolved dynamic params object)
3. **Init time:** Benchmark router initialization time which matters in workers with short-live time

In each cycle, we hit **all** requests one by one. This is to ensure results covering an average of all possible cases.

## Routers

- [hono](https://hono.dev/docs/concepts/routers) (\*)
- [koa-tree-router](https://github.com/steambap/koa-tree-router)
- [medley](https://github.com/medleyjs/router)
- [radix3](https://github.com/unjs/rou3/tree/radix3) (\*)
- [rou3](https://github.com/unjs/rou3)

Notes:

- Hono uses [smart router](https://hono.dev/docs/concepts/routers#smartrouter) by default which chooses between `RegExpRouter` and `TrieRouter` on runtime based on routes complexity, which one is being used, depending on your defined routes. Hono offers another small size `LinearRouter`. We benchmark them separately.
- Radix3 is the previous generation of Rou3

## Running benchmarks locally

Clone repository:

```sh
git clone https://github.com/unjs/rou3
```

Install dependencies:

```sh
# Node.js (pnpm)
corepack enable
pnpm install

# Bun
bun i
```

Build library:

```sh
# Node.js (pnpm)
pnpm run build

# Bun
bun run build
```

Run tests:

```sh
# Node.js
node benchmark/test.mjs

# Bun
bun benchmark/test.mjs
```

Benchmark rou3:

```sh
# Node.js
node benchmark/bench.mjs

# Bun
bun benchmark/bench.mjs
```

Compare with other routes:

```sh
# Node.js
node benchmark/compare.mjs

# Bun
bun benchmark/compare.mjs
```

## Results

Run locally.
