import { RadixNode, RadixRouter, RadixNodeData, NODE_TYPES } from './types'

export interface RouteTable {
  static: Map<string, RadixNodeData>
  wildcard: Map<string, RadixNodeData>
  dynamic: Map<string, RouteTable>
}

export interface RouteMatcher {
  ctx: { table: RouteTable }
  matchAll: (path: string) => RadixNodeData[]
}

export function toMatcher (router: RadixRouter): RouteMatcher {
  const table = _routerNodeToTable('', router.ctx.rootNode)
  return _createMatcher(table)
}

function _createMatcher (table: RouteTable): RouteMatcher {
  return <RouteMatcher> {
    ctx: { table },
    matchAll: path => _matchRoutes(path, table)
  }
}

function _createRouteTable (): RouteTable {
  return <RouteTable>{
    static: new Map(),
    wildcard: new Map(),
    dynamic: new Map()
  }
}

function _matchRoutes (path: string, table: RouteTable): RadixNodeData[] {
  const matches = []
  // Wildcard
  for (const [key, value] of table.wildcard) {
    if (path.startsWith(key)) {
      matches.push(value)
    }
  }
  // Dynamic
  for (const [key, value] of table.dynamic) {
    if (path.startsWith(key + '/')) {
      const subPath = '/' + path.substring(key.length).split('/').splice(2).join('/')
      matches.push(..._matchRoutes(subPath, value))
    }
  }
  // Static
  const staticMatch = table.static.get(path)
  if (staticMatch) {
    matches.push(staticMatch)
  }
  return matches.filter(Boolean)
}

function _routerNodeToTable (initialPath: string, initialNode: RadixNode): RouteTable {
  const table: RouteTable = _createRouteTable()
  function _addNode (path: string, node: RadixNode) {
    if (path) {
      if (node.type === NODE_TYPES.NORMAL && !(path.includes('*'))) {
        table.static.set(path, node.data)
      } else if (node.type === NODE_TYPES.WILDCARD) {
        table.wildcard.set(path.replace('/**', ''), node.data)
      } else if (node.type === NODE_TYPES.PLACEHOLDER) {
        const subTable = _routerNodeToTable('', node)
        subTable.static.set('/', node.data)
        table.dynamic.set(path.replace('/*', ''), subTable)
        return
      }
    }
    for (const [childPath, child] of node.children.entries()) {
      _addNode(`${path}/${childPath}`.replace('//', '/'), child)
    }
  }
  _addNode(initialPath, initialNode)
  return table
}
