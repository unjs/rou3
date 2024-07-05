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
| hono-regexp  | 🥈 2nd (955)     | 🥇 1st (487)     | 3th (4427)    | 4th (5321)    |
| medley       | 🥇 1st (748)     | 3th (761)        | 🥈 2nd (3311) | 5th (6628)    |
| koa-tree     | 🥉 3rd (963)     | 🥉 3rd (699)     | 🥇 1st (2261) | 6th (8159)    |
| rou3         | 3th (968)        | 🥈 2nd (621)     | 🥉 3rd (4387) | 🥈 2nd (2052) |
| hono-pattern | 4th (1845)       | 4th (1920)       | 6th (10385)   | 🥇 1st (1049) |
| radix3       | 6th (2764)       | 5th (2071)       | 4th (5096)    | 🥉 3rd (2294) |
| hono-trie    | 5th (2760)       | 6th (2745)       | 5th (7375)    | 3th (3527)    |
| hono-smart   |                  |                  |               | 7th (8877)    |

<!-- /automd -->

## Bun

<!-- automd:bench bun -->

- Processor: `Apple M2`
- Runtime: `bun 1.1.17 (arm64-darwin)`

| name         | request matching | pattern matching | router init   | bundle size   |
| ------------ | ---------------- | ---------------- | ------------- | ------------- |
| hono-regexp  | 🥈 2nd (518)     | 🥈 2nd (458)     | 🥇 1st (3066) | 4th (5321)    |
| rou3         | 🥇 1st (425)     | 🥇 1st (361)     | 5th (8169)    | 🥈 2nd (2052) |
| medley       | 🥉 3rd (597)     | 🥉 3rd (598)     | 3th (5454)    | 5th (6628)    |
| koa-tree     | 4th (1160)       | 4th (1002)       | 🥈 2nd (3657) | 6th (8159)    |
| radix3       | 3th (661)        | 3th (652)        | 6th (8374)    | 🥉 3rd (2294) |
| hono-pattern | 5th (1947)       | 5th (1930)       | 4th (6610)    | 🥇 1st (1049) |
| hono-trie    | 6th (2090)       | 6th (2082)       | 🥉 3rd (4429) | 3th (3527)    |
| hono-smart   |                  |                  |               | 7th (8877)    |

<!-- /automd -->
