ALTER TABLE "associations_deal_notes" RENAME TO "associations_notes_deal";--> statement-breakpoint
ALTER TABLE "associations_notes_deal" DROP CONSTRAINT "associations_deal_notes_deal_id_pg_deals_id_pg_fk";
--> statement-breakpoint
ALTER TABLE "associations_notes_deal" DROP CONSTRAINT "associations_deal_notes_notes_id_pg_notes_id_pg_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_notes_deal" ADD CONSTRAINT "associations_notes_deal_deal_id_pg_deals_id_pg_fk" FOREIGN KEY ("deal_id_pg") REFERENCES "public"."deals"("id_pg") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_notes_deal" ADD CONSTRAINT "associations_notes_deal_notes_id_pg_notes_id_pg_fk" FOREIGN KEY ("notes_id_pg") REFERENCES "public"."notes"("id_pg") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
