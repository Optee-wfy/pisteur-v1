CREATE TABLE IF NOT EXISTS "associations_batiments_notes" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batiments_id" varchar,
	"notes_id" varchar,
	"batiments_id_pg" uuid,
	"notes_id_pg" uuid,
	"association_type_id" integer,
	"association_label" varchar
);
--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "categorie_d_operation" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_batiments_notes" ADD CONSTRAINT "associations_batiments_notes_batiments_id_pg_batiments_id_pg_fk" FOREIGN KEY ("batiments_id_pg") REFERENCES "public"."batiments"("id_pg") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_batiments_notes" ADD CONSTRAINT "associations_batiments_notes_notes_id_pg_notes_id_pg_fk" FOREIGN KEY ("notes_id_pg") REFERENCES "public"."notes"("id_pg") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
