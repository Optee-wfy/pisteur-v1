DO $$ BEGIN
 CREATE TYPE "public"."hs_invoice_pipeline_stage_enum" AS ENUM('2151961797', '2151961798', '2151600352', '2151600353', '2151600354', '2151600355', '2151600356', '2151600357', '2151600358', '2151600359', '2151600360', '2151600361', '2151600362', '2151600363');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "associations_deal_factures" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deal_id" varchar,
	"facture_id" varchar,
	"deal_id_pg" uuid,
	"facture_id_pg" uuid,
	"association_type_id" integer NOT NULL,
	"association_label" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "factures" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"id" varchar,
	"nom" text,
	"stage" "hs_invoice_pipeline_stage_enum",
	CONSTRAINT "factures_id_unique" UNIQUE("id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_deal_factures" ADD CONSTRAINT "associations_deal_factures_deal_id_pg_deals_id_pg_fk" FOREIGN KEY ("deal_id_pg") REFERENCES "public"."deals"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_deal_factures" ADD CONSTRAINT "associations_deal_factures_facture_id_pg_factures_id_pg_fk" FOREIGN KEY ("facture_id_pg") REFERENCES "public"."factures"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
