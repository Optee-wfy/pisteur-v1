ALTER TABLE "deals" DROP CONSTRAINT "deals_signatory_id_contacts_id_pg_fk";
--> statement-breakpoint
ALTER TABLE "deals" DROP COLUMN IF EXISTS "signatory_id";