import { bench, describe } from "vitest";
import { requests, createBenchApps } from "./spec";

const apps = createBenchApps();

for (const request of requests) {
  describe(`[${request.method}] ${request.path}`, () => {
    for (const [name, _find] of apps) {
      bench(name, () => {
        _find(request.method, request.path);
      });
    }
  });
}
