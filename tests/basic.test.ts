import { describe, it, expect } from "vitest";
import { createRouter, formatTree } from "./_utils";
import { findRoute, removeRoute } from "../src";

describe("Basic router", () => {
  const router = createRouter([
    "/test",
    "/test/:id",
    "/test/:idYZ/y/z",
    "/test/:idY/y",
    "/test/foo",
    "/test/foo/*",
    "/test/foo/**",
    "/test/foo/bar/qux",
    "/test/foo/baz",
    "/test/fooo",
    "/another/path",
    "/wildcard/**",
  ]);

  it("snapshot", () => {
    expect(formatTree(router.root)).toMatchInlineSnapshot(`
      "<root>
          ├── /test ┈> [/test]
          │       ├── /foo ┈> [/test/foo]
          │       │       ├── /bar
          │       │       │       ├── /qux ┈> [/test/foo/bar/qux]
          │       │       ├── /baz ┈> [/test/foo/baz]
          │       │       ├── /* ┈> [/test/foo/*]
          │       │       ├── /** ┈> [/test/foo/**]
          │       ├── /fooo ┈> [/test/fooo]
          │       ├── /* ┈> [/test/:id]
          │       │       ├── /y ┈> [/test/:idY/y]
          │       │       │       ├── /z ┈> [/test/:idYZ/y/z]
          ├── /another
          │       ├── /path ┈> [/another/path]
          ├── /wildcard
          │       ├── /** ┈> [/wildcard/**]"
    `);
  });

  it("lookup works", () => {
    // Static
    expect(findRoute(router, "/test")).toEqual({ data: { path: "/test" } });
    expect(findRoute(router, "/test/foo")).toEqual({
      data: { path: "/test/foo" },
    });
    expect(findRoute(router, "/test/fooo")).toEqual({
      data: { path: "/test/fooo" },
    });
    expect(findRoute(router, "/another/path")).toEqual({
      data: { path: "/another/path" },
    });
    // Param
    expect(findRoute(router, "/test/123")).toEqual({
      data: { path: "/test/:id" },
      params: { id: "123" },
    });
    expect(findRoute(router, "/test/123/y")).toEqual({
      data: { path: "/test/:idY/y" },
      params: { idY: "123" },
    });
    expect(findRoute(router, "/test/123/y/z")).toEqual({
      data: { path: "/test/:idYZ/y/z" },
      params: { idYZ: "123" },
    });
    expect(findRoute(router, "/test/foo/123")).toEqual({
      data: { path: "/test/foo/*" },
      params: { _0: "123" },
    });
    // Wildcard
    expect(findRoute(router, "/test/foo/123/456")).toEqual({
      data: { path: "/test/foo/**" },
      params: { _: "123/456" },
    });
    expect(findRoute(router, "/wildcard/foo")).toEqual({
      data: { path: "/wildcard/**" },
      params: { _: "foo" },
    });
    expect(findRoute(router, "/wildcard/foo/bar")).toEqual({
      data: { path: "/wildcard/**" },
      params: { _: "foo/bar" },
    });
    expect(findRoute(router, "/wildcard")).toEqual({
      data: { path: "/wildcard/**" },
      params: { _: "" },
    });
  });

  it("remove works", () => {
    removeRoute(router, "/test");
    removeRoute(router, "/test/*");
    removeRoute(router, "/test/foo/*");
    removeRoute(router, "/test/foo/**");
    expect(formatTree(router.root)).toMatchInlineSnapshot(`
      "<root>
          ├── /test
          │       ├── /foo ┈> [/test/foo]
          │       │       ├── /bar
          │       │       │       ├── /qux ┈> [/test/foo/bar/qux]
          │       │       ├── /baz ┈> [/test/foo/baz]
          │       ├── /fooo ┈> [/test/fooo]
          │       ├── /*
          │       │       ├── /y ┈> [/test/:idY/y]
          │       │       │       ├── /z ┈> [/test/:idYZ/y/z]
          ├── /another
          │       ├── /path ┈> [/another/path]
          ├── /wildcard
          │       ├── /** ┈> [/wildcard/**]"
    `);
    expect(findRoute(router, "/test")).toBeUndefined();
  });
});
