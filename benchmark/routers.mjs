import * as radix3 from '../dist/index.mjs'
import * as radix3V1 from 'radix3-v1'
import MedlyRouter from '@medley/router'
import { RegExpRouter as HonoRegExpRouter } from 'hono/router/reg-exp-router'
import { TrieRouter as HonoTrieRouter } from 'hono/router/trie-router'
import KoaTreeRouter from 'koa-tree-router'

const noop = () => undefined

class BaseRouter {
  constructor(routes, withParams = true) {
    this.routes = routes
    this.withParams = withParams
  }
}

// https://github.com/unjs/radix3

class Radix3 extends BaseRouter {
  init() {
    this.router = radix3.createRouter()
    for (const route of this.routes) {
      this.router.insert(route.path, { [route.method]: noop })
    }
  }
  match(request) {
    const match = this.router.lookup(request.path)
    return {
      handler: match.data[request.method],
      params: this.withParams ? match.params : undefined
    }
  }
}

class Radix3V1 extends BaseRouter {
  init() {
    this.router = radix3V1.createRouter()
    for (const route of this.routes) {
      this.router.insert(route.path, { [route.method]: noop })
    }
  }
  match(request) {
    const match = this.router.lookup(request.path)
    return {
      handler: match[request.method],
      params: this.withParams ? match.params : undefined
    }
  }
}

// https://github.com/medleyjs/router

class Medley extends BaseRouter {
  init() {
    this.router = new MedlyRouter()
    for (const route of this.routes) {
      const store = this.router.register(route.path)
      store[route.method] = noop
    }
  }
  match(request) {
    // eslint-disable-next-line unicorn/no-array-callback-reference
    const match = this.router.find(request.path)
    return {
      handler: match.store[request.method],
      params: this.withParams ? match.params : undefined
    }
  }
}

// https://hono.dev/docs/concepts/routers

class HonoRegExp extends BaseRouter {
  init() {
    this.router = new HonoRegExpRouter()
    for (const route of this.routes) {
      this.router.add(route.method, route.path, noop)
    }
  }
  match(request) {
    // [[handler, paramIndexMap][], paramArray]
    const match = this.router.match(request.method, request.path)
    let params
    if (this.withParams && match[1]) {
      // TODO: Where does hono do it ?!
      params = Object.create(null)
      const paramArray = match[1]
      for (let i = 1; i < match[0][0].length; i++) {
        for (const paramName in match[0][0][i]) {
          const paramIndex = match[0][0][i][paramName]
          params[paramName] = paramArray[paramIndex]
        }
      }
    }
    return {
      handler: match[0][0][0],
      params: params
    }
  }
}

class HonoTrie extends BaseRouter {
  init() {
    this.router = new HonoTrieRouter()
    for (const route of this.routes) {
      this.router.add(route.method, route.path, noop)
    }
  }
  match(request) {
    // [[handler, paramIndexMap][], paramArray]
    const match = this.router.match(request.method, request.path)
    return {
      handler: match[0][0][0],
      params: this.withParams ? match[0][0][1] : undefined
    }
  }
}

// https://github.com/steambap/koa-tree-router

class KoaTree extends BaseRouter {
  init() {
    this.router = new KoaTreeRouter()
    for (const route of this.routes) {
      this.router.on(route.method, route.path, noop)
    }
  }
  match(request) {
    // eslint-disable-next-line unicorn/no-array-callback-reference, unicorn/no-array-method-this-argument
    const match = this.router.find(request.method, request.path)
    let params
    if (this.withParams && match.params) {
      params = Object.create(null)
      for (const param of match.params) {
        params[param.key] = param.value
      }
    }
    return {
      handler: match.handle[0],
      params
    }
  }
}

export const routers = {
  radix3: Radix3,
  'radix3-v1': Radix3V1,
  medley: Medley,
  'hono-regexp': HonoRegExp,
  'hono-trie': HonoTrie,
  'koa-tree': KoaTree
}
