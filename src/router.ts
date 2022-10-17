import type { RadixRouterContext, RadixNode, MatchedRoute, RadixRouter, RadixNodeData, RadixRouterOptions } from './types'
import { NODE_TYPES } from './types'

export function createRouter<T extends RadixNodeData = RadixNodeData> (options: RadixRouterOptions = {}): RadixRouter<T> {
  const ctx: RadixRouterContext = {
    options,
    rootNode: createRadixNode(),
    staticRoutesMap: {},
    funcs: options.funcs || {}
  }

  const normalizeTrailingSlash = p => options.strictTrailingSlash ? p : (p.replace(/\/$/, '') || '/')

  if (options.routes) {
    for (const path in options.routes) {
      insert(ctx, normalizeTrailingSlash(path), options.routes[path])
    }
  }

  return {
    ctx,
    // @ts-ignore
    lookup: (path: string) => lookup(ctx, normalizeTrailingSlash(path)),
    insert: (path: string, data: any) => insert(ctx, normalizeTrailingSlash(path), data),
    remove: (path: string) => remove(ctx, normalizeTrailingSlash(path))
  }
}

function find (arr: Array<RadixNode>, section: string): RadixNode | undefined {
  for (let i = 0; i < arr.length; i++) {
    const node = arr[i]
    if (node.check(section)) { return node }
  }
  return undefined
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
  let wildCardParam = null

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i]

    if (node.wildcardChildNode !== null) {
      wildcardNode = node.wildcardChildNode
      wildCardParam = sections.slice(i).join('/')
    }

    // Exact matches take precedence over placeholders
    const nextNode = node.children.get(section)
    if (nextNode !== undefined) {
      node = nextNode
    } else if (node.placeholderChildrenNodeChecked) {
      const currNode = find(node.placeholderChildrenNodeChecked, section)
      if (currNode) {
        node = currNode
        params[node.paramName] = section
        paramsFound = true
      } else {
        node = node.placeholderChildNode
        if (node !== null) {
          params[node.paramName] = section
          paramsFound = true
        } else {
          break
        }
      }
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
    params[node.paramName || '_'] = wildCardParam
    paramsFound = true
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

function insert (ctx: RadixRouterContext, path: string, data: any) {
  let isStaticRoute = true

  const funcs = ctx.funcs
  const sections = path.split('/')

  let node = ctx.rootNode

  let _unnamedPlaceholderCtr = 0

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i]

    let childNode: RadixNode<RadixNodeData>

    if ((childNode = node.children.get(section))) {
      node = childNode
    } else {
      const type = getNodeType(section)

      // Create new node to represent the next part of the path
      childNode = createRadixNode({ type, parent: node })

      node.children.set(section, childNode)

      if (type === NODE_TYPES.PLACEHOLDER) {
        childNode.paramName = section === '*' ? `_${_unnamedPlaceholderCtr++}` : section.slice(1)
        node.placeholderChildNode = childNode
        isStaticRoute = false
      } else if (type === NODE_TYPES.CHECKED_PLACEHOLDER) {
        if (!node.placeholderChildrenNodeChecked) { node.placeholderChildrenNodeChecked = [] }
        const splitted = section.slice(2).split(':')
        childNode.paramName = splitted[1] || `_${_unnamedPlaceholderCtr++}`
        childNode.check = funcs?.[splitted[0]] || (() => true)
        node.placeholderChildrenNodeChecked.push(childNode)
        isStaticRoute = false
      } else if (type === NODE_TYPES.WILDCARD) {
        node.wildcardChildNode = childNode
        childNode.paramName = section.substring(3 /* "**:" */) || '_'
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

  // Build node path
  const nodePath: [RadixNode, string][] = [[node, '']]
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i]
    node = node.children.get(section)
    nodePath.push([node, section])
    if (!node) {
      return success
    }
  }

  if (!node.data) { return success }

  success = true

  // Remove data from the node
  node.data = null
  // Reverse the path
  nodePath.reverse()

  // Iterate over the path and removes all 0 children path nodes
  for (const [currNode, section] of nodePath) {
    if (currNode.children.size === 0 && !currNode.data) {
      const parentNode = currNode.parent
      if (!parentNode) { continue }

      const type = getNodeType(section)
      if (type === NODE_TYPES.WILDCARD) {
        parentNode.children.delete(section)
        parentNode.wildcardChildNode = null
      } else if (type === NODE_TYPES.CHECKED_PLACEHOLDER) {
        const functionName = section.slice(2).split(':')[0]
        const i = parentNode.placeholderChildrenNodeChecked.findIndex(node => node.check === ctx.funcs[functionName])
        parentNode.placeholderChildrenNodeChecked.splice(i, i)
        if (parentNode.placeholderChildrenNodeChecked.length === 0) {
          parentNode.children.delete(section)
          parentNode.placeholderChildrenNodeChecked = null
        }
      } else {
        parentNode.children.delete(section)
      }
    }
  }

  return success
}

function createRadixNode (options: Partial<RadixNode> = {}): RadixNode {
  return {
    type: options.type || NODE_TYPES.NORMAL,
    parent: options.parent || null,
    children: new Map(),
    data: options.data || null,
    paramName: options.paramName || null,
    wildcardChildNode: null,
    placeholderChildNode: null,
    check: null,
    placeholderChildrenNodeChecked: []
  }
}

function getNodeType (str: string) {
  if (str.startsWith('**')) { return NODE_TYPES.WILDCARD }
  if (str[0] === ':' && str[1] === ':') { return NODE_TYPES.CHECKED_PLACEHOLDER }
  if (str[0] === ':' || str === '*') { return NODE_TYPES.PLACEHOLDER }
  return NODE_TYPES.NORMAL
}
