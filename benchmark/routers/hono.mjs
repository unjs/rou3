import { RegExpRouter } from "hono/router/reg-exp-router";
import { TrieRouter } from "hono/router/trie-router";
import { PatternRouter } from "hono/router/pattern-router";
import { SmartRouter } from "hono/router/smart-router";

import { BaseRouter, noop } from "./_common.mjs";

// https://hono.dev/docs/concepts/routers

export class HonoSmart extends BaseRouter {
  init() {
    //hono.dev/docs/concepts/routers#smartrouter
    this.router = new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()],
    });
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
      params,
    };
  }
}

export class HonoRegExp extends BaseRouter {
  init() {
    this.router = new RegExpRouter();
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
      params,
    };
  }
}

export class HonoTrie extends BaseRouter {
  init() {
    this.router = new TrieRouter();
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

export class HonoParrern extends BaseRouter {
  init() {
    this.router = new PatternRouter();
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
