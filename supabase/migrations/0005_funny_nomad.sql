CREATE TABLE IF NOT EXISTS "associations_deal_notes" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deal_id" varchar,
	"notes_id" varchar,
	"deal_id_pg" uuid,
	"notes_id_pg" uuid,
	"association_type_id" integer,
	"association_label" varchar
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_deal_notes" ADD CONSTRAINT "associations_deal_notes_deal_id_pg_deals_id_pg_fk" FOREIGN KEY ("deal_id_pg") REFERENCES "public"."deals"("id_pg") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_deal_notes" ADD CONSTRAINT "associations_deal_notes_notes_id_pg_notes_id_pg_fk" FOREIGN KEY ("notes_id_pg") REFERENCES "public"."notes"("id_pg") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
