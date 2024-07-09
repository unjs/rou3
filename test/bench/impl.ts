// import * as rou3Src from "../../src";
import * as rou3Dist from "../../dist/index.mjs";
import * as rou3Release from "rou3-release";
import { requests, routes } from "./input";

export function createInstances() {
  return [
    // ["rou3-src", createRou3Router(rou3Src)],
    ["rou3-dist", createRou3Router(rou3Dist)],
    ["rou3-release", createRou3Router(rou3Release)],
    ["maximum", createFastestRouter()],
  ] as const;
}

export function createRou3Router(rou3: typeof rou3Release) {
  const router = rou3.createRouter();
  for (const route of routes) {
    rou3.addRoute(
      router,
      route.method,
      route.path,
      `[${route.method}] ${route.path}`,
    );
  }
  return (method: string, path: string) => {
    return rou3.findRoute(router, method, path);
  };
}

export function createFastestRouter() {
  const staticMap = Object.create(null);
  for (const req of requests) {
    staticMap[req.method] = staticMap[req.method] || Object.create(null);
    staticMap[req.method][req.path] = req;
  }
  return (method: string, path: string) => {
    return staticMap[method]?.[path];
  };
}
