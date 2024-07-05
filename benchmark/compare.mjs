import { bench, group, run } from "mitata";
import "./test.mjs";
import { routers } from "./routers/_all.mjs";
import { requests } from "./input/requests.mjs";
import { routes } from "./input/routes.mjs";

const withParams = !process.argv.includes("--no-params");

// Benchmark all routers
group(`all (match params: ${withParams})`, () => {
  for (const name in routers) {
    const router = new routers[name](routes, withParams);
    router.init();
    bench(name, () => {
      for (const request of requests) {
        router.match(request);
      }
    });
  }
});

await run({
  avg: true,
});
