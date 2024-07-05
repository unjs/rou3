import { HonoRegExp, HonoTrie, HonoParrern } from "./hono.mjs";
import { KoaTree } from "./koa.mjs";
import { Medley } from "./medley.mjs";
import { Radix3 } from "./radix3.mjs";
import { Rou3 } from "./rou3.mjs";

export const routers = {
  rou3: Rou3,
  radix3: Radix3,
  medley: Medley,
  "hono-regexp": HonoRegExp,
  "hono-trie": HonoTrie,
  "hono-pattern": HonoParrern,
  "koa-tree": KoaTree,
};

export const routerImports = {
  rou3: ["Rou3", "./routers/rou3.mjs"],
  radix3: ["Radix3", "./routers/radix3.mjs"],
  medley: ["Medley", "./routers/medley.mjs"],
  "hono-smart": ["HonoSmart", "./routers/hono.mjs"],
  "hono-regexp": ["HonoRegExp", "./routers/hono.mjs"],
  "hono-trie": ["HonoTrie", "./routers/hono.mjs"],
  "hono-pattern": ["HonoParrern", "./routers/hono.mjs"],
  "koa-tree": ["KoaTree", "./routers/koa.mjs"],
};
