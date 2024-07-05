import { RegExpRouter as HonoRegExpRouter } from "hono/router/reg-exp-router";
import { TrieRouter as HonoTrieRouter } from "hono/router/trie-router";
import { BaseRouter, noop } from "./_common.mjs";

// https://hono.dev/docs/concepts/routers

export class HonoRegExp extends BaseRouter {
  init() {
    this.router = new HonoRegExpRouter();
    for (const route of this.routes) {
      this.router.add(route.method, route.path, noop);
    }
  }
  match(request) {
    const match = this.router.match(request.method, request.path); // [[handler, paramIndexMap][], paramArray]
    if (!match || match[0].length === 0) return undefined; // 404
    const [[[handler, paramIndexMap]], paramArray] = match;
    let params;
    if (this.withParams && paramArray) {
      params = Object.create(null);
      for (const key in paramIndexMap) {
        params[key] = paramArray[paramIndexMap[key]];
      }
    }
    return {
      handler,
      params: params,
    };
  }
}

export class HonoTrie extends BaseRouter {
  init() {
    this.router = new HonoTrieRouter();
    for (const route of this.routes) {
      this.router.add(route.method, route.path, noop);
    }
  }
  match(request) {
    const match = this.router.match(request.method, request.path); // [[handler, paramIndexMap][], paramArray]
    if (!match || match[0].length === 0) return undefined; // 404
    return {
      handler: match[0][0][0],
      params: this.withParams ? match[0][0][1] : undefined,
    };
  }
}
