import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const databaseUrl = process.env["DATABASE_URL"];

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

// Disable prefetch as it is not supported for "Transaction" pool mode
// Connection pool needs to be enabled
// Source: https://supabase.com/dashboard/project/gcdtvcinxfjuytqyqqkv/settings/database
// Source: https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler
// Source: https://orm.drizzle.team/docs/get-started-postgresql#supabase
const client = postgres(databaseUrl, {
  prepare: false,
  max: 5,
  connect_timeout: 10,
  idle_timeout: 20,
});

export const db = drizzle(client);
