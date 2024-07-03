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

    expect(formatTree(router.ctx.root)).toMatchInlineSnapshot(`"<root>"`);
  });

  it("lookup works", () => {
    // Static
    expect(router.lookup("/test")).toEqual({ path: "/test" });
    expect(router.lookup("/test/foo")).toEqual({ path: "/test/foo" });
    expect(router.lookup("/test/fooo")).toEqual({ path: "/test/fooo" });
    expect(router.lookup("/another/path")).toEqual({ path: "/another/path" });
    // Param
    expect(router.lookup("/test/123")).toEqual({
      path: "/test/:id",
      params: { id: "123" },
    });
    expect(router.lookup("/test/123/y")).toEqual({
      path: "/test/:idY/y",
      params: { idY: "123" },
    });
    expect(router.lookup("/test/123/y/z")).toEqual({
      path: "/test/:idYZ/y/z",
      params: { idYZ: "123" },
    });
    expect(router.lookup("/test/foo/123")).toEqual({
      path: "/test/foo/*",
      params: { _0: "123" },
    });
    // Wildcard
    expect(router.lookup("/test/foo/123/456")).toEqual({
      path: "/test/foo/**",
      params: { _: "123/456" },
    });
  });

  it("remove works", () => {
    router.remove("/test");
    router.remove("/test/*");
    router.remove("/test/foo/*");
    router.remove("/test/foo/**");
    expect(formatTree(router.ctx.root)).toMatchInlineSnapshot(`"<root>"`);
    expect(router.lookup("/test")).toBeUndefined();
  });
});
