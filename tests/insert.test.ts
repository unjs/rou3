import { expect } from 'chai'
import { createRouter, NODE_TYPES } from '../src'

describe('Router tree structure', function () {
  it('should be able to insert nodes correctly into the tree', function () {
    const router = createRouter()
    router.insert('hello', {})
    router.insert('cool', {})
    router.insert('hi', {})
    router.insert('helium', {})
    router.insert('/choo', {})
    router.insert('//choo', {})

    const rootNode = router.ctx.rootNode
    const helloNode = rootNode.children.hello
    const coolNode = rootNode.children.cool
    const hiNode = rootNode.children.hi
    const heliumNode = rootNode.children.helium
    const slashNode = rootNode.children['']

    expect(helloNode).to.exist
    expect(coolNode).to.exist
    expect(hiNode).to.exist
    expect(heliumNode).to.exist
    expect(slashNode).to.exist

    const slashChooNode = slashNode.children.choo
    const slashSlashChooNode = slashNode.children[''].children.choo

    expect(slashChooNode).to.exist
    expect(slashSlashChooNode).to.exist
  })

  it('should insert static routes into the static route map', function () {
    const router = createRouter()
    const route = '/api/v2/route'
    router.insert(route, {})

    expect(router.ctx.staticRoutesMap[route]).to.exist
  })
  it('should not insert variable routes into the static route map', function () {
    const router = createRouter()
    const routeA = '/api/v2/**'
    const routeB = '/api/v3/:placeholder'
    router.insert(routeA, {})
    router.insert(routeB, {})

    expect(router.ctx.staticRoutesMap[routeA]).to.not.exist
    expect(router.ctx.staticRoutesMap[routeB]).to.not.exist
  })

  it('should insert placeholder and wildcard nodes correctly into the tree', function () {
    const router = createRouter()
    router.insert('hello/:placeholder/tree', {})
    router.insert('choot/choo/**', {})

    const helloNode = router.ctx.rootNode.children.hello
    const helloPlaceholderNode = helloNode.children[':placeholder']
    expect(helloPlaceholderNode.type).to.equal(NODE_TYPES.PLACEHOLDER)

    const chootNode = router.ctx.rootNode.children.choot
    const chootChooNode = chootNode.children.choo
    const chootChooWildcardNode = chootChooNode.children['**']
    expect(chootChooWildcardNode.type).to.equal(NODE_TYPES.WILDCARD)
  })

  it('should be able to initialize routes via the router contructor', function () {
    const router = createRouter({
      routes: {
        '/api/v1': { value: 1 },
        '/api/v2': { value: 2 },
        '/api/v3': { value: 3 }
      }
    })

    const rootSlashNode = router.ctx.rootNode.children['']
    const apiNode = rootSlashNode.children.api
    const v1Node = apiNode.children.v1
    const v2Node = apiNode.children.v2
    const v3Node = apiNode.children.v3

    expect(v1Node).to.exist
    expect(v2Node).to.exist
    expect(v3Node).to.exist
    expect(v1Node.data.value).to.equal(1)
    expect(v2Node.data.value).to.equal(2)
    expect(v3Node.data.value).to.equal(3)
  })

  it('should allow routes to be overwritten by performing another insert', function () {
    const router = createRouter({
      routes: { '/api/v1': { data: 1 } }
    })

    let apiRouteData = router.lookup('/api/v1')
    expect(apiRouteData.data).to.equal(1)

    router.insert('/api/v1', {
      path: '/api/v1',
      data: 2,
      anotherField: 3
    })

    apiRouteData = router.lookup('/api/v1')
    expect(apiRouteData).deep.equal({ data: 2, path: '/api/v1', anotherField: 3 })
    expect(apiRouteData.anotherField).to.equal(3)
  })
})
