CREATE TABLE IF NOT EXISTS "ProspectionHistoriqueLeads" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pro_id_pg" uuid NOT NULL,
	"batiments_bdnb_id_pg" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_prospection_historique_leads_pro_location" UNIQUE("pro_id_pg","batiments_bdnb_id_pg")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ProspectionParametres" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pro_id_pg" uuid NOT NULL,
	"usage_batiment" usage_batiment_enum[],
	"nb_personne_morale_par_batiment" real[],
	"trancheEffectifs" legal_entity_employee_range[],
	"departement" departements_de_france_enum[],
	"nb_batiment_groupe_related" real[],
	"type_energie" type_d_energie_enum[],
	"annual_electricity_consumption" real[],
	"type_de_chauffage" type_de_chauffage_enum[],
	"classe_dpe" text[],
	"nombre_de_lots" real[],
	"nombre_de_places_de_parking" real[],
	"surface_that_requires_heating" real[],
	"nombre_d_etages" real[],
	CONSTRAINT "ProspectionParametres_pro_id_pg_unique" UNIQUE("pro_id_pg")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ProspectionHistoriqueLeads" ADD CONSTRAINT "ProspectionHistoriqueLeads_pro_id_pg_pros_id_pg_fk" FOREIGN KEY ("pro_id_pg") REFERENCES "public"."pros"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ProspectionHistoriqueLeads" ADD CONSTRAINT "ProspectionHistoriqueLeads_batiments_bdnb_id_pg_batiments_bdnb_id_pg_fk" FOREIGN KEY ("batiments_bdnb_id_pg") REFERENCES "public"."batiments_bdnb"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ProspectionParametres" ADD CONSTRAINT "ProspectionParametres_pro_id_pg_pros_id_pg_fk" FOREIGN KEY ("pro_id_pg") REFERENCES "public"."pros"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_prospection_historique_leads_pro" ON "ProspectionHistoriqueLeads" USING btree ("pro_id_pg");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_prospection_historique_leads_location_bdnb" ON "ProspectionHistoriqueLeads" USING btree ("batiments_bdnb_id_pg");