import type { RouterContext } from "../src/types";
import { describe, it, expect } from "vitest";
import { createRouter, formatTree } from "./_utils";
import { addRoute, findRoute, removeRoute } from "../src";

type TestRoute = {
  data: { path: string };
  params?: Record<string, string>;
  skip?: boolean;
};

type TestRoutes = Record<string, TestRoute | undefined>;

export function createTestRoutes(paths: string[]): Record<string, any> {
  return Object.fromEntries(paths.map((path) => [path, { path }]));
}

function testRouter(
  routes: string[] | Record<string, any>,
  before?: (router: RouterContext) => void,
  tests?: TestRoutes,
) {
  const router = createRouter(routes);

  if (!tests) {
    tests = Array.isArray(routes)
      ? Object.fromEntries(
          routes.map((path) => [
            path,
            {
              data: { path },
            },
          ]),
        )
      : Object.fromEntries(
          Object.keys(routes).map((path) => [
            path,
            {
              data: { path },
            },
          ]),
        );
  }
  if (before) {
    it("before", () => {
      before(router);
    });
  }

  for (const path in tests) {
    it.skipIf(tests[path]?.skip)(
      `lookup ${path} should be ${JSON.stringify(tests[path])}`,
      () => {
        expect(findRoute(router, path)).to.toMatchObject(tests[path]!);
      },
    );
  }
}

describe("Router lookup", function () {
  describe("static routes", () => {
    testRouter(
      ["/", "/route", "/another-router", "/this/is/yet/another/route"],
      (router) =>
        expect(formatTree(router.root)).toMatchInlineSnapshot(`
        "<root> ┈> [/]
            ├── /route ┈> [/route]
            ├── /another-router ┈> [/another-router]
            ├── /this
            │       ├── /is
            │       │       ├── /yet
            │       │       │       ├── /another
            │       │       │       │       ├── /route ┈> [/this/is/yet/another/route]"
      `),
    );
  });

  describe("retrieve placeholders", function () {
    testRouter(
      [
        "carbon/:element",
        "carbon/:element/test/:testing",
        "this/:route/has/:cool/stuff",
      ],
      (router) =>
        expect(formatTree(router.root)).toMatchInlineSnapshot(`
          "<root>
              ├── /carbon
              │       ├── /* ┈> [carbon/:element]
              │       │       ├── /test
              │       │       │       ├── /* ┈> [carbon/:element/test/:testing]
              ├── /this
              │       ├── /*
              │       │       ├── /has
              │       │       │       ├── /*
              │       │       │       │       ├── /stuff ┈> [this/:route/has/:cool/stuff]"
        `),
      {
        "carbon/test1": {
          data: { path: "carbon/:element" },
          params: {
            element: "test1",
          },
        },
        "/carbon": { data: { path: "carbon/:element" } },
        "carbon/": { data: { path: "carbon/:element" } },
        "carbon/test2/test/test23": {
          data: { path: "carbon/:element/test/:testing" },
          params: {
            element: "test2",
            testing: "test23",
          },
        },
        "this/test/has/more/stuff": {
          data: { path: "this/:route/has/:cool/stuff" },
          params: {
            route: "test",
            cool: "more",
          },
        },
      },
    );

    testRouter(
      ["/", "/:a", "/:a/:y/:x/:b", "/:a/:x/:b", "/:a/:b"],
      (router) =>
        expect(formatTree(router.root)).toMatchInlineSnapshot(
          `
          "<root> ┈> [/]
              ├── /* ┈> [/:a]
              │       ├── /* ┈> [/:a/:b]
              │       │       ├── /* ┈> [/:a/:x/:b]
              │       │       │       ├── /* ┈> [/:a/:y/:x/:b]"
        `,
        ),
      {
        "/": { data: { path: "/" } },
        "/a": {
          data: { path: "/:a" },
          params: {
            a: "a",
          },
        },
        "/a/b": {
          data: { path: "/:a/:b" },
          params: {
            a: "a",
            b: "b",
          },
        },
        "/a/x/b": {
          data: { path: "/:a/:x/:b" },
          params: {
            a: "a",
            b: "b",
            x: "x",
          },
        },
        "/a/y/x/b": {
          data: { path: "/:a/:y/:x/:b" },
          params: {
            a: "a",
            b: "b",
            x: "x",
            y: "y",
          },
        },
      },
    );

    testRouter(
      [
        "/",
        "/:packageAndRefOrSha",
        "/:owner/:repo/",
        "/:owner/:repo/:packageAndRefOrSha",
        "/:owner/:repo/:npmOrg/:packageAndRefOrSha",
      ],
      (router) =>
        expect(formatTree(router.root)).toMatchInlineSnapshot(
          `
          "<root> ┈> [/]
              ├── /* ┈> [/:packageAndRefOrSha]
              │       ├── /* ┈> [/:owner/:repo/]
              │       │       ├── /* ┈> [/:owner/:repo/:packageAndRefOrSha]
              │       │       │       ├── /* ┈> [/:owner/:repo/:npmOrg/:packageAndRefOrSha]"
        `,
        ),
      {
        "/tinylibs/tinybench/tiny@232": {
          data: { path: "/:owner/:repo/:packageAndRefOrSha" },
          params: {
            owner: "tinylibs",
            repo: "tinybench",
            packageAndRefOrSha: "tiny@232",
          },
        },
        "/tinylibs/tinybench/@tinylibs/tiny@232": {
          data: { path: "/:owner/:repo/:npmOrg/:packageAndRefOrSha" },
          params: {
            owner: "tinylibs",
            repo: "tinybench",
            npmOrg: "@tinylibs",
            packageAndRefOrSha: "tiny@232",
          },
        },
      },
    );
  });

  describe("should be able to perform wildcard lookups", () => {
    testRouter(
      ["polymer/**:id", "polymer/another/route", "route/:p1/something/**:rest"],
      (router) =>
        expect(formatTree(router.root)).toMatchInlineSnapshot(`
          "<root>
              ├── /polymer
              │       ├── /another
              │       │       ├── /route ┈> [polymer/another/route]
              │       ├── /** ┈> [polymer/**:id]
              ├── /route
              │       ├── /*
              │       │       ├── /something
              │       │       │       ├── /** ┈> [route/:p1/something/**:rest]"
        `),
      {
        "polymer/another/route": { data: { path: "polymer/another/route" } },
        "polymer/anon": {
          data: { path: "polymer/**:id" },
          params: { id: "anon" },
        },
        "polymer/foo/bar/baz": {
          data: { path: "polymer/**:id" },
          params: { id: "foo/bar/baz" },
        },
        "route/param1/something/c/d": {
          data: { path: "route/:p1/something/**:rest" },
          params: { p1: "param1", rest: "c/d" },
        },
      },
    );
  });

  describe("fallback to dynamic", () => {
    testRouter(
      ["/wildcard/**", "/test/**", "/test", "/dynamic/*"],
      (router) =>
        expect(formatTree(router.root)).toMatchInlineSnapshot(`
          "<root>
              ├── /wildcard
              │       ├── /** ┈> [/wildcard/**]
              ├── /test ┈> [/test]
              │       ├── /** ┈> [/test/**]
              ├── /dynamic
              │       ├── /* ┈> [/dynamic/*]"
        `),
      {
        "/wildcard": {
          data: { path: "/wildcard/**" },
        },
        "/wildcard/": {
          data: { path: "/wildcard/**" },
        },
        "/wildcard/abc": {
          data: { path: "/wildcard/**" },
          params: { _: "abc" },
        },
        "/wildcard/abc/def": {
          data: { path: "/wildcard/**" },
          params: { _: "abc/def" },
        },
        "/dynamic": {
          data: { path: "/dynamic/*" },
        },
        "/test": {
          data: { path: "/test" },
        },
        "/test/": {
          data: { path: "/test" },
        },
        "/test/abc": {
          data: { path: "/test/**" },
          params: { _: "abc" },
        },
      },
    );
  });

  describe("unnamed placeholders", function () {
    testRouter(
      ["polymer/**", "polymer/route/*"],
      (router) =>
        expect(formatTree(router.root)).toMatchInlineSnapshot(`
          "<root>
              ├── /polymer
              │       ├── /route
              │       │       ├── /* ┈> [polymer/route/*]
              │       ├── /** ┈> [polymer/**]"
        `),
      {
        "polymer/foo/bar": {
          data: { path: "polymer/**" },
          params: { _: "foo/bar" },
        },
        "polymer/route/anon": {
          data: { path: "polymer/route/*" },
          params: { _0: "anon" },
        },
        "polymer/constructor": {
          data: { path: "polymer/**" },
          params: { _: "constructor" },
        },
      },
    );
  });

  describe("mixed params in same segment", function () {
    const mixedPath = "/files/:category/:id,name=:name.txt";
    testRouter(
      [mixedPath],
      (router) =>
        expect(formatTree(router.root)).toMatchInlineSnapshot(`
          "<root>
              ├── /files
              │       ├── /*
              │       │       ├── /* ┈> [/files/:category/:id,name=:name.txt]"
        `),
      {
        "/files/test/123,name=foobar.txt": {
          data: { path: mixedPath },
          params: { category: "test", id: "123", name: "foobar" },
        },
      },
    );
  });

  describe("should be able to match routes with trailing slash", function () {
    testRouter(
      ["route/without/trailing/slash", "route/with/trailing/slash/"],
      (router) =>
        expect(formatTree(router.root)).toMatchInlineSnapshot(`
        "<root>
            ├── /route
            │       ├── /without
            │       │       ├── /trailing
            │       │       │       ├── /slash ┈> [route/without/trailing/slash]
            │       ├── /with
            │       │       ├── /trailing
            │       │       │       ├── /slash ┈> [route/with/trailing/slash/]"
      `),
      {
        "route/without/trailing/slash": {
          data: { path: "route/without/trailing/slash" },
        },
        "route/with/trailing/slash/": {
          data: { path: "route/with/trailing/slash/" },
        },
        "route/without/trailing/slash/": {
          data: { path: "route/without/trailing/slash" },
        },
        "route/with/trailing/slash": {
          data: { path: "route/with/trailing/slash/" },
        },
      },
    );
  });
});

describe("Router insert", () => {
  it("should be able to insert nodes correctly into the tree", () => {
    const router = createRouter([
      "hello",
      "cool",
      "hi",
      "helium",
      "/choo",
      "//choo",
      "coooool",
      "chrome",
      "choot",
      "choot/:choo",
      "ui/**",
      "ui/components/**",
      "/api/v1",
      "/api/v2",
      "/api/v3",
    ]);

    addRoute(router, "/api/v3", "", {
      path: "/api/v3(overridden)",
    });

    expect(formatTree(router.root)).toMatchInlineSnapshot(`
      "<root>
          ├── /hello ┈> [hello]
          ├── /cool ┈> [cool]
          ├── /hi ┈> [hi]
          ├── /helium ┈> [helium]
          ├── /choo ┈> [//choo]
          ├── /coooool ┈> [coooool]
          ├── /chrome ┈> [chrome]
          ├── /choot ┈> [choot]
          │       ├── /* ┈> [choot/:choo]
          ├── /ui
          │       ├── /components
          │       │       ├── /** ┈> [ui/components/**]
          │       ├── /** ┈> [ui/**]
          ├── /api
          │       ├── /v1 ┈> [/api/v1]
          │       ├── /v2 ┈> [/api/v2]
          │       ├── /v3 ┈> [/api/v3(overridden)]"
    `);
  });
});

describe("Router remove", function () {
  it("should be able to remove nodes", function () {
    const router = createRouter([
      "hello",
      "cool",
      "hi",
      "helium",
      "coooool",
      "chrome",
      "choot",
      "choot/:choo",
      "ui/**",
      "ui/components/**",
    ]);

    removeRoute(router, "choot");
    expect(findRoute(router, "choot")).to.deep.equal({
      data: { path: "choot/:choo" },
      params: { choo: undefined },
    });
    removeRoute(router, "choot/*");
    expect(findRoute(router, "choot")).to.deep.equal(undefined);

    expect(findRoute(router, "ui/components/snackbars")).to.deep.equal({
      data: { path: "ui/components/**" },
      params: { _: "snackbars" },
    });

    removeRoute(router, "ui/components/**");
    expect(findRoute(router, "ui/components/snackbars")).to.deep.equal({
      data: { path: "ui/**" },
      params: { _: "components/snackbars" },
    });
  });

  it("removes data but does not delete a node if it has children", function () {
    const router = createRouter(["a/b", "a/b/:param1"]);

    removeRoute(router, "a/b");
    expect(findRoute(router, "a/b")).to.deep.equal({
      data: { path: "a/b/:param1" },
      params: { param1: undefined },
    });
    expect(findRoute(router, "a/b/c")).to.deep.equal({
      params: { param1: "c" },
      data: { path: "a/b/:param1" },
    });
    removeRoute(router, "a/b/*");
    expect(findRoute(router, "a/b")).to.deep.equal(undefined);
  });

  it("should be able to remove placeholder routes", function () {
    const router = createRouter([
      "placeholder/:choo",
      "placeholder/:choo/:choo2",
    ]);

    expect(findRoute(router, "placeholder/route")).to.deep.equal({
      data: { path: "placeholder/:choo" },
      params: {
        choo: "route",
      },
    });

    // TODO
    // removeRoute(router,"placeholder/:choo");
    // expect(findRoute(router,"placeholder/route")).to.deep.equal(undefined);

    expect(findRoute(router, "placeholder/route/route2")).to.deep.equal({
      data: { path: "placeholder/:choo/:choo2" },
      params: {
        choo: "route",
        choo2: "route2",
      },
    });
  });

  it("should be able to remove wildcard routes", function () {
    const router = createRouter(["ui/**", "ui/components/**"]);

    expect(findRoute(router, "ui/components/snackbars")).to.deep.equal({
      data: { path: "ui/components/**" },
      params: { _: "snackbars" },
    });
    removeRoute(router, "ui/components/**");
    expect(findRoute(router, "ui/components/snackbars")).to.deep.equal({
      data: { path: "ui/**" },
      params: { _: "components/snackbars" },
    });
  });
});
