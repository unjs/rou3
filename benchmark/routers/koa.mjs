import KoaTreeRouter from "koa-tree-router";
import { BaseRouter, noop } from "./_common.mjs";

// https://github.com/steambap/koa-tree-router

export class KoaTree extends BaseRouter {
  init() {
    this.router = new KoaTreeRouter();
    for (const route of this.routes) {
      this.router.on(route.method, route.path, noop);
    }
  }
  match(request) {
    const match = this.router.find(request.method, request.path);
    if (!match || !match.handle) return undefined; // 404
    let params;
    if (this.withParams && match.params) {
      params = Object.create(null);
      for (const param of match.params) {
        params[param.key] = param.value;
      }
    }
    return {
      handler: match.handle[0],
      params,
    };
  }
}
