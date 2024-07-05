import { createRouter, addRoute, findRoute } from "../../dist/index.mjs";
import { BaseRouter, noop } from "./_common.mjs";

// https://github.com/unjs/rou3

export class Rou3 extends BaseRouter {
  init() {
    this.router = createRouter();
    for (const route of this.routes) {
      addRoute(this.router, route.path, route.method, noop);
    }
  }
  match(request) {
    const match = findRoute(this.router, request.path, request.method, {
      ignoreParams: !this.withParams,
    });
    if (!match) return undefined; // 404
    return {
      handler: match.data,
      params: this.withParams ? match.params : undefined,
    };
  }
}
