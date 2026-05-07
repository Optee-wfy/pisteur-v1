ALTER TABLE "associations_pros_contact_externe" ADD COLUMN "ajoute_par_contact_id_pg" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_pros_contact_externe" ADD CONSTRAINT "associations_pros_contact_externe_ajoute_par_contact_id_pg_contacts_id_pg_fk" FOREIGN KEY ("ajoute_par_contact_id_pg") REFERENCES "public"."contacts"("id_pg") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_associations_pros_contact_externe_pro_owner" ON "associations_pros_contact_externe" USING btree ("pro_id_pg","ajoute_par_contact_id_pg");