DO $$ BEGIN
 CREATE TYPE "public"."pro_subscription_enum" AS ENUM('Free', 'Boost', 'Impact');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "pros" ADD COLUMN "abonnement_souscrit" "pro_subscription_enum";