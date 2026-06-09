import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [
    nodePolyfills({
      // Enable Browser compatible shims for these globals
      globals: {
        buffer: true,
        global: true,
        process: true,
      },
      // Optionally include any modules that need polyfills
      protocolImports: true,
    }),
  ],
  resolve: {
    alias: {
      buffer: "buffer/",
    },
  },
  optimizeDeps: {
    include: ["buffer", "@solana/web3.js", "@solana/spl-token", "@metaplex-foundation/mpl-token-metadata"],
  },
});
