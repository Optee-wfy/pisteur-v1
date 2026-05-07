CREATE TABLE IF NOT EXISTS "associations_notes_pro" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pro_id" varchar,
	"notes_id" varchar,
	"pro_id_pg" uuid,
	"notes_id_pg" uuid,
	"association_type_id" integer NOT NULL,
	"association_label" varchar
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_notes_pro" ADD CONSTRAINT "associations_notes_pro_pro_id_pg_pros_id_pg_fk" FOREIGN KEY ("pro_id_pg") REFERENCES "public"."pros"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_notes_pro" ADD CONSTRAINT "associations_notes_pro_notes_id_pg_notes_id_pg_fk" FOREIGN KEY ("notes_id_pg") REFERENCES "public"."notes"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
