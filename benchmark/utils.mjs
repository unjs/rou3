
import { readFileSync } from "node:fs";
import os from "node:os";
import { createRouter } from "../dist/index.mjs";
import { createRouter as createRouterV1 } from "radix3-v1";

export const logSection = (title) => {
  console.log(`\n--- ${title} ---\n`);
};

const pkgVersion = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
).version;

export function printEnv() {
  logSection("Test environment");
  console.log("Node.js version:", process.versions.node);
  console.log("Radix3 version:", pkgVersion);
  console.log("OS:", os.platform());
  console.log("CPU count:", os.cpus().length);
  console.log("Current load:", os.loadavg());
  console.log("");
}

export function printStats(stats) {
  console.log(
    "Stats:\n" +
    Object.entries(stats)
      .map(([path, hits]) => ` - ${path}: ${hits}`)
      .join("\n"),
  );
}

const routes = Object.fromEntries(
  [
    "/hello",
    "/cool",
    "/hi",
    "/helium",
    "/coooool",
    "/chrome",
    "/choot",
    "/choot/:choo",
    "/ui/**",
    "/ui/components/**",
  ].map((path) => [path, { path }])
);

const requests = [
  { path: "/hi" },
  { path: "/choot/123" }
]

export const benchSets = [
  {
    title: "v2",
    router: createRouter({ routes }),
    requests,
  },
  {
    title: "v1",
    router: createRouterV1({ routes }),
    requests,
  },
];
