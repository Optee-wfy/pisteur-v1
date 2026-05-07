DO $$ BEGIN
 CREATE TYPE "public"."type_de_poste_enum" AS ENUM('gestionnaire_actifs_immobilier', 'Architecte', 'directeur_responsable_technique', 'directeur_responsable_site', 'directeur_general_services', 'assistance_maitrise_ouvrage_interne', 'directeur_responsable_patrimoine', 'directeur_responsable_immobilier', 'responsable_travaux', 'directeur_clientele_syndic', 'directeur_responsable_maintenance', 'energy_manager', 'responsable_transition_energetique', 'AssetManager', 'responsable_RSE_ESG', 'analyste_immobilier', 'Autre');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "contacts" ALTER COLUMN "type_de_poste" TYPE type_de_poste_enum USING type_de_poste::type_de_poste_enum;
