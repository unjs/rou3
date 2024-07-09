import * as rou3 from "../../src";

// https://github.com/pi0/web-framework-benchmarks
// (based on hono router benchmarks)

export const routes = [
  { method: "GET", path: "/user" },
  { method: "GET", path: "/user/comments" },
  { method: "GET", path: "/user/avatar" },
  { method: "GET", path: "/user/lookup/username/:username" },
  { method: "GET", path: "/user/lookup/email/:address" },
  { method: "GET", path: "/event/:id" },
  { method: "GET", path: "/event/:id/comments" },
  { method: "POST", path: "/event/:id/comment" },
  { method: "GET", path: "/map/:location/events" },
  { method: "GET", path: "/status" },
  { method: "GET", path: "/very/deeply/nested/route/hello/there" },
  { method: "GET", path: "/static/:path" },
];

export const requests = [
  {
    name: "short static",
    method: "GET",
    path: "/user",
    data: "[GET] /user",
  },
  {
    name: "static with same radix",
    method: "GET",
    path: "/user/comments",
    data: "[GET] /user/comments",
  },
  {
    name: "dynamic route",
    method: "GET",
    path: "/user/lookup/username/hey",
    params: { username: "hey" },
    data: "[GET] /user/lookup/username/:username",
  },
  {
    name: "mixed static dynamic",
    method: "GET",
    path: "/event/abcd1234/comments",
    params: { id: "abcd1234" },
    data: "[GET] /event/:id/comments",
  },
  {
    name: "post",
    method: "POST",
    path: "/event/abcd1234/comment",
    params: { id: "abcd1234" },
    data: "[POST] /event/:id/comment",
  },
  {
    name: "long static",
    method: "GET",
    path: "/very/deeply/nested/route/hello/there",
    data: "[GET] /very/deeply/nested/route/hello/there",
  },
  {
    name: "wildcard",
    method: "GET",
    path: "/static/index.html",
    params: { path: "index.html" },
    data: "[GET] /static/:path",
  },
];

export function createBenchApps() {
  return [
    ["rou3", createRou3Router()],
    ["fastest", createFastestRouter()],
  ] as const;
}

export function createRou3Router() {
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
