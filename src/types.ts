export interface RouterOptions {
  strictTrailingSlash?: boolean;
}

export interface RouterContext<T = unknown> {
  options: RouterOptions;
  root: Node<T>;
  static: Record<string, Node<T> | undefined>;
}

export const NODE_TYPES = {
  STATIC: 0 as const,
  PARAM: 1 as const,
  WILDCARD: 3 as const,
};

type _NODE_TYPES = typeof NODE_TYPES;

export type NODE_TYPE = _NODE_TYPES[keyof _NODE_TYPES];

export type Params = Array<[Index: number, name: string | RegExp]>;

export interface Node<T = unknown> {
  key: string;

  static?: Record<string, Node<T>>;
  param?: Node<T>;
  wildcard?: Node<T>;

  index?: number;
  methods?: Record<string, [Data: T, Params?: Params] | undefined>;
}

export type MatchedRoute<T = unknown> = {
  data?: T | undefined;
  params?: Record<string, string>;
};
