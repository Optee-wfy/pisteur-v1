DO $$ BEGIN
 CREATE TYPE "public"."type_association_pro_contact_externe_status" AS ENUM('NEW', 'IN_PROGRESS', 'CLOSED_WON', 'CLOSED_LOST', 'ARCHIVED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "associations_pros_contact_externe" ADD COLUMN "statut_association" "type_association_pro_contact_externe_status" DEFAULT 'NEW' NOT NULL;