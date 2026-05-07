ALTER TABLE "ProspectionParametres" ADD COLUMN "contact_reception_id_pg" uuid;--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "nombre_de_leads_a_generer" integer;--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "frequence_envoi_par_semaine" integer;--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "dernier_envoi_at" timestamp;--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "type_batiment_naf" text[];--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "secteur" secteur_enum[];--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "adresse" text;--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "dans_qpv" boolean;--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "nombre_de_batiments" real[];--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "statut_occupation_batiment" text[];--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "date_construction" date[];--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "periode_construction_max" periode_construction_max[];--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "surface_habitable_logement" real[];--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "accessible_pmr" boolean;--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "type_vitrage" type_vitrage[];--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "type_isolation_mur_exterieur" type_isolation[];--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "type_isolation_plancher_bas" type_isolation[];--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "type_isolation_plancher_haut" type_isolation[];--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "surface_au_sol" real[];--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "surface_habitable" real[];--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "surface_vitree" real[];--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "dpe_fiabilise" boolean;--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "classe_inertie" text[];--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "nombre_de_logements" real[];--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "type_generateur_chauffage" type_generateur_chauffage[];--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "presence_climatisation" boolean;--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "type_ventilation" type_ventilation[];--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "type_generateur_ecs" type_generateur_ecs[];--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "classe_ges" text[];--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "date_etablissement_dpe" date[];--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "conso_elec_par_m2" real[];--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "ges_par_m2" real[];--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "types_personne_morale" text[];--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "activite_tertiaire" text[];--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "nombre_de_locaux" real[];--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "type_personne_morale" type_personne_morale_enum[];--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "ipe_usage_reason" text[];--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "ipe_normalized_score" real[];--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "forme_juridique" text[];--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "activite_principale" text[];--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "nom" text;--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "code_postal" text;--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "departement_personne_morale" departements_de_france_enum[];--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "hauteur" real[];--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "presence_balcon" boolean;--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "plusieurs_facades_exposees" boolean;--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "type_energie_chauffage_appoint" type_energie_chauffage_appoint[];--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "chauffage_solaire" boolean;--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "ecs_solaire" boolean;--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "materiau_mur" materiau_mur[];--> statement-breakpoint
ALTER TABLE "ProspectionParametres" ADD COLUMN "materiau_toit" materiau_toit[];--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ProspectionParametres" ADD CONSTRAINT "ProspectionParametres_contact_reception_id_pg_contacts_id_pg_fk" FOREIGN KEY ("contact_reception_id_pg") REFERENCES "public"."contacts"("id_pg") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
