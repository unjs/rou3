import type { RadixRouterContext, RadixNode, MatchedRoute, RadixRouter, RadixNodeData, RadixRouterInitOptions } from './types'
import { NODE_TYPES } from './types'

export function createRouter<T extends RadixNodeData = RadixNodeData> (options: RadixRouterInitOptions = {}): RadixRouter<T> {
  const ctx: RadixRouterContext = {
    rootNode: createRadixNode(),
    staticRoutesMap: {}
  }

  if (options.routes) {
    for (const path in options.routes) {
      insert(ctx, path, options.routes[path])
    }
  }

  return {
    ctx,
    // @ts-ignore
    lookup: (path: string) => lookup(ctx, path),
    lookupAll: (prefix: string) => lookupAll(ctx, prefix),
    insert: (path: string, data: any) => insert(ctx, path, data),
    remove: (path: string) => remove(ctx, path)
  }
}

function lookup (ctx: RadixRouterContext, path: string): MatchedRoute {
  const staticPathNode = ctx.staticRoutesMap[path]
  if (staticPathNode) {
    return staticPathNode.data
  }

  const sections = path.split('/')

  const params: MatchedRoute['params'] = {}
  let paramsFound = false
  let wildcardNode = null
  let node = ctx.rootNode

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i]

    if (node.wildcardChildNode !== null) {
      wildcardNode = node.wildcardChildNode
    }

    // Exact matches take precedence over placeholders
    const nextNode = node.children[section]
    if (nextNode !== undefined) {
      node = nextNode
    } else {
      node = node.placeholderChildNode
      if (node !== null) {
        params[node.paramName] = section
        paramsFound = true
      } else {
        break
      }
    }
  }

  if ((node === null || node.data === null) && wildcardNode !== null) {
    node = wildcardNode
  }

  if (!node) {
    return null
  }

  if (paramsFound) {
    return {
      ...node.data,
      params: paramsFound ? params : undefined
    }
  }

  return node.data
}

function lookupAll (ctx: RadixRouterContext, prefix: string) {
  const sections = prefix.split('/')
  let node = ctx.rootNode
  const resultArray = []
  const endSections = sections.length - 1

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i]

    if (node.data) {
      resultArray.push(node.data)
    }

    let nextNode = node.children[section]

    if (nextNode !== undefined) {
      node = nextNode
    } else if (i === endSections) {
      const keys = Object.keys(node.children)

      for (let j = 0; j < keys.length; j++) {
        const key = keys[j]

        if (key.startsWith(section)) {
          nextNode = node.children[key]

          if (nextNode.data) {
            resultArray.push(nextNode.data)
          }
        }
      }
    }
  }

  return resultArray
}

function insert (ctx: RadixRouterContext, path: string, data: any) {
  let isStaticRoute = true

  const sections = path.split('/')

  let node = ctx.rootNode

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i]

    const children = node.children
    let childNode

    if ((childNode = children[section])) {
      node = childNode
    } else {
      const type = getNodeType(section)

      // Create new node to represent the next part of the path
      childNode = createRadixNode({ type, parent: node })

      node.children[section] = childNode

      if (type === NODE_TYPES.PLACEHOLDER) {
        childNode.paramName = section.slice(1)
        node.placeholderChildNode = childNode
        isStaticRoute = false
      } else if (type === NODE_TYPES.WILDCARD) {
        node.wildcardChildNode = childNode
        isStaticRoute = false
      }

      node = childNode
    }
  }

  // Store whatever data was provided into the node
  node.data = data

  // Optimization, if a route is static and does not have any
  // variable sections, we can store it into a map for faster retrievals
  if (isStaticRoute === true) {
    ctx.staticRoutesMap[path] = node
  }

  return node
}

function remove (ctx: RadixRouterContext, path: string) {
  let success = false
  const sections = path.split('/')
  let node = ctx.rootNode

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i]
    node = node.children[section]
    if (!node) {
      return success
    }
  }

  if (node.data) {
    const lastSection = sections[sections.length - 1]
    node.data = null
    if (Object.keys(node.children).length === 0) {
      const parentNode = node.parent
      delete parentNode[lastSection]
      parentNode.wildcardChildNode = null
      parentNode.placeholderChildNode = null
    }
    success = true
  }

  return success
}

function createRadixNode (options: Partial<RadixNode> = {}): RadixNode {
  return {
    type: options.type || NODE_TYPES.NORMAL,
    parent: options.parent || null,
    children: {},
    data: options.data || null,
    paramName: options.paramName || null,
    wildcardChildNode: null,
    placeholderChildNode: null
  }
}

function getNodeType (str: string) {
  if (str[0] === ':') { return NODE_TYPES.PLACEHOLDER }
  if (str === '**') { return NODE_TYPES.WILDCARD }
  return NODE_TYPES.NORMAL
}
