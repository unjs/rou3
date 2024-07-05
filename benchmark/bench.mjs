import { bench, run } from "mitata";
import "./test.mjs";
import { Rou3 } from "./routers/rou3.mjs";
import { requests } from "./input/requests.mjs";
import { routes } from "./input/routes.mjs";

const router = new Rou3(routes);
router.init();

bench("all", () => {
  for (const request of requests) {
    router.match(request);
  }
});

for (const request of requests) {
  bench(request.name, () => {
    router.match(request);
  });
}

await run({});
