DO $$ BEGIN
 CREATE TYPE "public"."operation_creee_par" AS ENUM('pro');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "operation_creee_par" "operation_creee_par";