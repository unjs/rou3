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

| name         | request matching | pattern matching | router init   | bundle size   |
| ------------ | ---------------- | ---------------- | ------------- | ------------- |
| rou3         | 🥈 2nd (682)     | 🥈 2nd (563)     | 🥈 2nd (2609) | 🥈 2nd (2147) |
| hono-regexp  | 🥉 3rd (798)     | 🥇 1st (416)     | 3th (3741)    | 4th (5321)    |
| medley       | 🥇 1st (649)     | 3th (642)        | 🥉 3rd (2860) | 5th (6628)    |
| koa-tree     | 3th (832)        | 🥉 3rd (607)     | 🥇 1st (1905) | 6th (8159)    |
| hono-pattern | 4th (1586)       | 4th (1655)       | 6th (7894)    | 🥇 1st (1049) |
| radix3       | 5th (2031)       | 5th (1762)       | 4th (4405)    | 🥉 3rd (2294) |
| hono-trie    | 6th (2406)       | 6th (2396)       | 5th (6480)    | 3th (3527)    |
| hono-smart   |                  |                  |               | 7th (8877)    |

<!-- /automd -->

## Bun

<!-- automd:bench bun -->

- Processor: `Apple M2`
- Runtime: `bun 1.1.17 (arm64-darwin)`

| name         | request matching | pattern matching | router init   | bundle size   |
| ------------ | ---------------- | ---------------- | ------------- | ------------- |
| rou3         | 🥇 1st (335)     | 🥇 1st (298)     | 🥇 1st (2254) | 🥈 2nd (2147) |
| hono-regexp  | 🥈 2nd (451)     | 🥈 2nd (402)     | 🥈 2nd (2529) | 4th (5321)    |
| medley       | 🥉 3rd (528)     | 🥉 3rd (523)     | 3th (3709)    | 5th (6628)    |
| koa-tree     | 4th (1014)       | 4th (895)        | 🥉 3rd (3074) | 6th (8159)    |
| radix3       | 3th (562)        | 3th (555)        | 6th (6084)    | 🥉 3rd (2294) |
| hono-pattern | 5th (1708)       | 5th (1697)       | 5th (5888)    | 🥇 1st (1049) |
| hono-trie    | 6th (1846)       | 6th (1857)       | 4th (3840)    | 3th (3527)    |
| hono-smart   |                  |                  |               | 7th (8877)    |

<!-- /automd -->
