ALTER TYPE "contact_externe_seniorite" ADD VALUE 'MANDATAIRE';--> statement-breakpoint
ALTER TYPE "contact_externe_seniorite" ADD VALUE 'DIRIGEANT';--> statement-breakpoint
ALTER TYPE "contact_externe_seniorite" ADD VALUE 'GERANT';--> statement-breakpoint
ALTER TYPE "contact_externe_seniorite" ADD VALUE 'DIRECTEUR';--> statement-breakpoint
ALTER TYPE "contact_externe_seniorite" ADD VALUE 'RESPONSABLE';--> statement-breakpoint
ALTER TYPE "contact_externe_seniorite" ADD VALUE 'ASSIST';--> statement-breakpoint
ALTER TYPE "contact_externe_seniorite" ADD VALUE 'COLLAB';--> statement-breakpoint
ALTER TYPE "contact_externe_seniorite" ADD VALUE 'AUTRE';--> statement-breakpoint
DROP INDEX IF EXISTS "idx_personne_morale_stats_personne";--> statement-breakpoint
ALTER TABLE "contact_externe" ADD COLUMN "societe_info_id" text;