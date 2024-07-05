import { HonoRegExp, HonoTrie } from "./hono.mjs";
import { KoaTree } from "./koa.mjs";
import { Medley } from "./medley.mjs";
import { Radix3 } from "./radix3.mjs";
import { Rou3 } from "./rou3.mjs";

export const routers = {
  rou: Rou3,
  radix3: Radix3,
  medley: Medley,
  "hono-regexp": HonoRegExp,
  "hono-trie": HonoTrie,
  "koa-tree": KoaTree,
};
