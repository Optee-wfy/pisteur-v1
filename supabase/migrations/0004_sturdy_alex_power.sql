ALTER TABLE "batiments" ADD COLUMN "code_postal__new_" text;--> statement-breakpoint
ALTER TABLE "batiments" DROP COLUMN IF EXISTS "code_postal";