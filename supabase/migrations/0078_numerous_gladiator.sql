ALTER TYPE "hs_pipeline_stage_enum" ADD VALUE '2632767713';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "associations_devis_clients" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"devis_id" varchar,
	"client_id" varchar,
	"devis_id_pg" uuid,
	"client_id_pg" uuid,
	"association_type_id" integer NOT NULL,
	"association_label" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "associations_devis_batiments" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"devis_id" varchar,
	"batiments_id" varchar,
	"devis_id_pg" uuid,
	"batiments_id_pg" uuid,
	"association_type_id" integer NOT NULL,
	"association_label" varchar
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_devis_clients" ADD CONSTRAINT "associations_devis_clients_devis_id_pg_devis_id_pg_fk" FOREIGN KEY ("devis_id_pg") REFERENCES "public"."devis"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_devis_clients" ADD CONSTRAINT "associations_devis_clients_client_id_pg_clients_id_pg_fk" FOREIGN KEY ("client_id_pg") REFERENCES "public"."clients"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_devis_batiments" ADD CONSTRAINT "associations_devis_batiments_devis_id_pg_devis_id_pg_fk" FOREIGN KEY ("devis_id_pg") REFERENCES "public"."devis"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_devis_batiments" ADD CONSTRAINT "associations_devis_batiments_batiments_id_pg_batiments_id_pg_fk" FOREIGN KEY ("batiments_id_pg") REFERENCES "public"."batiments"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
