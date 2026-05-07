ALTER TABLE "associations_batiments_clients" RENAME TO "associations_clients_batiments";--> statement-breakpoint
ALTER TABLE "associations_clients_batiments" DROP CONSTRAINT "associations_batiments_clients_batiments_id_pg_batiments_id_pg_fk";
--> statement-breakpoint
ALTER TABLE "associations_clients_batiments" DROP CONSTRAINT "associations_batiments_clients_clients_id_pg_clients_id_pg_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_clients_batiments" ADD CONSTRAINT "associations_clients_batiments_batiments_id_pg_batiments_id_pg_fk" FOREIGN KEY ("batiments_id_pg") REFERENCES "public"."batiments"("id_pg") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_clients_batiments" ADD CONSTRAINT "associations_clients_batiments_clients_id_pg_clients_id_pg_fk" FOREIGN KEY ("clients_id_pg") REFERENCES "public"."clients"("id_pg") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
