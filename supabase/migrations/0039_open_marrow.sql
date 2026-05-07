CREATE TABLE IF NOT EXISTS "associations_contact_pro" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contact_id" varchar,
	"pro_id" varchar,
	"contact_id_pg" uuid,
	"pros_id_pg" uuid,
	"association_type_id" integer NOT NULL,
	"association_label" varchar
);
--> statement-breakpoint
ALTER TABLE "pros" ADD COLUMN "siret" text;--> statement-breakpoint
ALTER TABLE "pros" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "pros" ADD COLUMN "zones_intervention" text;--> statement-breakpoint
ALTER TABLE "pros" ADD COLUMN "site_internet" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_contact_pro" ADD CONSTRAINT "associations_contact_pro_contact_id_pg_contacts_id_pg_fk" FOREIGN KEY ("contact_id_pg") REFERENCES "public"."contacts"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_contact_pro" ADD CONSTRAINT "associations_contact_pro_pros_id_pg_pros_id_pg_fk" FOREIGN KEY ("pros_id_pg") REFERENCES "public"."pros"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
