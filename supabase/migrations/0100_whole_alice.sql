ALTER TYPE "pro_subscription_enum" ADD VALUE 'Propulse';--> statement-breakpoint
ALTER TYPE "pro_subscription_enum" ADD VALUE 'Résilié';--> statement-breakpoint
ALTER TABLE "pros" ADD COLUMN "site_de_calendrier" text;