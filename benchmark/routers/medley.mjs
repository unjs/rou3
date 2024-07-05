import MedlyRouter from "@medley/router";
import { BaseRouter, noop } from "./_common.mjs";

// https://github.com/medleyjs/router

export class Medley extends BaseRouter {
  init() {
    this.router = new MedlyRouter();
    for (const route of this.routes) {
      const store = this.router.register(route.path);
      store[route.method] = noop;
    }
  }
  match(request) {
    const match = this.router.find(request.path);
    if (!match.store[request.method]) return undefined; // 404
    return {
      handler: match.store[request.method],
      params: this.withParams ? match.params : undefined,
    };
  }
}
