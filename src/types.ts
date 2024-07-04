export type RouteData<T = Record<string, unknown>> = T;

export interface RouterOptions {
  strictTrailingSlash?: boolean;
}

export interface RouterContext<T extends RouteData = RouteData> {
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

export interface Node<T extends RouteData = RouteData> {
  key: string;

  staticChildren?: Record<string, Node<T>>;
  paramChild?: Node<T>;
  wildcardChild?: Node<T>;

  index?: number;
  data?: T;
  paramNames?: Array<{ index: number; name: string | RegExp }>;
}

export type MatchedRoute<T extends RouteData = RouteData> = {
  data?: T;
  params?: Record<string, string>;
};
