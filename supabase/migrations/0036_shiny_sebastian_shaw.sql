ALTER TABLE "devis" ADD COLUMN "montant_financement" real;--> statement-breakpoint
ALTER TABLE "devis" DROP COLUMN IF EXISTS "taux_de_tva";
