
import { defineConfig } from "@prisma/config";
import {undefined} from "effect/Match";

export default defineConfig({
  tables: undefined,
  schema: "prisma/schema.prisma",

  // Evita problemas de bloqueo en Windows
  engine: { type: "binary" },

  // Seed en TypeScript (prisma/seed.ts)
  seed: {
    provider: "ts",
    run: async () => {
      await import("./prisma/seed.ts");
    },
  }

});
