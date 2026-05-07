ALTER TABLE "devis" ADD COLUMN "requete_signature_yousign_id" varchar;--> statement-breakpoint
ALTER TABLE "devis" ADD COLUMN "signataire_yousign_id" varchar;--> statement-breakpoint
ALTER TABLE "devis" DROP COLUMN IF EXISTS "sign_url";