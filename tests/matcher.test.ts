import { describe, it, expect } from "vitest";
import { createRouter, formatTree } from "./_utils";
import { matchAllRoutes, type RouterContext } from "../src";

// Helper to make snapsots more readable
const _matchAllRoutes = (
  ctx: RouterContext,
  method: string = "",
  path: string,
) => matchAllRoutes(ctx, method, path).map((m: any) => m.path);

describe("matcher: basic", () => {
  const router = createRouter([
    "/foo",
    "/foo/**",
    "/foo/bar",
    "/foo/bar/baz",
    "/foo/*/baz",
    "/**",
  ]);

  it("snapshot", () => {
    expect(formatTree(router.root)).toMatchInlineSnapshot(`
      "<root>
          ├── /foo ┈> [GET] /foo
          │       ├── /bar ┈> [GET] /foo/bar
          │       │       ├── /baz ┈> [GET] /foo/bar/baz
          │       ├── /*
          │       │       ├── /baz ┈> [GET] /foo/*/baz
          │       ├── /** ┈> [GET] /foo/**
          ├── /** ┈> [GET] /**"
    `);
  });

  it("matches /foo/bar/baz pattern", () => {
    const matches = _matchAllRoutes(router, "GET", "/foo/bar/baz");
    expect(matches).to.toMatchInlineSnapshot(`
      [
        "/**",
        "/foo/**",
        "/foo/*/baz",
        "/foo/bar/baz",
      ]
    `);
  });
});

describe("matcher: complex", () => {
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
      "<root> ┈> [GET] /
          ├── /foo ┈> [GET] /foo
          │       ├── /bar ┈> [GET] /foo/bar
          │       ├── /baz ┈> [GET] /foo/baz
          │       │       ├── /** ┈> [GET] /foo/baz/**
          │       ├── /* ┈> [GET] /foo/*
          │       │       ├── /sub ┈> [GET] /foo/*/sub
          │       ├── /** ┈> [GET] /foo/**
          ├── /without-trailing ┈> [GET] /without-trailing
          ├── /with-trailing ┈> [GET] /with-trailing/
          ├── /c
          │       ├── /** ┈> [GET] /c/**
          ├── /cart ┈> [GET] /cart"
    `);
  });

  it("can match routes", () => {
    expect(_matchAllRoutes(router, "GET", "/")).to.toMatchInlineSnapshot(`
      [
        "/",
      ]
    `);
    expect(_matchAllRoutes(router, "GET", "/foo")).to.toMatchInlineSnapshot(`
      [
        "/foo/**",
        "/foo/*",
        "/foo",
      ]
    `);
    expect(_matchAllRoutes(router, "GET", "/foo/bar")).to
      .toMatchInlineSnapshot(`
        [
          "/foo/**",
          "/foo/*",
          "/foo/bar",
        ]
      `);
    expect(_matchAllRoutes(router, "GET", "/foo/baz")).to
      .toMatchInlineSnapshot(`
        [
          "/foo/**",
          "/foo/*",
          "/foo/baz/**",
          "/foo/baz",
        ]
      `);
    expect(_matchAllRoutes(router, "GET", "/foo/123/sub")).to
      .toMatchInlineSnapshot(`
        [
          "/foo/**",
          "/foo/*/sub",
        ]
      `);
    expect(_matchAllRoutes(router, "GET", "/foo/123")).to
      .toMatchInlineSnapshot(`
        [
          "/foo/**",
          "/foo/*",
        ]
      `);
  });

  it("trailing slash", () => {
    // Defined with trailing slash
    expect(_matchAllRoutes(router, "GET", "/with-trailing")).to
      .toMatchInlineSnapshot(`
        [
          "/with-trailing/",
        ]
      `);
    expect(_matchAllRoutes(router, "GET", "/with-trailing")).toMatchObject(
      _matchAllRoutes(router, "GET", "/with-trailing/"),
    );

    // Defined without trailing slash
    expect(_matchAllRoutes(router, "GET", "/without-trailing")).to
      .toMatchInlineSnapshot(`
        [
          "/without-trailing",
        ]
      `);
    expect(_matchAllRoutes(router, "GET", "/without-trailing")).toMatchObject(
      _matchAllRoutes(router, "GET", "/without-trailing/"),
    );
  });

  it("prefix overlap", () => {
    expect(_matchAllRoutes(router, "GET", "/c/123")).to.toMatchInlineSnapshot(
      `
      [
        "/c/**",
      ]
    `,
    );
    expect(_matchAllRoutes(router, "GET", "/c/123")).toMatchObject(
      _matchAllRoutes(router, "GET", "/c/123/"),
    );
    expect(_matchAllRoutes(router, "GET", "/c/123")).toMatchObject(
      _matchAllRoutes(router, "GET", "/c"),
    );

    expect(_matchAllRoutes(router, "GET", "/cart")).to.toMatchInlineSnapshot(
      `
      [
        "/cart",
      ]
    `,
    );
  });
});

describe("matcher: order", () => {
  const router = createRouter([
    "/hello",
    "/hello/world",
    "/hello/*",
    "/hello/**",
  ]);

  it("snapshot", () => {
    expect(formatTree(router.root)).toMatchInlineSnapshot(`
      "<root>
          ├── /hello ┈> [GET] /hello
          │       ├── /world ┈> [GET] /hello/world
          │       ├── /* ┈> [GET] /hello/*
          │       ├── /** ┈> [GET] /hello/**"
    `);
  });

  it("/hello", () => {
    const matches = _matchAllRoutes(router, "GET", "/hello");
    expect(matches).to.toMatchInlineSnapshot(`
      [
        "/hello/**",
        "/hello/*",
        "/hello",
      ]
    `);
  });

  it("/hello/world", () => {
    const matches = _matchAllRoutes(router, "GET", "/hello/world");
    expect(matches).to.toMatchInlineSnapshot(`
      [
        "/hello/**",
        "/hello/*",
        "/hello/world",
      ]
    `);
  });

  it("/hello/world/foobar", () => {
    const matches = _matchAllRoutes(router, "GET", "/hello/world/foobar");
    expect(matches).to.toMatchInlineSnapshot(`
      [
        "/hello/**",
      ]
    `);
  });
});
