DO $$ BEGIN
 CREATE TYPE "public"."contact_externe_seniorite" AS ENUM('junior', 'senior', 'executive');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."contact_externe_type" AS ENUM('personal', 'generic');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "contact_externe" ADD COLUMN "type" "contact_externe_type";--> statement-breakpoint
ALTER TABLE "contact_externe" ADD COLUMN "seniorite" "contact_externe_seniorite";--> statement-breakpoint
ALTER TABLE "contact_externe" ADD COLUMN "departement" text;