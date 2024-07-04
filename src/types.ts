export const NODE_TYPES = {
  STATIC: 0 as const,
  PARAM: 1 as const,
  WILDCARD: 3 as const,
};

type _NODE_TYPES = typeof NODE_TYPES;
export type NODE_TYPE = _NODE_TYPES[keyof _NODE_TYPES];

export type RadixNodeData<T = Record<string, unknown>> = T;

export type MatchedRoute<T extends RadixNodeData = RadixNodeData> = {
  data?: T;
  params?: Record<string, string>;
};

export interface RadixNode<T extends RadixNodeData = RadixNodeData> {
  key: string;

  staticChildren?: Map<string, RadixNode<T>>;
  paramChild?: RadixNode<T>;
  wildcardChild?: RadixNode<T>;

  index?: number;
  data?: T;
  paramNames?: Array<{ index: number; name: string | RegExp }>;
}

export interface RadixRouterOptions {
  strictTrailingSlash?: boolean;
  routes?: Record<string, any>;
}

export interface RadixRouterContext<T extends RadixNodeData = RadixNodeData> {
  options: RadixRouterOptions;
  root: RadixNode<T>;
  staticRoutesMap: Map<string, RadixNode>;
}

export interface RadixRouter<T extends RadixNodeData = RadixNodeData> {
  ctx: RadixRouterContext<T>;

  /**
   * Perform lookup of given path in radix tree
   * @param path - the path to search for
   *
   * @returns The data that was originally inserted into the tree
   */
  lookup(
    path: string,
    opts?: { ignoreParams?: boolean },
  ): MatchedRoute<T> | undefined;

  /**
   * Match all routes that match the given path.
   * @param path - the path to search for
   *
   * @returns The data that was originally inserted into the tree
   */
  matchAll(path: string): RadixNodeData<T>[];

  /**
   * Perform an insert into the radix tree
   * @param path - the prefix to match
   * @param data - the associated data to path
   *
   */
  insert(path: string, data: T): void;

  /**
   * Perform a remove on the tree
   * @param { string } data.path - the route to match
   *
   * @returns A boolean signifying if the remove was successful or not
   */
  remove(path: string): boolean;
}

export interface MatcherExport {
  dynamic: Map<string, MatcherExport>;
  wildcard: Map<string, { pattern: string }>;
  static: Map<string, { pattern: string }>;
}
