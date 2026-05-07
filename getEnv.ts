import dotenv from 'dotenv';
import { z, ZodError } from "zod";

dotenv.config({ path: ".env" });

const EnvSchema = z.object({
  // Available on runtime
  VITE_SUPABASE_URL: z.string(),
  VITE_SUPABASE_KEY: z.string(),
  VITE_ENV: z.string(),
  SENTRY_RELEASE: z.string(),
  // Server only
  SENTRY_API_DSN: z.string(),
  SENTRY_MARKETPLACE_RELEASE: z.string(),
  DATABASE_URL: z.string(),
  SUPABASE_ADMIN_KEY: z.string(),
  YOUSIGN_API_KEY: z.string(),
  YOUSIGN_WEBHOOK_SECRET_KEY: z.string(),
  OPENAI_ASSISTANT_API_KEY: z.string(),
  SHOWCASE_LINK: z.string(),
  CEELAB_LINK: z.string(),
  FIREBASE_API_FN_NAME: z.string(),
  STACKSYNC_BEARER_TOKEN: z.string(),
  MAILERSEND_API_KEY: z.string(),
  PDFSHIFT_API_KEY: z.string(),
  PAPPERS_API_KEY: z.string(),
  HUNTER_API_KEY: z.string(),
  FULLENRICH_API_KEY: z.string(),
  SOCIETE_INFO_API_KEY: z.string(),
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
  VITE_STRIPE_PUBLIC_KEY: z.string(),
  STRIPE_PRICE_ESSENTIAL: z.string(),
  STRIPE_PRICE_PRO: z.string(),
  STRIPE_PRICE_BUSINESS: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_REDIRECT_URI: z.string(),
  MICROSOFT_CLIENT_ID: z.string(),
  MICROSOFT_CLIENT_SECRET: z.string(),
  MICROSOFT_REDIRECT_URI: z.string(),
  OAUTH_TOKEN_ENCRYPTION_KEY: z.string(),

});

export type EnvSchema = z.infer<typeof EnvSchema>;

if (process.env)
  try {
    EnvSchema.parse(process.env);
  } catch (error) {
    if (error instanceof ZodError) {
      let message = "Missing required values in .env:\n";
      error.issues.forEach((issue) => {
        message += issue.path[0] + "\n";
      });
      const e = new Error(message);
      e.stack = "";
      throw e;
    } else {
      console.error(error);
    }
  }

export default EnvSchema.parse(process.env);
