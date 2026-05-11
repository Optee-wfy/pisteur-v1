import { Environment } from "./environment.type";

const apiPort = 3000;

// This file will be replaced by the CI script

export const environmentCI: Environment = {
  slug: "development",
  sentryRelease: "local_no_release",
  supabaseUrl: "https://jexctrkbifrqmsxuixzk.supabase.co",
  supabaseKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpleGN0cmtiaWZycW1zeHVpeHprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNjI2NjUsImV4cCI6MjA5MzczODY2NX0.BVnNxeIm5_m-g6u86yDA_NljedzhruxAClF9Xrg1IBg",
  apiPort,
  apiUrl: `http://localhost:${apiPort}`,
};
