export default {
  generators: {
    bench: {
      async generate(ctx) {
        if (
          (ctx.args.bun && !globalThis.Bun) ||
          (ctx.args.node && globalThis.Bun)
        ) {
          return {
            contents: ctx.block.contents,
          };
        }
        const { output } = await import("./compare.mjs");
        return {
          contents: output.join("\n"),
        };
      },
    },
  },
};
