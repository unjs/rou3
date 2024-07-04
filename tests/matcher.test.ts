import { describe, it, expect } from "vitest";
import { createRouter } from "../src";
import { formatTree } from "./_utils";

export function createRoutes(paths) {
  return Object.fromEntries(paths.map((path) => [path, { path }]));
}

it("readme example works", () => {
  const router = createRouter({
    routes: {
      "/foo": { m: "foo" },
      "/foo/**": { m: "foo/**", order: "2" },
      "/foo/bar": { m: "foo/bar" },
      "/foo/bar/baz": { m: "foo/bar/baz", order: "4" },
      "/foo/*/baz": { m: "foo/*/baz", order: "3" },
      "/**": { m: "/**", order: "1" },
    },
  });

  expect(formatTree(router.ctx.root)).toMatchInlineSnapshot(`
      "<root>
          ├── /foo ┈> [{"m":"foo"}]
          │       ├── /bar ┈> [{"m":"foo/bar"}]
          │       │       ├── /baz ┈> [{"m":"foo/bar/baz","order":"4"}]
          │       ├── /*
          │       │       ├── /baz ┈> [{"m":"foo/*/baz","order":"3"}]
          │       ├── /** ┈> [{"m":"foo/**","order":"2"}]
          ├── /** ┈> [{"m":"/**","order":"1"}]"
    `);

  const matches = router.matchAll("/foo/bar/baz");

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

describe("route matcher", () => {
  const routes = createRoutes([
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

  const router = createRouter({ routes });

  it("snapshot", () => {
    expect(formatTree(router.ctx.root)).toMatchInlineSnapshot(`
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
    expect(router.matchAll("/")).to.toMatchInlineSnapshot(`
      [
        {
          "path": "/",
        },
      ]
    `);
    expect(router.matchAll("/foo")).to.toMatchInlineSnapshot(`
      [
        {
          "path": "/foo/**",
        },
        {
          "path": "/foo",
        },
      ]
    `);
    expect(router.matchAll("/foo/bar")).to.toMatchInlineSnapshot(`
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
    expect(router.matchAll("/foo/baz")).to.toMatchInlineSnapshot(`
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
    expect(router.matchAll("/foo/123/sub")).to.toMatchInlineSnapshot(`
      [
        {
          "path": "/foo/**",
        },
        {
          "path": "/foo/*/sub",
        },
      ]
    `);
    expect(router.matchAll("/foo/123")).to.toMatchInlineSnapshot(`
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
    expect(router.matchAll("/with-trailing")).to.toMatchInlineSnapshot(`
      [
        {
          "path": "/with-trailing/",
        },
      ]
    `);
    expect(router.matchAll("/with-trailing")).toMatchObject(
      router.matchAll("/with-trailing/"),
    );

    // Defined without trailing slash
    expect(router.matchAll("/without-trailing")).to.toMatchInlineSnapshot(`
      [
        {
          "path": "/without-trailing",
        },
      ]
    `);
    expect(router.matchAll("/without-trailing")).toMatchObject(
      router.matchAll("/without-trailing/"),
    );
  });

  it("prefix overlap", () => {
    expect(router.matchAll("/c/123")).to.toMatchInlineSnapshot(`
      [
        {
          "path": "/c/**",
        },
      ]
    `);
    expect(router.matchAll("/c/123")).toMatchObject(router.matchAll("/c/123/"));
    expect(router.matchAll("/c/123")).toMatchObject(router.matchAll("/c"));

    expect(router.matchAll("/cart")).to.toMatchInlineSnapshot(`
      [
        {
          "path": "/cart",
        },
      ]
    `);
  });
});
