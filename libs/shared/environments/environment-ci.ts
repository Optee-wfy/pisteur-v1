import { Environment } from "./environment.type";

const apiPort = 3000;

// This file will be replaced by the CI script

export const environmentCI: Environment = {
  slug: "development",
  sentryRelease: "local_no_release",
  supabaseUrl: "http://127.0.0.1:54321",
  supabaseKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
  apiPort,
  apiUrl: `http://localhost:${apiPort}`,
};
