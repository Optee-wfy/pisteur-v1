ALTER TYPE "type_association_pro_contact_externe" ADD VALUE 'NONE';--> statement-breakpoint
ALTER TABLE "associations_pros_contact_externe" ADD COLUMN "cree_le" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "associations_pros_contact_externe" ADD COLUMN "mis_a_jour_le" timestamp;--> statement-breakpoint
ALTER TABLE "enrichissements" ADD COLUMN "pro_id_pg" uuid;--> statement-breakpoint
ALTER TABLE "enrichissements" ADD COLUMN "contact_id_pg" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "enrichissements" ADD CONSTRAINT "enrichissements_pro_id_pg_pros_id_pg_fk" FOREIGN KEY ("pro_id_pg") REFERENCES "public"."pros"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "enrichissements" ADD CONSTRAINT "enrichissements_contact_id_pg_contacts_id_pg_fk" FOREIGN KEY ("contact_id_pg") REFERENCES "public"."contacts"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "associations_pros_contact_externe" ADD CONSTRAINT "uq_associations_pros_contact_externe_pro_contact" UNIQUE("pro_id_pg","contact_externe_id_pg");