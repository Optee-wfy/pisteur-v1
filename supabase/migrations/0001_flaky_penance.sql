CREATE TABLE IF NOT EXISTS "associations_devis_pros" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"devis_id" varchar,
	"pro_id" varchar,
	"devis_id_pg" uuid,
	"pro_id_pg" uuid,
	"association_type_id" integer,
	"association_label" varchar
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_devis_pros" ADD CONSTRAINT "associations_devis_pros_devis_id_pg_devis_id_pg_fk" FOREIGN KEY ("devis_id_pg") REFERENCES "public"."devis"("id_pg") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_devis_pros" ADD CONSTRAINT "associations_devis_pros_pro_id_pg_pros_id_pg_fk" FOREIGN KEY ("pro_id_pg") REFERENCES "public"."pros"("id_pg") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
