import { RadixNode, RadixRouter, NODE_TYPES } from './types'

export type RouteData = any

export interface RouteTable {
  static: Map<string, RouteData>
  wildcard: Map<string, RouteData>
  dynamic: Map<string, RouteTable>
}

export function createRouteMatcher (router: RadixRouter) {
  const table = createRouteTable('', router.ctx.rootNode)
  return {
    ctx: { table },
    match: path => matchRoutes(path, table)
  }
}

function matchRoutes (path: string, table: RouteData): RouteData[] {
  const matches = []

  // Wildcard
  for (const [key, value] of table.wildcard) {
    if (path.startsWith(key)) {
      matches.push(value)
    }
  }

  // Dynamic
  for (const [key, value] of table.dynamic) {
    if (path.startsWith(key)) {
      const subPath = '/' + path.substring(key.length).split('/').splice(2).join('/')
      matches.push(...matchRoutes(subPath, value))
    }
  }

  // Static
  const staticMatch = table.static.get(path)
  if (staticMatch) {
    matches.push(staticMatch)
  }

  return matches.filter(Boolean)
}

function createRouteTable (initialPath: string, initialNode: RadixNode): RouteTable {
  const table: RouteTable = {
    static: new Map(),
    wildcard: new Map(),
    dynamic: new Map()
  }

  const addNode = (path: string, node: RadixNode) => {
    if (path) {
      if (node.type === NODE_TYPES.NORMAL && !path.includes('*')) {
        table.static.set(path, node.data)
      } else if (node.type === NODE_TYPES.WILDCARD) {
        table.wildcard.set(path.replace('/**', ''), node.data)
      } else if (node.type === NODE_TYPES.PLACEHOLDER) {
        table.dynamic.set(path.replace('/*', ''), createRouteTable('', node))
        return
      }
    }
    for (const [childPath, child] of node.children.entries()) {
      addNode(`${path}/${childPath}`.replace('//', '/'), child)
    }
  }

  addNode(initialPath, initialNode)

  return table
}
