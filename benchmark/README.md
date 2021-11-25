# Benchmark Results

Benchmarks are mainly focusing on benchmarking `lookup` method performance.

Below results are based on my personal PC using WSL2. You can use provided scripts to test in your own env.

## Direct benchmark

Directly benchmarking `lookup` performance using [benchmark](https://www.npmjs.com/package/benchmark)

Scripts:
- `yarn bench`
- `yarn bench:profile` (using [0x](https://www.npmjs.com/package/0x) to generate flamegraph)


```
--- Test environment ---

Node.js version: 14.18.1
Radix3 version: 0.1.0
OS: linux
CPU count: 16
Current load: [ 0.44, 0.37, 0.28 ]


--- static route ---

lookup x 1,348,176 ops/sec ±2.80% (84 runs sampled)
Total requests:
 - /choot/: 7107489

--- dynamic route ---

lookup x 1,341,697 ops/sec ±2.10% (89 runs sampled)
Total requests:
 - /choot/123: 7107872
 ```

## HTTP Benchmark


Using [`autocannon`](https://github.com/mcollina/autocannon) and a simple http listener using lookup for realworld performance.

Scripts:
- `yarn bench:http`

```
--- Test environment ---

Node.js version: 14.18.1
Radix3 version: 0.1.0
OS: linux
CPU count: 16
Current load: [ 0.06, 0.29, 0.25 ]


--- Benchmark: static route ---

Running 10s test @ http://localhost:3000/
10 connections

┌─────────┬──────┬──────┬───────┬──────┬─────────┬─────────┬───────┐
│ Stat    │ 2.5% │ 50%  │ 97.5% │ 99%  │ Avg     │ Stdev   │ Max   │
├─────────┼──────┼──────┼───────┼──────┼─────────┼─────────┼───────┤
│ Latency │ 0 ms │ 0 ms │ 0 ms  │ 1 ms │ 0.02 ms │ 0.16 ms │ 10 ms │
└─────────┴──────┴──────┴───────┴──────┴─────────┴─────────┴───────┘
┌───────────┬─────────┬─────────┬─────────┬─────────┬──────────┬─────────┬─────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%     │ 97.5%   │ Avg      │ Stdev   │ Min     │
├───────────┼─────────┼─────────┼─────────┼─────────┼──────────┼─────────┼─────────┤
│ Req/Sec   │ 17071   │ 17071   │ 23407   │ 23919   │ 22758.55 │ 1842.99 │ 17060   │
├───────────┼─────────┼─────────┼─────────┼─────────┼──────────┼─────────┼─────────┤
│ Bytes/Sec │ 2.85 MB │ 2.85 MB │ 3.91 MB │ 3.99 MB │ 3.8 MB   │ 308 kB  │ 2.85 MB │
└───────────┴─────────┴─────────┴─────────┴─────────┴──────────┴─────────┴─────────┘

Req/Bytes counts sampled once per second.

250k requests in 11.01s, 41.8 MB read
Total requests:
 - /choot/: 250340

--- Benchmark: dynamic route ---

Running 10s test @ http://localhost:3000/
10 connections

┌─────────┬──────┬──────┬───────┬──────┬─────────┬─────────┬──────┐
│ Stat    │ 2.5% │ 50%  │ 97.5% │ 99%  │ Avg     │ Stdev   │ Max  │
├─────────┼──────┼──────┼───────┼──────┼─────────┼─────────┼──────┤
│ Latency │ 0 ms │ 0 ms │ 0 ms  │ 1 ms │ 0.02 ms │ 0.12 ms │ 5 ms │
└─────────┴──────┴──────┴───────┴──────┴─────────┴─────────┴──────┘
┌───────────┬─────────┬─────────┬─────────┬─────────┬──────────┬─────────┬─────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%     │ 97.5%   │ Avg      │ Stdev   │ Min     │
├───────────┼─────────┼─────────┼─────────┼─────────┼──────────┼─────────┼─────────┤
│ Req/Sec   │ 19631   │ 19631   │ 23151   │ 23503   │ 22746.91 │ 1032.53 │ 19630   │
├───────────┼─────────┼─────────┼─────────┼─────────┼──────────┼─────────┼─────────┤
│ Bytes/Sec │ 3.34 MB │ 3.34 MB │ 3.94 MB │ 3.99 MB │ 3.87 MB  │ 175 kB  │ 3.34 MB │
└───────────┴─────────┴─────────┴─────────┴─────────┴──────────┴─────────┴─────────┘

Req/Bytes counts sampled once per second.

250k requests in 11.01s, 42.5 MB read
Total requests:
 - /choot/123: 250240
```
