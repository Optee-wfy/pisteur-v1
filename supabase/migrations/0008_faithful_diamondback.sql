ALTER TABLE "associations_clients_batiments" RENAME TO "associations_batiments_clients";--> statement-breakpoint
ALTER TABLE "associations_devis_pros" RENAME TO "associations_pros_devis";--> statement-breakpoint
ALTER TABLE "associations_batiments_clients" DROP CONSTRAINT "associations_clients_batiments_batiments_id_pg_batiments_id_pg_fk";
--> statement-breakpoint
ALTER TABLE "associations_batiments_clients" DROP CONSTRAINT "associations_clients_batiments_clients_id_pg_clients_id_pg_fk";
--> statement-breakpoint
ALTER TABLE "associations_pros_devis" DROP CONSTRAINT "associations_devis_pros_devis_id_pg_devis_id_pg_fk";
--> statement-breakpoint
ALTER TABLE "associations_pros_devis" DROP CONSTRAINT "associations_devis_pros_pro_id_pg_pros_id_pg_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_batiments_clients" ADD CONSTRAINT "associations_batiments_clients_batiments_id_pg_batiments_id_pg_fk" FOREIGN KEY ("batiments_id_pg") REFERENCES "public"."batiments"("id_pg") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_batiments_clients" ADD CONSTRAINT "associations_batiments_clients_clients_id_pg_clients_id_pg_fk" FOREIGN KEY ("clients_id_pg") REFERENCES "public"."clients"("id_pg") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_pros_devis" ADD CONSTRAINT "associations_pros_devis_devis_id_pg_devis_id_pg_fk" FOREIGN KEY ("devis_id_pg") REFERENCES "public"."devis"("id_pg") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_pros_devis" ADD CONSTRAINT "associations_pros_devis_pro_id_pg_pros_id_pg_fk" FOREIGN KEY ("pro_id_pg") REFERENCES "public"."pros"("id_pg") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
