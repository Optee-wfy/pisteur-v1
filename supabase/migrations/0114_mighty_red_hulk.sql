ALTER TYPE "contact_externe_source" ADD VALUE 'societe_info';--> statement-breakpoint
ALTER TABLE "contact_externe" RENAME COLUMN "hunter_confidence_score" TO "confidence_score";--> statement-breakpoint
ALTER TABLE "personne_morale" ADD COLUMN "is_unavailable_for_societe_info" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "personne_morale" ADD COLUMN "last_fetched_at_for_societe_info" timestamp;