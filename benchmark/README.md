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

### Node.js

<!-- automd:bench node -->

- Processor: `Apple M2`
- Runtime: `node v20.15.0 (arm64-darwin)`

name                 | request matching     | pattern matching     | router init          | bundle size         
-------------------- | -------------------- | -------------------- | -------------------- | --------------------
rou3                 | 🥈 2nd (674)         | 🥈 2nd (545)         | 🥉 3rd (3276)        | 🥈 2nd (2011)       
medley               | 🥇 1st (668)         |    3th (662)         | 🥈 2nd (2842)        |    5th (6628)       
hono-regexp          | 🥉 3rd (811)         | 🥇 1st (432)         |    3th (3991)        |    4th (5321)       
koa-tree             |    3th (828)         | 🥉 3rd (609)         | 🥇 1st (1901)        |    6th (8159)       
hono-pattern         |    4th (1588)        |    4th (1650)        |    6th (7847)        | 🥇 1st (1049)       
radix3               |    5th (2034)        |    5th (1756)        |    4th (5072)        | 🥉 3rd (2294)       
hono-trie            |    6th (2414)        |    6th (2390)        |    5th (7245)        |    3th (3527)       
hono-smart           |                      |                      |                      |    7th (8877)

<!-- /automd -->

## Bun

<!-- automd:bench bun -->

- Processor: `Apple M2`
- Runtime: `bun 1.1.17 (arm64-darwin)`

name                 | request matching     | pattern matching     | router init          | bundle size         
-------------------- | -------------------- | -------------------- | -------------------- | --------------------
rou3                 | 🥇 1st (334)         | 🥇 1st (290)         | 🥇 1st (2213)        | 🥈 2nd (2011)       
hono-regexp          | 🥈 2nd (463)         | 🥈 2nd (401)         | 🥈 2nd (2547)        |    4th (5321)       
medley               | 🥉 3rd (523)         | 🥉 3rd (521)         |    3th (3638)        |    5th (6628)       
koa-tree             |    4th (957)         |    4th (828)         | 🥉 3rd (2934)        |    6th (8159)       
radix3               |    3th (565)         |    3th (561)         |    6th (6154)        | 🥉 3rd (2294)       
hono-pattern         |    5th (1704)        |    5th (1704)        |    5th (5800)        | 🥇 1st (1049)       
hono-trie            |    6th (1859)        |    6th (1844)        |    4th (4053)        |    3th (3527)       
hono-smart           |                      |                      |                      |    7th (8877)

<!-- /automd -->
