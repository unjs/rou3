import { expect } from 'chai'
import { createRouter } from '../src'
import { createRoutes } from './lookup.test'

describe('Router remove', function () {
  it('should be able to remove nodes', function () {
    const router = createRouter({
      routes: createRoutes([
        'hello',
        'cool',
        'hi',
        'helium',
        'coooool',
        'chrome',
        'choot',
        'choot/:choo',
        'ui/**',
        'ui/components/**'
      ])
    })

    router.remove('choot')
    expect(router.lookup('choot')).to.deep.equal(null)

    expect(router.lookup('ui/components/snackbars')).to.deep.equal({
      path: 'ui/components/**'
    })

    router.remove('ui/components/**')
    expect(router.lookup('ui/components/snackbars')).to.deep.equal({
      path: 'ui/**'
    })
  })

  it('should be able to remove placeholder routes', function () {
    const router = createRouter({
      routes: createRoutes([
        'placeholder/:choo',
        'placeholder/:choo/:choo2'
      ])
    })

    expect(router.lookup('placeholder/route')).to.deep.equal({
      path: 'placeholder/:choo',
      params: {
        choo: 'route'
      }
    })

    // TODO
    // router.remove('placeholder/:choo')
    // expect(router.lookup('placeholder/route')).to.deep.equal(null)

    expect(router.lookup('placeholder/route/route2')).to.deep.equal({
      path: 'placeholder/:choo/:choo2',
      params: {
        choo: 'route',
        choo2: 'route2'
      }
    })
  })

  it('should be able to remove wildcard routes', function () {
    const router = createRouter({
      routes: createRoutes([
        'ui/**',
        'ui/components/**'
      ])
    })

    expect(router.lookup('ui/components/snackbars')).to.deep.equal({
      path: 'ui/components/**'
    })
    router.remove('ui/components/**')
    expect(router.lookup('ui/components/snackbars')).to.deep.equal({
      path: 'ui/**'
    })
  })

  it('should return a result signifying that the remove operation was successful or not', function () {
    const router = createRouter({
      routes: createRoutes([
        '/some/route'
      ])
    })

    let removeResult = router.remove('/some/route')
    expect(removeResult).to.equal(true)

    removeResult = router.remove('/some/route')
    expect(removeResult).to.equal(false)

    removeResult = router.remove('/some/route/that/never/existed')
    expect(removeResult).to.equal(false)
  })
})
