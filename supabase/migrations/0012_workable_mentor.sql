ALTER TABLE "deals" ADD COLUMN "bot_cee" jsonb;--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "bot_brief" jsonb;--> statement-breakpoint
ALTER TABLE "batiments" DROP COLUMN IF EXISTS "criteres_du_batiment";--> statement-breakpoint
ALTER TABLE "batiments" DROP COLUMN IF EXISTS "type_de_batiment_detail";--> statement-breakpoint
ALTER TABLE "deals" DROP COLUMN IF EXISTS "operations_selectionnees";--> statement-breakpoint
ALTER TABLE "deals" DROP COLUMN IF EXISTS "operations_identifiees";--> statement-breakpoint
ALTER TABLE "deals" DROP COLUMN IF EXISTS "fiches_cee_applicables";--> statement-breakpoint
ALTER TABLE "deals" DROP COLUMN IF EXISTS "contrainte_temporelle_client";--> statement-breakpoint
ALTER TABLE "deals" DROP COLUMN IF EXISTS "contraintes_techniques";--> statement-breakpoint
ALTER TABLE "deals" DROP COLUMN IF EXISTS "simulation_de_l_impact_energetique";--> statement-breakpoint
ALTER TABLE "deals" DROP COLUMN IF EXISTS "estimation_consommation_energie_batiment_renove__par_an_";--> statement-breakpoint
ALTER TABLE "deals" DROP COLUMN IF EXISTS "impact_energetique_previsionnel";--> statement-breakpoint
ALTER TABLE "deals" DROP COLUMN IF EXISTS "delai_de_retour_sur_investissement";--> statement-breakpoint
ALTER TABLE "deals" DROP COLUMN IF EXISTS "objectifs_du_maitre_d_ouvrage";--> statement-breakpoint
ALTER TABLE "deals" DROP COLUMN IF EXISTS "justification_des_choix_des_operations";--> statement-breakpoint
ALTER TABLE "deals" DROP COLUMN IF EXISTS "criteres_d_eligibilite_aux_aides_cee";--> statement-breakpoint
ALTER TABLE "deals" DROP COLUMN IF EXISTS "qualifications_necessaires";--> statement-breakpoint
ALTER TABLE "deals" DROP COLUMN IF EXISTS "controles_et_verifications";
