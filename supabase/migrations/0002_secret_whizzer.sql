ALTER TABLE "batiments" ADD COLUMN "type_de_batiment_detail" text;--> statement-breakpoint
ALTER TABLE "attachments" DROP COLUMN IF EXISTS "height";--> statement-breakpoint
ALTER TABLE "attachments" DROP COLUMN IF EXISTS "width";--> statement-breakpoint
ALTER TABLE "deals" DROP COLUMN IF EXISTS "nom_et_prenom_decisionnaire";--> statement-breakpoint
ALTER TABLE "deals" DROP COLUMN IF EXISTS "adresse_mail_decisionnaire";
