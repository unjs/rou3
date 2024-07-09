import { bench, group as describe, run } from "mitata";
import { requests } from "./input";
import { createInstances } from "./impl";

const instances = createInstances();

const fullTests = process.argv.includes("--full");
const noMaxTests = process.argv.includes("--no-max");

describe("param routes", () => {
  const nonStaticRequests = requests.filter((r) => r.data.includes(":"));
  for (const [name, _find] of instances) {
    if (noMaxTests && name === "maximum") {
      continue;
    }
    bench(name, () => {
      for (const request of nonStaticRequests) {
        _find(request.method, request.path);
      }
    });
  }
});

if (fullTests) {
  describe("param and static routes", () => {
    for (const [name, _find] of instances) {
      if (noMaxTests && name === "maximum") {
        continue;
      }
      bench(name, () => {
        for (const request of requests) {
          _find(request.method, request.path);
        }
      });
    }
  });

  for (const request of requests) {
    describe(`[${request.method}] ${request.path}`, () => {
      for (const [name, _find] of instances) {
        if (noMaxTests && name === "maximum") {
          continue;
        }
        bench(name, () => {
          _find(request.method, request.path);
        });
      }
    });
  }
}

await run();

if (!fullTests) {
  console.log("\nRun with --full to run all tests");
}
