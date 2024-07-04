import { describe, it, expect } from "vitest";
import { createRouter, formatTree } from "./_utils";
import { matchAllRoutes } from "../src";

describe("readme example", () => {
  const router = createRouter({
    "/foo": { m: "foo" },
    "/foo/**": { m: "foo/**", order: "2" },
    "/foo/bar": { m: "foo/bar" },
    "/foo/bar/baz": { m: "foo/bar/baz", order: "4" },
    "/foo/*/baz": { m: "foo/*/baz", order: "3" },
    "/**": { m: "/**", order: "1" },
  });

  it("snapshot", () => {
    expect(formatTree(router.root)).toMatchInlineSnapshot(`
      "<root>
          ├── /foo ┈> [{"m":"foo"}]
          │       ├── /bar ┈> [{"m":"foo/bar"}]
          │       │       ├── /baz ┈> [{"m":"foo/bar/baz","order":"4"}]
          │       ├── /*
          │       │       ├── /baz ┈> [{"m":"foo/*/baz","order":"3"}]
          │       ├── /** ┈> [{"m":"foo/**","order":"2"}]
          ├── /** ┈> [{"m":"/**","order":"1"}]"
    `);
  });

  it("matches /foo/bar/baz pattern", () => {
    const matches = matchAllRoutes(router, "/foo/bar/baz");
    expect(matches).to.toMatchInlineSnapshot(`
      [
        {
          "m": "/**",
          "order": "1",
        },
        {
          "m": "foo/**",
          "order": "2",
        },
        {
          "m": "foo/*/baz",
          "order": "3",
        },
        {
          "m": "foo/bar/baz",
          "order": "4",
        },
      ]
    `);
  });
});

describe("route matcher", () => {
  const router = createRouter([
    "/",
    "/foo",
    "/foo/*",
    "/foo/**",
    "/foo/bar",
    "/foo/baz",
    "/foo/baz/**",
    "/foo/*/sub",
    "/without-trailing",
    "/with-trailing/",
    "/c/**",
    "/cart",
  ]);

  it("snapshot", () => {
    expect(formatTree(router.root)).toMatchInlineSnapshot(`
      "<root> ┈> [/]
          ├── /foo ┈> [/foo]
          │       ├── /bar ┈> [/foo/bar]
          │       ├── /baz ┈> [/foo/baz]
          │       │       ├── /** ┈> [/foo/baz/**]
          │       ├── /* ┈> [/foo/*]
          │       │       ├── /sub ┈> [/foo/*/sub]
          │       ├── /** ┈> [/foo/**]
          ├── /without-trailing ┈> [/without-trailing]
          ├── /with-trailing ┈> [/with-trailing/]
          ├── /c
          │       ├── /** ┈> [/c/**]
          ├── /cart ┈> [/cart]"
    `);
  });

  it("can match routes", () => {
    expect(matchAllRoutes(router, "/")).to.toMatchInlineSnapshot(`
      [
        {
          "path": "/",
        },
      ]
    `);
    expect(matchAllRoutes(router, "/foo")).to.toMatchInlineSnapshot(`
      [
        {
          "path": "/foo/**",
        },
        {
          "path": "/foo",
        },
      ]
    `);
    expect(matchAllRoutes(router, "/foo/bar")).to.toMatchInlineSnapshot(`
      [
        {
          "path": "/foo/**",
        },
        {
          "path": "/foo/*",
        },
        {
          "path": "/foo/bar",
        },
      ]
    `);
    expect(matchAllRoutes(router, "/foo/baz")).to.toMatchInlineSnapshot(`
      [
        {
          "path": "/foo/**",
        },
        {
          "path": "/foo/*",
        },
        {
          "path": "/foo/baz/**",
        },
        {
          "path": "/foo/baz",
        },
      ]
    `);
    expect(matchAllRoutes(router, "/foo/123/sub")).to.toMatchInlineSnapshot(`
      [
        {
          "path": "/foo/**",
        },
        {
          "path": "/foo/*/sub",
        },
      ]
    `);
    expect(matchAllRoutes(router, "/foo/123")).to.toMatchInlineSnapshot(`
      [
        {
          "path": "/foo/**",
        },
        {
          "path": "/foo/*",
        },
      ]
    `);
  });

  it("trailing slash", () => {
    // Defined with trailing slash
    expect(matchAllRoutes(router, "/with-trailing")).to.toMatchInlineSnapshot(`
      [
        {
          "path": "/with-trailing/",
        },
      ]
    `);
    expect(matchAllRoutes(router, "/with-trailing")).toMatchObject(
      matchAllRoutes(router, "/with-trailing/"),
    );

    // Defined without trailing slash
    expect(matchAllRoutes(router, "/without-trailing")).to
      .toMatchInlineSnapshot(`
      [
        {
          "path": "/without-trailing",
        },
      ]
    `);
    expect(matchAllRoutes(router, "/without-trailing")).toMatchObject(
      matchAllRoutes(router, "/without-trailing/"),
    );
  });

  it("prefix overlap", () => {
    expect(matchAllRoutes(router, "/c/123")).to.toMatchInlineSnapshot(`
      [
        {
          "path": "/c/**",
        },
      ]
    `);
    expect(matchAllRoutes(router, "/c/123")).toMatchObject(
      matchAllRoutes(router, "/c/123/"),
    );
    expect(matchAllRoutes(router, "/c/123")).toMatchObject(
      matchAllRoutes(router, "/c"),
    );

    expect(matchAllRoutes(router, "/cart")).to.toMatchInlineSnapshot(`
      [
        {
          "path": "/cart",
        },
      ]
    `);
  });
});
