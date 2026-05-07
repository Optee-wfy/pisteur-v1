ALTER TABLE "ProspectionHistoriqueLeads" ADD COLUMN "contact_externe_recommande_id_pg" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ProspectionHistoriqueLeads" ADD CONSTRAINT "ProspectionHistoriqueLeads_contact_externe_recommande_id_pg_contact_externe_id_pg_fk" FOREIGN KEY ("contact_externe_recommande_id_pg") REFERENCES "public"."contact_externe"("id_pg") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
