import {
  RadixNode,
  RadixRouter,
  RadixNodeData,
  NODE_TYPES,
  DehydratedRouteTable,
} from "./types";

export interface RouteTable {
  static: Map<string, RadixNodeData>;
  wildcard: Map<string, RadixNodeData>;
  dynamic: Map<string, RouteTable>;
}

export interface RouteMatcher {
  ctx: { table: RouteTable };
  matchAll: (path: string) => RadixNodeData[];
}

export function toRouteMatcher(router: RadixRouter): RouteMatcher {
  const table = _routerNodeToTable("", router.ctx.rootNode);
  return _createMatcher(table);
}

function _createMatcher(table: RouteTable): RouteMatcher {
  return {
    ctx: { table },
    matchAll: (path) => _matchRoutes(path, table),
  } satisfies RouteMatcher;
}

function _createRouteTable(): RouteTable {
  return <RouteTable>{
    static: new Map(),
    wildcard: new Map(),
    dynamic: new Map(),
  };
}

export function exportMatcherTable(table: RouteTable): DehydratedRouteTable {
  const obj = Object.create(null);

  for (const property in table) {
    obj[property] =
      property === "dynamic"
        ? Object.fromEntries(
            [...table[property].entries()].map(([key, value]) => [
              key,
              exportMatcherTable(value),
            ])
          )
        : Object.fromEntries(table[property].entries());
  }

  return obj;
}

function createTableFromExport(tableImport: DehydratedRouteTable): RouteTable {
  const table: Partial<RouteTable> = {};
  for (const property in tableImport) {
    table[property] =
      property === "dynamic"
        ? new Map(
            Object.entries(tableImport[property]).map(([key, value]) => [
              key,
              createTableFromExport(value as any),
            ])
          )
        : new Map(Object.entries(tableImport[property]));
  }
  return table as RouteTable;
}

export function createMatcherFromTable(
  tableImport: DehydratedRouteTable
): RouteMatcher {
  return _createMatcher(createTableFromExport(tableImport));
}

function _matchRoutes(path: string, table: RouteTable): RadixNodeData[] {
  // Order should be from less specific to most specific
  const matches = [];

  // Wildcard
  for (const [key, value] of _sortRoutesMap(table.wildcard)) {
    if (path.startsWith(key)) {
      matches.push(value);
    }
  }

  // Dynamic
  for (const [key, value] of _sortRoutesMap(table.dynamic)) {
    if (path.startsWith(key + "/")) {
      const subPath =
        "/" + path.slice(key.length).split("/").splice(2).join("/");
      matches.push(..._matchRoutes(subPath, value));
    }
  }

  // Static
  const staticMatch = table.static.get(path);
  if (staticMatch) {
    matches.push(staticMatch);
  }

  return matches.filter(Boolean);
}

function _sortRoutesMap(m: Map<string, any>) {
  return [...m.entries()].sort((a, b) => a[0].length - b[0].length);
}

function _routerNodeToTable(
  initialPath: string,
  initialNode: RadixNode
): RouteTable {
  const table: RouteTable = _createRouteTable();
  function _addNode(path: string, node: RadixNode) {
    if (path) {
      if (
        node.type === NODE_TYPES.NORMAL &&
        !(path.includes("*") || path.includes(":"))
      ) {
        table.static.set(path, node.data);
      } else if (node.type === NODE_TYPES.WILDCARD) {
        table.wildcard.set(path.replace("/**", ""), node.data);
      } else if (node.type === NODE_TYPES.PLACEHOLDER) {
        const subTable = _routerNodeToTable("", node);
        if (node.data) {
          subTable.static.set("/", node.data);
        }
        table.dynamic.set(path.replace(/\/\*|\/:\w+/, ""), subTable);
        return;
      }
    }
    for (const [childPath, child] of node.children.entries()) {
      _addNode(`${path}/${childPath}`.replace("//", "/"), child);
    }
  }
  _addNode(initialPath, initialNode);
  return table;
}
