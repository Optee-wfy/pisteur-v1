ALTER TABLE "batiments" ADD COLUMN "nombre_d_etages" real;--> statement-breakpoint
ALTER TABLE "batiments" ADD COLUMN "pourcentage_de_surface_vitree" real;--> statement-breakpoint
ALTER TABLE "batiments" ADD COLUMN "hauteur" real;--> statement-breakpoint
ALTER TABLE "batiments" ADD COLUMN "consommation_electrique_par_m2" real;--> statement-breakpoint
ALTER TABLE "batiments" ADD COLUMN "emission_gaz_a_effet_de_serre_par_m2" real;--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "impact_energetique_estime" real;--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "consommation_electrique_avant" real;--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "emission_gaz_a_effet_de_serre_avant" real;--> statement-breakpoint
ALTER TABLE "deals" DROP COLUMN IF EXISTS "bot_cee";--> statement-breakpoint
ALTER TABLE "deals" DROP COLUMN IF EXISTS "bot_cee_response";