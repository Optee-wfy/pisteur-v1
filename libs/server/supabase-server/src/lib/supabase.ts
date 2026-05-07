import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env["VITE_SUPABASE_URL"];
const supabaseKey = process.env["SUPABASE_ADMIN_KEY"];

if (!supabaseUrl) {
  throw new Error("VITE_SUPABASE_URL is required");
}

if (!supabaseKey) {
  throw new Error("SUPABASE_ADMIN_KEY is required");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
