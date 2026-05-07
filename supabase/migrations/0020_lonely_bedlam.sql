CREATE TABLE IF NOT EXISTS "owners" (
	"stacksync_record_id_f3zges" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"id" varchar NOT NULL,
	"email" text NOT NULL,
	"firstname" text,
	"lastname" text,
	CONSTRAINT "owners_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "hubspot_owner_id" text;--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "hubspot_owner_id" text;