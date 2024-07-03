import { describe, it, expect } from "vitest";
import { createRouter, RadixRouter } from "../src";
import { formatTree } from "./_utils";

type TestRoute = {
  path: string;
  params?: Record<string, string>;
  skip?: boolean;
};

type TestRoutes = Record<string, TestRoute | undefined>;

export function createTestRoutes(paths: string[]): TestRoutes {
  return Object.fromEntries(paths.map((path) => [path, { path }]));
}

function testRouter(
  paths: string[],
  before?: (ctx: { routes: TestRoutes; router: RadixRouter }) => void,
  tests?: TestRoutes,
) {
  const routes = createTestRoutes(paths);
  const router = createRouter({ routes });

  if (!tests) {
    tests = routes;
  }

  if (before) {
    it("before", () => {
      before({ routes, router });
    });
  }

  for (const path in tests) {
    it.skipIf(tests[path]?.skip)(
      `lookup ${path} should be ${JSON.stringify(tests[path])}`,
      () => {
        expect(router.lookup(path)).to.deep.equal(tests[path]);
      },
    );
  }
}

describe("Router lookup", function () {
  describe("static routes", () => {
    testRouter(
      ["/", "/route", "/another-router", "/this/is/yet/another/route"],
      (ctx) =>
        expect(formatTree(ctx.router.ctx.root)).toMatchInlineSnapshot(`
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
      (ctx) =>
        expect(formatTree(ctx.router.ctx.root)).toMatchInlineSnapshot(`
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
          path: "carbon/:element",
          params: {
            element: "test1",
          },
        },
        "/carbon": undefined,
        "carbon/": undefined,
        "carbon/test2/test/test23": {
          path: "carbon/:element/test/:testing",
          params: {
            element: "test2",
            testing: "test23",
          },
        },
        "this/test/has/more/stuff": {
          path: "this/:route/has/:cool/stuff",
          params: {
            route: "test",
            cool: "more",
          },
        },
      },
    );

    testRouter(
      ["/", "/:a", "/:a/:y/:x/:b", "/:a/:x/:b", "/:a/:b"],
      (ctx) =>
        expect(formatTree(ctx.router.ctx.root)).toMatchInlineSnapshot(
          `
          "<root> ┈> [/]
              ├── /* ┈> [/:a]
              │       ├── /* ┈> [/:a/:b]
              │       │       ├── /* ┈> [/:a/:x/:b]
              │       │       │       ├── /* ┈> [/:a/:y/:x/:b]"
        `,
        ),
      {
        "/": { path: "/" },
        "/a": {
          path: "/:a",
          params: {
            a: "a",
          },
        },
        "/a/b": {
          path: "/:a/:b",
          params: {
            a: "a",
            b: "b",
          },
        },
        "/a/x/b": {
          path: "/:a/:x/:b",
          params: {
            a: "a",
            b: "b",
            x: "x",
          },
        },
        "/a/y/x/b": {
          path: "/:a/:y/:x/:b",
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
      (ctx) =>
        expect(formatTree(ctx.router.ctx.root)).toMatchInlineSnapshot(
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
          path: "/:owner/:repo/:packageAndRefOrSha",
          params: {
            owner: "tinylibs",
            repo: "tinybench",
            packageAndRefOrSha: "tiny@232",
          },
        },
        "/tinylibs/tinybench/@tinylibs/tiny@232": {
          path: "/:owner/:repo/:npmOrg/:packageAndRefOrSha",
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
      (ctx) =>
        expect(formatTree(ctx.router.ctx.root)).toMatchInlineSnapshot(`
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
        "polymer/another/route": { path: "polymer/another/route" },
        "polymer/anon": { path: "polymer/**:id", params: { id: "anon" } },
        "polymer/foo/bar/baz": {
          path: "polymer/**:id",
          params: { id: "foo/bar/baz" },
        },
        "route/param1/something/c/d": {
          path: "route/:p1/something/**:rest",
          params: { p1: "param1", rest: "c/d" },
        },
      },
    );
  });

  describe("unnamed placeholders", function () {
    testRouter(
      ["polymer/**", "polymer/route/*"],
      (ctx) =>
        expect(formatTree(ctx.router.ctx.root)).toMatchInlineSnapshot(`
          "<root>
              ├── /polymer
              │       ├── /route
              │       │       ├── /* ┈> [polymer/route/*]
              │       ├── /** ┈> [polymer/**]"
        `),
      {
        "polymer/foo/bar": { path: "polymer/**", params: { _: "foo/bar" } },
        "polymer/route/anon": {
          path: "polymer/route/*",
          params: { _0: "anon" },
        },
        "polymer/constructor": {
          path: "polymer/**",
          params: { _: "constructor" },
        },
      },
    );
  });

  describe("mixed params in same segment", function () {
    const mixedPath = "/files/:category/:id,name=:name.txt";
    testRouter(
      [mixedPath],
      (ctx) =>
        expect(formatTree(ctx.router.ctx.root)).toMatchInlineSnapshot(`
          "<root>
              ├── /files
              │       ├── /*
              │       │       ├── /* ┈> [/files/:category/:id,name=:name.txt]"
        `),
      {
        "/files/test/123,name=foobar.txt": {
          path: mixedPath,
          params: { category: "test", id: "123", name: "foobar" },
        },
      },
    );
  });

  describe("should be able to match routes with trailing slash", function () {
    testRouter(
      ["route/without/trailing/slash", "route/with/trailing/slash/"],
      (ctx) =>
        expect(formatTree(ctx.router.ctx.root)).toMatchInlineSnapshot(`
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
          path: "route/without/trailing/slash",
        },
        "route/with/trailing/slash/": { path: "route/with/trailing/slash/" },
        "route/without/trailing/slash/": {
          path: "route/without/trailing/slash",
        },
        "route/with/trailing/slash": { path: "route/with/trailing/slash/" },
      },
    );
  });
});

describe("Router insert", () => {
  it("should be able to insert nodes correctly into the tree", () => {
    const router = createRouter({
      routes: createTestRoutes([
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
      ]),
    });
    router.insert("/api/v3", { path: "/api/v3", overridden: true });

    expect(formatTree(router.ctx.root)).toMatchInlineSnapshot(`
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
          │       ├── /v3 ┈> [/api/v3]"
    `);
  });
});

describe("Router remove", function () {
  it("should be able to remove nodes", function () {
    const router = createRouter({
      routes: createTestRoutes([
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
      ]),
    });

    router.remove("choot");
    expect(router.lookup("choot")).to.deep.equal(undefined);

    expect(router.lookup("ui/components/snackbars")).to.deep.equal({
      path: "ui/components/**",
      params: { _: "snackbars" },
    });

    router.remove("ui/components/**");
    expect(router.lookup("ui/components/snackbars")).to.deep.equal({
      path: "ui/**",
      params: { _: "components/snackbars" },
    });
  });

  it("removes data but does not delete a node if it has children", function () {
    const router = createRouter({
      routes: createTestRoutes(["a/b", "a/b/:param1"]),
    });

    router.remove("a/b");
    expect(router.lookup("a/b")).to.deep.equal(undefined);
    expect(router.lookup("a/b/c")).to.deep.equal({
      params: { param1: "c" },
      path: "a/b/:param1",
    });
  });

  it("should be able to remove placeholder routes", function () {
    const router = createRouter({
      routes: createTestRoutes([
        "placeholder/:choo",
        "placeholder/:choo/:choo2",
      ]),
    });

    expect(router.lookup("placeholder/route")).to.deep.equal({
      path: "placeholder/:choo",
      params: {
        choo: "route",
      },
    });

    // TODO
    // router.remove("placeholder/:choo");
    // expect(router.lookup("placeholder/route")).to.deep.equal(undefined);

    expect(router.lookup("placeholder/route/route2")).to.deep.equal({
      path: "placeholder/:choo/:choo2",
      params: {
        choo: "route",
        choo2: "route2",
      },
    });
  });

  it("should be able to remove wildcard routes", function () {
    const router = createRouter({
      routes: createTestRoutes(["ui/**", "ui/components/**"]),
    });

    expect(router.lookup("ui/components/snackbars")).to.deep.equal({
      path: "ui/components/**",
      params: { _: "snackbars" },
    });
    router.remove("ui/components/**");
    expect(router.lookup("ui/components/snackbars")).to.deep.equal({
      path: "ui/**",
      params: { _: "components/snackbars" },
    });
  });

  it("should return a result signifying that the remove operation was successful or not", function () {
    const router = createRouter({
      routes: createTestRoutes(["/some/route"]),
    });

    let removeResult = router.remove("/some/route");
    expect(removeResult).to.equal(true);

    removeResult = router.remove("/some/route");
    expect(removeResult).to.equal(false);

    removeResult = router.remove("/some/route/that/never/existed");
    expect(removeResult).to.equal(false);
  });
});
