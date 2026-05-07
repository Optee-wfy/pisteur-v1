DO $$ BEGIN
 CREATE TYPE "public"."niveau_alea" AS ENUM('Faible', 'Moyen', 'Fort');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."type_energie_chauffage_appoint" AS ENUM('electricite', 'bois', 'gaz', 'fioul', 'charbon', 'gpl/butane/propane', 'reseau de chaleur');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."periode_construction_dpe" AS ENUM('avant 1948', '1948-1974', '1975-1977', '1978-1982', '1983-1988', '1989-2000', '2001-2005', '2006-2012', '2013-2021', 'après 2021');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."type_installation_ecs" AS ENUM('individuel', 'collectif');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."periode_construction_max" AS ENUM('AVANT_1949', 'DE_1949_A_1960', 'DE_1961_A_1974', 'DE_1975_A_1993', 'DE_1994_A_2000', 'DE_2001_A_2010', 'APRES_2010');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."materiaux_structure_mur" AS ENUM('autre_materiau_innovant_recent', 'autre_materiau_non_repertorie', 'autre_materiau_traditionnel_ancien', 'brique_terre_cuite_alveolaire', 'beton_cellulaire', 'cloison_platre', 'inconnu', 'monomur_terre_cuite', 'murs_bois_rondin', 'murs_blocs_beton_creux', 'murs_blocs_beton_pleins', 'murs_briques', 'murs_briques_creuses', 'murs_briques_doubles_lame_air', 'murs_briques_simples', 'murs_beton', 'murs_beton_banche', 'murs_beton_machefer', 'murs_ossature_bois_remplissage_2001_2005', 'murs_ossature_bois_remplissage_lt_2001', 'murs_ossature_bois_remplissage_ge_2006', 'murs_ossature_bois_tout_venant', 'murs_ossature_bois_sans_remplissage', 'murs_pan_bois_tout_venant', 'murs_pan_bois_sans_remplissage', 'murs_pierre', 'murs_pierre_taille_moellons_tout_venant', 'murs_pierre_taille_moellons_constitue', 'murs_pise_beton_terre', 'murs_sandwich_beton_isolant');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."type_batiment_dpe" AS ENUM('appartement', 'immeuble', 'maison');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."etiquette_dpe" AS ENUM('A', 'B', 'C', 'D', 'E', 'F', 'G');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."type_generateur_ecs" AS ENUM('ballon_accumulation_electrique', 'chaudiere_bois', 'chaudiere_charbon_standard', 'chaudiere_electrique', 'chaudiere_indetermine_bt', 'chaudiere_indetermine_cond', 'chaudiere_indetermine_indetermine', 'chaudiere_indetermine_std', 'chaudiere_fioul_bt', 'chaudiere_fioul_cond', 'chaudiere_fioul_std', 'chaudiere_gaz_bt', 'chaudiere_gaz_cond', 'chaudiere_gaz_std', 'chaudiere_gpl_bt', 'chaudiere_gpl_cond', 'chaudiere_gpl_std', 'chauffe_eau_electrique_instantane', 'chauffe_eau_fioul_independant', 'chauffe_eau_gaz_independant', 'chauffe_eau_gpl_independant', 'chauffe_eau_indetermine', 'ecs_autre_indetermine', 'ecs_bois_indetermine', 'ecs_solaire', 'ecs_thermodynamique_electrique', 'production_mixte_indetermine', 'reseau_chaleur');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."legal_entity_employee_range" AS ENUM('1 ou 2 salariés', '3 à 5 salariés', '6 à 9 salariés', '10 à 19 salariés', '20 à 49 salariés', '50 à 99 salariés', '100 à 199 salariés', '200 à 249 salariés', '250 à 499 salariés', '500 à 999 salariés', '1 000 à 1 999 salariés', '2 000 à 4 999 salariés', '5 000 à 9 999 salariés', '10 000 salariés et plus', '0 salarié', 'Unité non-employeuse');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."type_vitrage" AS ENUM('double vitrage', 'simple vitrage', 'triple vitrage', 'survitrage', 'brique de verre ou polycarbonate');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."anciennete_generateur_chauffage" AS ENUM('ancien', 'neuf', 'récent(<15ans)', 'très ancien');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."type_generateur_chauffage" AS ENUM('chaudiere_bois', 'chaudiere_charbon_condensation', 'chaudiere_charbon_standard', 'chaudiere_electrique', 'chaudiere_indetermine_bt', 'chaudiere_indetermine_cond', 'chaudiere_indetermine_indetermine', 'chaudiere_indetermine_std', 'chaudiere_fioul_bt', 'chaudiere_fioul_cond', 'chaudiere_fioul_std', 'chaudiere_gaz_bt', 'chaudiere_gaz_cond', 'chaudiere_gaz_std', 'chaudiere_gpl_bt', 'chaudiere_gpl_cond', 'chaudiere_gpl_std', 'chauffage_autre_indetermine', 'chauffage_bois_indetermine', 'chauffage_solaire', 'generateur_air_chaud_combustion', 'generateurs_effet_joule', 'pac_air_air', 'pac_air_eau', 'pac_eau_eau', 'pac_geothermique', 'pac_indetermine', 'poele_insert_bois', 'poele_insert_charbon', 'poele_insert_fioul', 'poele_insert_gpl', 'poele_insert_indetermine', 'radiateurs_gaz', 'reseau_chaleur');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."type_isolation" AS ENUM('non isole', 'isole', 'ITI', 'ITE', 'ITR', 'inconnu');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."materiau_toit" AS ENUM('ARDOISES', 'AUTRES', 'TUILES', 'INDETERMINE', 'BETON', 'ZINC ALUMINIUM');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."type_fermeture" AS ENUM('fermeture_isolee_sans_ajours', 'fermeture_sans_ajours', 'jalousie_accordeon', 'lames_orientables_metal', 'volets_ou_persiennes_ajours_fixes', 'persienne_ou_volet_pvc', 'volet_bois_epais', 'volet_bois_fin', 'volet_roulant_pvc_epais', 'volet_roulant_pvc_fin', 'absence_fermeture_baie');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."type_ventilation" AS ENUM('extracteur_conduit_non_modifie', 'puits_canadien', 'entrees_air_hautes_basses', 'ventilation_hybride', 'hybride_entrees_hygro', 'vm_auto', 'vm_auto_post82', 'vm_auto_pre82', 'vm_double_flux_echangeur', 'vm_double_flux_sans_echangeur', 'vm_gaz_hygro', 'vm_extraction_entrees_hygro', 'vm_extraction_hygro', 'ventilation_conduit', 'ventilation_conduit_entrees_hygro', 'ouverture_fenetres');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."materiau_mur" AS ENUM('AGGLOMERE', 'AUTRES', 'BETON', 'BOIS', 'BRIQUES', 'MEULIERE', 'PIERRE', 'INDETERMINE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."type_materiaux_menuiserie" AS ENUM('autres', 'bois', 'pvc', 'métal', 'métal avec rupture de pont thermique', 'métal sans rupture de pont thermique', 'brique de verre', 'polycarbonate');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "associations_personne_morale_contact_externe" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"personne_morale_id_pg" uuid,
	"contact_externe_id_pg" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "associations_pros_personne_morale" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pros_id_pg" uuid,
	"personne_morale_id_pg" uuid,
	"association_type_id" integer NOT NULL,
	"association_label" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "personne_morale_corrompue" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batiment_groupe_id" text,
	"nom" text,
	"raw_data" jsonb,
	"raison" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contact_externe" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" text,
	"prenom" text,
	"nom" text,
	"adresse_courriel" text,
	"telephone" text,
	"url_linkedin" text,
	"url_twitter" text,
	"hunter_confidence_score" real
);
--> statement-breakpoint
ALTER TABLE "personne_morale" DROP CONSTRAINT "personne_morale_public_id_unique";--> statement-breakpoint
ALTER TABLE "personne_morale" DROP CONSTRAINT "personne_morale_coproperty_id_unique";--> statement-breakpoint
ALTER TABLE "personne_morale" DROP CONSTRAINT "personne_morale_tertiaire_id_unique";--> statement-breakpoint
ALTER TABLE "personne_morale" DROP CONSTRAINT "personne_morale_public_id_personne_morale_public_id_pg_fk";
--> statement-breakpoint
ALTER TABLE "personne_morale" DROP CONSTRAINT "personne_morale_coproperty_id_personne_morale_copropriete_id_pg_fk";
--> statement-breakpoint
ALTER TABLE "personne_morale" DROP CONSTRAINT "personne_morale_tertiaire_id_personne_morale_tertiaire_id_pg_fk";
--> statement-breakpoint
DROP TABLE "personne_morale_tertiaire";--> statement-breakpoint
DROP TABLE "personne_morale_copropriete";--> statement-breakpoint
DROP TABLE "personne_morale_public";--> statement-breakpoint
DROP INDEX IF EXISTS "locations_bdnb_heating_type_index";--> statement-breakpoint
ALTER TABLE "batiments_bdnb" ALTER COLUMN "etiquette_dpe" SET DATA TYPE etiquette_dpe USING etiquette_dpe::etiquette_dpe;--> statement-breakpoint
ALTER TABLE "batiments_bdnb" ALTER COLUMN "classe_bilan_dpe" SET DATA TYPE etiquette_dpe USING classe_bilan_dpe::etiquette_dpe;--> statement-breakpoint
ALTER TABLE "batiments_bdnb" ALTER COLUMN "type_ventilation" SET DATA TYPE type_ventilation USING type_ventilation::type_ventilation;--> statement-breakpoint
ALTER TABLE "batiments_bdnb" ALTER COLUMN "type_generateur_climatisation_anciennete" SET DATA TYPE anciennete_generateur_chauffage USING type_generateur_climatisation_anciennete::anciennete_generateur_chauffage;--> statement-breakpoint
ALTER TABLE "batiments_bdnb" ALTER COLUMN "type_isolation_mur_exterieur" SET DATA TYPE type_isolation[] USING type_isolation_mur_exterieur::type_isolation[];--> statement-breakpoint
ALTER TABLE "batiments_bdnb" ALTER COLUMN "type_isolation_plancher_bas" SET DATA TYPE type_isolation[] USING type_isolation_plancher_bas::type_isolation[];--> statement-breakpoint
ALTER TABLE "batiments_bdnb" ALTER COLUMN "type_isolation_plancher_haut" SET DATA TYPE type_isolation[] USING type_isolation_plancher_haut::type_isolation[];--> statement-breakpoint
ALTER TABLE "batiments_bdnb" ALTER COLUMN "type_vitrage" SET DATA TYPE type_vitrage USING type_vitrage::type_vitrage;--> statement-breakpoint
ALTER TABLE "batiments_bdnb" ALTER COLUMN "type_materiaux_menuiserie" SET DATA TYPE type_materiaux_menuiserie[] USING type_materiaux_menuiserie::type_materiaux_menuiserie[];--> statement-breakpoint
ALTER TABLE "batiments_bdnb" ALTER COLUMN "type_fermeture" SET DATA TYPE type_fermeture[] USING type_fermeture::type_fermeture[];--> statement-breakpoint
ALTER TABLE "batiments_bdnb" ALTER COLUMN "alea_radon" SET DATA TYPE niveau_alea USING alea_radon::niveau_alea;--> statement-breakpoint
ALTER TABLE "batiments_bdnb" ALTER COLUMN "alea_argiles" SET DATA TYPE niveau_alea USING alea_argiles::niveau_alea;--> statement-breakpoint
ALTER TABLE "batiments_bdnb" ALTER COLUMN "periode_construction_max" SET DATA TYPE periode_construction_max USING periode_construction_max::periode_construction_max;--> statement-breakpoint
ALTER TABLE "batiments_bdnb" ALTER COLUMN "mat_mur_txt" SET DATA TYPE materiau_mur[] USING mat_mur_txt::materiau_mur[];--> statement-breakpoint
ALTER TABLE "batiments_bdnb" ALTER COLUMN "mat_toit_txt" SET DATA TYPE materiau_toit[] USING mat_toit_txt::materiau_toit[];--> statement-breakpoint
ALTER TABLE "batiments_bdnb" ALTER COLUMN "classe_ges_principale" SET DATA TYPE etiquette_dpe USING classe_ges_principale::etiquette_dpe;--> statement-breakpoint
ALTER TABLE "batiments_bdnb" ALTER COLUMN "type_construction" SET DATA TYPE text[] USING type_construction::text[];--> statement-breakpoint
ALTER TABLE "batiments_bdnb" ALTER COLUMN "type_batiment_dpe" SET DATA TYPE type_batiment_dpe USING type_batiment_dpe::type_batiment_dpe;--> statement-breakpoint
ALTER TABLE "batiments_bdnb" ALTER COLUMN "periode_construction_dpe" SET DATA TYPE periode_construction_dpe USING periode_construction_dpe::periode_construction_dpe;--> statement-breakpoint
ALTER TABLE "batiments_bdnb" ALTER COLUMN "classe_emission_ges" SET DATA TYPE etiquette_dpe USING classe_emission_ges::etiquette_dpe;--> statement-breakpoint
ALTER TABLE "batiments_bdnb" ALTER COLUMN "classe_conso_energie_arrete_2012" SET DATA TYPE etiquette_dpe USING classe_conso_energie_arrete_2012::etiquette_dpe;--> statement-breakpoint
ALTER TABLE "batiments_bdnb" ALTER COLUMN "classe_emission_ges_arrete_2012" SET DATA TYPE etiquette_dpe USING classe_emission_ges_arrete_2012::etiquette_dpe;--> statement-breakpoint
ALTER TABLE "batiments_bdnb" ALTER COLUMN "type_generateur_chauffage" SET DATA TYPE type_generateur_chauffage USING type_generateur_chauffage::type_generateur_chauffage;--> statement-breakpoint
ALTER TABLE "batiments_bdnb" ALTER COLUMN "type_generateur_chauffage_anciennete" SET DATA TYPE anciennete_generateur_chauffage USING type_generateur_chauffage_anciennete::anciennete_generateur_chauffage;--> statement-breakpoint
ALTER TABLE "batiments_bdnb" ALTER COLUMN "type_energie_chauffage_appoint" SET DATA TYPE type_energie_chauffage_appoint USING type_energie_chauffage_appoint::type_energie_chauffage_appoint;--> statement-breakpoint
ALTER TABLE "batiments_bdnb" ALTER COLUMN "type_installation_ecs" SET DATA TYPE type_installation_ecs USING type_installation_ecs::type_installation_ecs;--> statement-breakpoint
ALTER TABLE "batiments_bdnb" ALTER COLUMN "type_generateur_ecs_anciennete" SET DATA TYPE anciennete_generateur_chauffage USING type_generateur_ecs_anciennete::anciennete_generateur_chauffage;--> statement-breakpoint
ALTER TABLE "batiments_bdnb" ALTER COLUMN "materiaux_structure_mur_exterieur" SET DATA TYPE materiaux_structure_mur USING materiaux_structure_mur_exterieur::materiaux_structure_mur;--> statement-breakpoint
ALTER TABLE "personne_morale" ADD COLUMN "denomination_usuelle" text;--> statement-breakpoint
ALTER TABLE "personne_morale" ADD COLUMN "siret" text;--> statement-breakpoint
ALTER TABLE "personne_morale" ADD COLUMN "siren" text;--> statement-breakpoint
ALTER TABLE "personne_morale" ADD COLUMN "part_siren" text;--> statement-breakpoint
ALTER TABLE "personne_morale" ADD COLUMN "numero_voie" text;--> statement-breakpoint
ALTER TABLE "personne_morale" ADD COLUMN "typeVoie_syndic" text;--> statement-breakpoint
ALTER TABLE "personne_morale" ADD COLUMN "libelle_voie" text;--> statement-breakpoint
ALTER TABLE "personne_morale" ADD COLUMN "ville" text;--> statement-breakpoint
ALTER TABLE "personne_morale" ADD COLUMN "code_postal" text;--> statement-breakpoint
ALTER TABLE "personne_morale" ADD COLUMN "nb_locaux_du_groupe" real;--> statement-breakpoint
ALTER TABLE "personne_morale" ADD COLUMN "trancheEffectifs" "legal_entity_employee_range";--> statement-breakpoint
ALTER TABLE "personne_morale" ADD COLUMN "categorieEntreprise" text;--> statement-breakpoint
ALTER TABLE "personne_morale" ADD COLUMN "categorieJuridique" text;--> statement-breakpoint
ALTER TABLE "personne_morale" ADD COLUMN "activitePrincipale" text;--> statement-breakpoint
ALTER TABLE "personne_morale" ADD COLUMN "type_organisme" text;--> statement-breakpoint
ALTER TABLE "personne_morale" ADD COLUMN "forme_juridique" text;--> statement-breakpoint
ALTER TABLE "personne_morale" ADD COLUMN "delegue" boolean;--> statement-breakpoint
ALTER TABLE "personne_morale" ADD COLUMN "horaires_ouverture_interne" text;--> statement-breakpoint
ALTER TABLE "personne_morale" ADD COLUMN "google_place_id" text;--> statement-breakpoint
ALTER TABLE "personne_morale" ADD COLUMN "horaires_ouverture" jsonb;--> statement-breakpoint
ALTER TABLE "personne_morale" ADD COLUMN "note" real;--> statement-breakpoint
ALTER TABLE "personne_morale" ADD COLUMN "nombre_avis" real;--> statement-breakpoint
ALTER TABLE "personne_morale" ADD COLUMN "site_internet" text;--> statement-breakpoint
ALTER TABLE "personne_morale" ADD COLUMN "url_itineraire_maps" text;--> statement-breakpoint
ALTER TABLE "personne_morale" ADD COLUMN "statut_entreprise" text;--> statement-breakpoint
ALTER TABLE "personne_morale" ADD COLUMN "is_unavailable_for_google" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "personne_morale" ADD COLUMN "last_fetched_at_for_google" timestamp;--> statement-breakpoint
ALTER TABLE "personne_morale" ADD COLUMN "objectif" text;--> statement-breakpoint
ALTER TABLE "personne_morale" ADD COLUMN "is_unavailable_for_pappers" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "personne_morale" ADD COLUMN "last_fetched_at_for_pappers" timestamp;--> statement-breakpoint
ALTER TABLE "personne_morale" ADD COLUMN "is_unavailable_for_hunter" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "personne_morale" ADD COLUMN "last_fetched_at_for_hunter" timestamp;--> statement-breakpoint
ALTER TABLE "personne_morale" ADD COLUMN "syndic_principal" boolean;--> statement-breakpoint
ALTER TABLE "personne_morale" ADD COLUMN "indiceRepetition_syndic" text;--> statement-breakpoint
ALTER TABLE "batiments_bdnb" ADD COLUMN "conso_energie_estime" real;--> statement-breakpoint
ALTER TABLE "batiments_bdnb" ADD COLUMN "presence_climatisation" boolean;--> statement-breakpoint
ALTER TABLE "batiments_bdnb" ADD COLUMN "type_generateur_ecs" "type_generateur_ecs";--> statement-breakpoint
ALTER TABLE "snapshot_public_location_bdnb_raw" ADD COLUMN "name" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_personne_morale_contact_externe" ADD CONSTRAINT "associations_personne_morale_contact_externe_personne_morale_id_pg_personne_morale_id_pg_fk" FOREIGN KEY ("personne_morale_id_pg") REFERENCES "public"."personne_morale"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_personne_morale_contact_externe" ADD CONSTRAINT "associations_personne_morale_contact_externe_contact_externe_id_pg_contact_externe_id_pg_fk" FOREIGN KEY ("contact_externe_id_pg") REFERENCES "public"."contact_externe"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_pros_personne_morale" ADD CONSTRAINT "associations_pros_personne_morale_pros_id_pg_pros_id_pg_fk" FOREIGN KEY ("pros_id_pg") REFERENCES "public"."pros"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_pros_personne_morale" ADD CONSTRAINT "associations_pros_personne_morale_personne_morale_id_pg_personne_morale_id_pg_fk" FOREIGN KEY ("personne_morale_id_pg") REFERENCES "public"."personne_morale"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_heating_type_index" ON "batiments_bdnb" USING btree ("type_generateur_chauffage");--> statement-breakpoint
ALTER TABLE "associations_batiments_bdnb_personne_morale" DROP COLUMN IF EXISTS "batiments_bdnb_id";--> statement-breakpoint
ALTER TABLE "associations_batiments_bdnb_personne_morale" DROP COLUMN IF EXISTS "personne_morale_id";--> statement-breakpoint
ALTER TABLE "personne_morale" DROP COLUMN IF EXISTS "public_id";--> statement-breakpoint
ALTER TABLE "personne_morale" DROP COLUMN IF EXISTS "coproperty_id";--> statement-breakpoint
ALTER TABLE "personne_morale" DROP COLUMN IF EXISTS "tertiaire_id";--> statement-breakpoint
ALTER TABLE "personne_morale" DROP COLUMN IF EXISTS "is_unavailable";--> statement-breakpoint
ALTER TABLE "batiments_bdnb" DROP COLUMN IF EXISTS "generateur_de_chauffage";--> statement-breakpoint
ALTER TABLE "batiments_bdnb" DROP COLUMN IF EXISTS "categorieEntreprise";--> statement-breakpoint
ALTER TABLE "batiments_bdnb" DROP COLUMN IF EXISTS "anneeCategorieEntreprise";--> statement-breakpoint
ALTER TABLE "batiments_bdnb" DROP COLUMN IF EXISTS "etatAdministratifUniteLegale";--> statement-breakpoint
ALTER TABLE "batiments_bdnb" DROP COLUMN IF EXISTS "denominationUniteLegale";--> statement-breakpoint
ALTER TABLE "batiments_bdnb" DROP COLUMN IF EXISTS "categorieJuridiqueUniteLegale";--> statement-breakpoint
ALTER TABLE "batiments_bdnb" DROP COLUMN IF EXISTS "activitePrincipaleUniteLegale";--> statement-breakpoint
ALTER TABLE "batiments_bdnb" DROP COLUMN IF EXISTS "nomenclatureActivitePrincipaleUniteLegale";--> statement-breakpoint
ALTER TABLE "batiments_bdnb" DROP COLUMN IF EXISTS "economieSocialeSolidaireUniteLegale";--> statement-breakpoint
ALTER TABLE "batiments_bdnb" DROP COLUMN IF EXISTS "in_sirene";
