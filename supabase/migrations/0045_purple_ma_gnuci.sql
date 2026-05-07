CREATE TABLE IF NOT EXISTS "associations_deal_financeurs" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deal_id" varchar,
	"deal_id_pg" uuid,
	"financeur_id" varchar,
	"financeur_id_pg" uuid,
	"association_type_id" integer NOT NULL,
	"association_label" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "financeurs" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"id" varchar,
	"nom" text,
	"siret" text,
	CONSTRAINT "financeurs_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "siret" text;--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "montant_solde_a_facturer" real;--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "numero_appel_de_provision_sdc" text;--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "date_envoi_appel_de_provision_sdc" date;--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "date_expiration_appel_de_provision_sdc" date;--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "montant_d_acompte_a_facturer" real;--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "numero_appel_de_provision_acompte" text;--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "date_envoi_appel_de_provision_acompte" date;--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "date_expiration_appel_de_provision_acompte" date;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_deal_financeurs" ADD CONSTRAINT "associations_deal_financeurs_deal_id_pg_deals_id_pg_fk" FOREIGN KEY ("deal_id_pg") REFERENCES "public"."deals"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_deal_financeurs" ADD CONSTRAINT "associations_deal_financeurs_financeur_id_pg_financeurs_id_pg_fk" FOREIGN KEY ("financeur_id_pg") REFERENCES "public"."financeurs"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
