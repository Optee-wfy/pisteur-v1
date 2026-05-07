DO $$ BEGIN
 CREATE TYPE "public"."type_association_pro_contact_externe" AS ENUM('PHONE', 'MAIL', 'BOTH');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "associations_pros_contact_externe" ADD COLUMN "type_association" "type_association_pro_contact_externe" NOT NULL;