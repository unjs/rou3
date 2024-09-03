import { rmSync, writeFileSync } from "node:fs";
import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  outDir: "dist",
  declaration: true,
  clean: true,
  entries: [
    {
      builder: "rollup",
      input: "./src/index",
    },
  ],
  rollup: {
    emitCJS: true,
  },
  hooks: {
    "rollup:done": () => {
      rmSync("./dist/index.d.cts");
      rmSync("./dist/index.d.mts");
      writeFileSync("./dist/index.mjs", `export * from './index.cjs';`);
    },
  },
});
