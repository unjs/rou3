import { bench, group, run } from "mitata";
import "./test.mjs";
import { routers } from "./routers/_all.mjs";
import { requests } from "./input/requests.mjs";
import { routes } from "./input/routes.mjs";

const groups = {
  withParams: "request matching",
  withoutParams: "pattern matching",
  init: "router init",
  bundle: "bundle size",
};

group(groups.withParams, () => {
  for (const name in routers) {
    const router = new routers[name](routes, true /* params */);
    router.init();
    bench(name, () => {
      for (const request of requests) {
        router.match(request);
      }
    });
  }
});

group(groups.withoutParams, () => {
  for (const name in routers) {
    const router = new routers[name](routes, false /* params */);
    router.init();
    bench(name, () => {
      for (const request of requests) {
        router.match(request);
      }
    });
  }
});

group(groups.init, () => {
  for (const name in routers) {
    bench(name, () => {
      const router = new routers[name](routes);
      router.init();
    });
  }
});

// Run benchmarks
const report = await run();

// Normalize report
const _results = {};
for (const { name, group, stats } of report.benchmarks) {
  if (!_results[name]) {
    _results[name] = { name };
  }
  _results[name][group] = stats;
}

// Collect bundle sizes
const { bundleSizes } = await import("./bundle.mjs");
for (const [name, size] of Object.entries(bundleSizes)) {
  if (!_results[name]) {
    _results[name] = { name };
  }
  _results[name][groups.bundle] = {
    ...size,
    avg: size.bytes, // allow sorting
  };
}

// Print combined results
// prettier-ignore
const rankIcons = [ "🥇 1st", "🥈 2nd", "🥉 3rd", "👌 4th", "😕 5th",  "😞 6th", "😓 7th" ];
const results = Object.values(_results);
for (const label of Object.values(groups)) {
  const sorted = results.sort((a, b) => a[label]?.avg - b[label]?.avg);
  for (let i = 0; i < sorted.length; i++) {
    if (!sorted[i][label]) continue;
    sorted[i][label].rank = i;
    sorted[i][label].rankStr =
      `${rankIcons[i] || `   ${i}th`} (${Math.round(sorted[i][label].avg)})`;
  }
}

for (const result of results) {
  result._rank =
    result[groups.init]?.rank +
    result[groups.withParams]?.rank +
    result[groups.withoutParams]?.rank;
}
results.sort((a, b) => a._rank - b._rank);

const columns = ["name", ...Object.values(groups)];
console.log(columns.map((c) => c.padEnd(20, " ")).join(" | "));
console.log(columns.map((_c) => "-".repeat(20)).join(" | "));
for (const result of results) {
  console.log(
    columns
      .map((c) =>
        // prettier-ignore
        (c === "name" ? result.name : String(result[c]?.rankStr || "")).padEnd(20, " " ),
      )
      .join(" | "),
  );
}
