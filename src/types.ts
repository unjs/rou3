export interface RouterContext<T = unknown> {
  root: Node<T>;
  static: Record<string, Node<T> | undefined>;
}

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
