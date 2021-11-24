import { expect } from 'chai'
import { createRouter } from '../src'

export function createRoutes(paths) {
  return Object.fromEntries(paths.map((path) => [path, { path }]))
}

function testRouter(paths, tests?) {
  const routes = createRoutes(paths)
  const router = createRouter({ routes })

  if (!tests) {
    tests = routes
  }

  for (const path in tests) {
    it(`lookup ${path} should be ${JSON.stringify(tests[path])}`, () => {
      expect(router.lookup(path)).to.deep.equal(tests[path])
    })
  }
}

describe('Router lookup', function () {
  describe('static routes', function () {
    testRouter([
      '/',
      '/route',
      '/another-router',
      '/this/is/yet/another/route'
    ])
  })

  describe('retrieve placeholders', function () {
    testRouter([
      'carbon/:element',
      'carbon/:element/test/:testing',
      'this/:route/has/:cool/stuff',
    ], {
      'carbon/test1': {
        path: 'carbon/:element',
        params: {
          element: 'test1'
        }
      },
      '/carbon': null,
      // TODO
      // 'carbon/': null,
      'carbon/test2/test/test23': {
        path: 'carbon/:element/test/:testing',
        params: {
          element: 'test2',
          testing: 'test23'
        }
      },
      'this/test/has/more/stuff': {
        path: 'this/:route/has/:cool/stuff',
        params: {
          route: 'test',
          cool: 'more'
        }
      }
    })
  })

  describe('should be able to perform wildcard lookups', function () {
    testRouter([
      'polymer/**',
      'polymer/another/route',
    ], {
      'polymer/another/route': { path: 'polymer/another/route' },
      'polymer/anon': { path: 'polymer/**' },
      'polymer/2415': { path: 'polymer/**' }
    })
  })

  describe('should be able to match routes with trailing slash', function () {
    testRouter([
      'route/without/trailing/slash',
      'route/with/trailing/slash/',
    ], {
      'route/without/trailing/slash': { path: 'route/without/trailing/slash' },
      'route/with/trailing/slash/': { path: 'route/with/trailing/slash/' },
      // TODO
      // 'route/without/trailing/slash/': { path: 'route/without/trailing/slash' },
      // 'route/with/trailing/slash': { path: 'route/with/trailing/slash/' },
    })
  })
})

describe('Router startsWith', function () {
  it('should be able retrieve all results via prefix', function () {
    const paths = [
      'hello',
      'hi',
      'helium',
      'chrome',
      'choot',
      'chromium'
    ]

    const router = createRouter(createRoutes(paths))

    const testLookupAll = (prefix, pathsToMatch) => {
      const matches = router.lookupAll('h')
      for (const p of pathsToMatch) {
        expect(matches.find(m => m.path === p))
      }
    }

    testLookupAll('h', ['hello', 'hi', 'helium'])
    testLookupAll('c', ['chrome', 'chroot', 'chromium'])
  })
})
