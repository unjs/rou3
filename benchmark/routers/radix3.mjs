import { createRouter } from "radix3";
import { BaseRouter, noop } from "./_common.mjs";

// https://github.com/unjs/rou3/tree/radix3

export class Radix3 extends BaseRouter {
  init() {
    this.router = createRouter();
    for (const route of this.routes) {
      this.router.insert(route.path, { [route.method]: noop });
    }
  }
  match(request) {
    const match = this.router.lookup(request.path);
    if (!match || !match[request.method]) return undefined; // 404
    return {
      handler: match[request.method],
      params: this.withParams ? match.params : undefined,
    };
  }
}
