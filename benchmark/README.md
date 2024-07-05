# Benchmarks

This directory holds various benchmark and testing scripts.

> [!IMPORTANT]
> Please consider that benchmarks provided are **ONLY** a measurement to find internal improvements opportunities.
>
> Raw low-level benchmarks does **NOT** directly reflect to your application performances and most the times main blocker is application logic itself and not the route matcher.
>
> Each router is designed for specific applications and has different characteristics and trade-offs.
>
> Choose the library that fits best of your needs and preference not based on these numbers!

## Specifications

### Interface

All routers defined with a common wrapper interface in [routers/\*](./routers/)

- Route matching requires both **path** and **method** matching
- Result requires to return both **handler** and **params object** (for dynamic routes)

### Routes and requests

- Routes defined in [`input/routes.mjs`](./input/routes.mjs)
- Requests defined in [`input/requests.mjs`](./input/requests.mjs)

In each cycle, we hit **all** requests one by one. This is to ensure result covering an average of all possible cases.

### Tests

[test.mjs](./test.mjs) runs before benchmark to make sure all routers pass expected outputs.

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
