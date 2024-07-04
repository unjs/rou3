import { describe, it, expect } from "vitest";
import { createRouter } from "../src";
import { formatTree } from "./_utils";

describe("Basic router", () => {
  const router = createRouter({});

  it("add routes", () => {
    for (const path of [
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
    ]) {
      router.insert(path, { path });
    }

    expect(formatTree(router.ctx.root)).toMatchInlineSnapshot(`
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
          │       ├── /path ┈> [/another/path]"
    `);
  });

  it("lookup works", () => {
    // Static
    expect(router.lookup("/test")).toEqual({ data: { path: "/test" } });
    expect(router.lookup("/test/foo")).toEqual({ data: { path: "/test/foo" } });
    expect(router.lookup("/test/fooo")).toEqual({
      data: { path: "/test/fooo" },
    });
    expect(router.lookup("/another/path")).toEqual({
      data: { path: "/another/path" },
    });
    // Param
    expect(router.lookup("/test/123")).toEqual({
      data: { path: "/test/:id" },
      params: { id: "123" },
    });
    expect(router.lookup("/test/123/y")).toEqual({
      data: { path: "/test/:idY/y" },
      params: { idY: "123" },
    });
    expect(router.lookup("/test/123/y/z")).toEqual({
      data: { path: "/test/:idYZ/y/z" },
      params: { idYZ: "123" },
    });
    expect(router.lookup("/test/foo/123")).toEqual({
      data: { path: "/test/foo/*" },
      params: { _0: "123" },
    });
    // Wildcard
    expect(router.lookup("/test/foo/123/456")).toEqual({
      data: { path: "/test/foo/**" },
      params: { _: "123/456" },
    });
  });

  it("remove works", () => {
    router.remove("/test");
    router.remove("/test/*");
    router.remove("/test/foo/*");
    router.remove("/test/foo/**");
    expect(formatTree(router.ctx.root)).toMatchInlineSnapshot(`
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
          │       ├── /path ┈> [/another/path]"
    `);
    expect(router.lookup("/test")).toBeUndefined();
  });
});
