import { describe, it, expect } from 'vitest'
import { createRouter, routerToMatcher } from '../src'

export function createRoutes (paths) {
  return Object.fromEntries(paths.map(path => [path, { pattern: path }]))
}

describe('Route matcher', function () {
  const routes = createRoutes([
    '/',
    '/foo',
    '/foo/*',
    '/foo/**',
    '/foo/bar',
    '/foo/baz',
    '/foo/baz/**',
    '/foo/*/sub'
  ])

  const router = createRouter({ routes })
  const matcher = routerToMatcher(router)

  const _match = path => matcher.match(path).map(r => r.pattern)

  it('can create route table', () => {
    expect(matcher.ctx.table).to.toMatchInlineSnapshot(`
      {
        "dynamic": Map {
          "/foo" => {
            "dynamic": Map {},
            "static": Map {
              "/sub" => {
                "pattern": "/foo/*/sub",
              },
              "/" => {
                "pattern": "/foo/*",
              },
            },
            "wildcard": Map {},
          },
        },
        "static": Map {
          "/" => {
            "pattern": "/",
          },
          "/foo" => {
            "pattern": "/foo",
          },
          "/foo/bar" => {
            "pattern": "/foo/bar",
          },
          "/foo/baz" => {
            "pattern": "/foo/baz",
          },
        },
        "wildcard": Map {
          "/foo" => {
            "pattern": "/foo/**",
          },
          "/foo/baz" => {
            "pattern": "/foo/baz/**",
          },
        },
      }
    `)
  })

  it('can match routes', () => {
    expect(_match('/')).to.toMatchInlineSnapshot(`
      [
        "/",
      ]
    `)
    expect(_match('/foo')).to.toMatchInlineSnapshot(`
      [
        "/foo/**",
        "/foo",
      ]
    `)
    expect(_match('/foo/bar')).to.toMatchInlineSnapshot(`
      [
        "/foo/**",
        "/foo/*",
        "/foo/bar",
      ]
    `)
    expect(_match('/foo/baz')).to.toMatchInlineSnapshot(`
      [
        "/foo/**",
        "/foo/baz/**",
        "/foo/*",
        "/foo/baz",
      ]
    `)
    expect(_match('/foo/123/sub')).to.toMatchInlineSnapshot(`
      [
        "/foo/**",
        "/foo/*/sub",
      ]
    `)
    expect(_match('/foo/123')).to.toMatchInlineSnapshot(`
      [
        "/foo/**",
        "/foo/*",
      ]
    `)
  })
})
