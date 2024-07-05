import { build } from "esbuild";
import zlib from "node:zlib";
import { routerImports } from "./routers/_all.mjs";

export const bundleSizes = {};

for (const [name, [className, importPath]] of Object.entries(routerImports)) {
  const res = await build({
    bundle: true,
    metafile: true,
    write: false,
    minify: true,
    format: "esm",
    platform: "node",
    outfile: "index.mjs",
    stdin: {
      contents: /* js */ `
        import { ${className} as Router } from "${importPath}";
        const router = new Router();
      `,
      resolveDir: new URL(".", import.meta.url).pathname,
      sourcefile: "index.mjs",
      loader: "js",
    },
  });
  const { bytes } = res.metafile.outputs["index.mjs"];
  const gzipSize = zlib.gzipSync(res.outputFiles[0].text).byteLength;
  bundleSizes[name] = { bytes, gzipSize };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("Bundle sizes:");
  console.table(bundleSizes);
}
