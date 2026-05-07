import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env["DATABASE_URL"];

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

export default defineConfig({
  schema: "../libs/shared/models/src/lib/schema.ts",
  out: "../supabase/migrations",
  dialect: "postgresql",
  schemaFilter: ["public"], // Source: https://github.com/supabase/supabase/issues/19883#issuecomment-2094656180
  dbCredentials: {
    url: databaseUrl,
  },
});
