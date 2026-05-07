DO $$ BEGIN
 CREATE TYPE "public"."origine_inscription_plateforme_client_enum" AS ENUM('Formulaire Onboarding Client');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."hs_pipeline_client_stage_enum" AS ENUM('672559857', '919495915', '878353131', '672535279', '968778961', '672535280', '1961842908', '690165470', '700545483', '700545484', '703742170', '700545485', '700537046');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."type_de_compte_enum" AS ENUM('Propriétaire exploitant', 'Gestionnaire Immobilier', 'Prescripteur', 'Architecte/BET', 'Professionnel du bâtiment', 'Compte démo 👀');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."origine_inscription_plateforme_contact_enum" AS ENUM('Formulaire Onboarding Client');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."hs_pipeline_contact_stage_enum" AS ENUM('subscriber', 'lead', '2055750850', '2055750851', '2055488722', '2055488723', '2055488724', '2055750853', '2055488726');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "type_de_compte" "type_de_compte_enum";--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "hs_pipeline_stage" "hs_pipeline_client_stage_enum";--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "origine_inscription_plateforme" "origine_inscription_plateforme_client_enum";--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "lifecyclestage" "hs_pipeline_contact_stage_enum";--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "origine_inscription_plateforme" "origine_inscription_plateforme_contact_enum";
