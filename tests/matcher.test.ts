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
          ├── /foo ┈> [GET] {"m":"foo"}
          │       ├── /bar ┈> [GET] {"m":"foo/bar"}
          │       │       ├── /baz ┈> [GET] {"m":"foo/bar/baz","order":"4"}
          │       ├── /*
          │       │       ├── /baz ┈> [GET] {"m":"foo/*/baz","order":"3"}
          │       ├── /** ┈> [GET] {"m":"foo/**","order":"2"}
          ├── /** ┈> [GET] {"m":"/**","order":"1"}"
    `);
  });

  it("matches /foo/bar/baz pattern", () => {
    const matches = matchAllRoutes(router, "", "/foo/bar/baz");
    expect(matches).to.toMatchInlineSnapshot(`[]`);
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
    expect(matchAllRoutes(router, "", "/")).to.toMatchInlineSnapshot(`[]`);
    expect(matchAllRoutes(router, "", "/foo")).to.toMatchInlineSnapshot(`[]`);
    expect(matchAllRoutes(router, "", "/foo/bar")).to.toMatchInlineSnapshot(
      `[]`,
    );
    expect(matchAllRoutes(router, "", "/foo/baz")).to.toMatchInlineSnapshot(
      `[]`,
    );
    expect(matchAllRoutes(router, "", "/foo/123/sub")).to.toMatchInlineSnapshot(
      `[]`,
    );
    expect(matchAllRoutes(router, "", "/foo/123")).to.toMatchInlineSnapshot(
      `[]`,
    );
  });

  it("trailing slash", () => {
    // Defined with trailing slash
    expect(
      matchAllRoutes(router, "", "/with-trailing"),
    ).to.toMatchInlineSnapshot(`[]`);
    expect(matchAllRoutes(router, "", "/with-trailing")).toMatchObject(
      matchAllRoutes(router, "", "/with-trailing/"),
    );

    // Defined without trailing slash
    expect(
      matchAllRoutes(router, "", "/without-trailing"),
    ).to.toMatchInlineSnapshot(`[]`);
    expect(matchAllRoutes(router, "", "/without-trailing")).toMatchObject(
      matchAllRoutes(router, "", "/without-trailing/"),
    );
  });

  it("prefix overlap", () => {
    expect(matchAllRoutes(router, "", "/c/123")).to.toMatchInlineSnapshot(`[]`);
    expect(matchAllRoutes(router, "", "/c/123")).toMatchObject(
      matchAllRoutes(router, "", "/c/123/"),
    );
    expect(matchAllRoutes(router, "", "/c/123")).toMatchObject(
      matchAllRoutes(router, "", "/c"),
    );

    expect(matchAllRoutes(router, "", "/cart")).to.toMatchInlineSnapshot(`[]`);
  });
});
