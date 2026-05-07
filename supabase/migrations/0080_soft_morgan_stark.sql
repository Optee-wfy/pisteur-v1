CREATE TABLE IF NOT EXISTS "associations_clients_pro" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pro_id" varchar,
	"pro_id_pg" uuid,
	"client_id" varchar,
	"client_id_pg" uuid,
	"association_type_id" integer NOT NULL,
	"association_label" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "associations_batiments_pro" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pro_id" varchar,
	"batiments_id" varchar,
	"pro_id_pg" uuid,
	"batiments_id_pg" uuid,
	"association_type_id" integer NOT NULL,
	"association_label" varchar
);
--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "telephone" text;--> statement-breakpoint
ALTER TABLE "pros" ADD COLUMN "credits_abonnement_restants" real DEFAULT 0;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_clients_pro" ADD CONSTRAINT "associations_clients_pro_pro_id_pg_pros_id_pg_fk" FOREIGN KEY ("pro_id_pg") REFERENCES "public"."pros"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_clients_pro" ADD CONSTRAINT "associations_clients_pro_client_id_pg_clients_id_pg_fk" FOREIGN KEY ("client_id_pg") REFERENCES "public"."clients"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_batiments_pro" ADD CONSTRAINT "associations_batiments_pro_pro_id_pg_pros_id_pg_fk" FOREIGN KEY ("pro_id_pg") REFERENCES "public"."pros"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_batiments_pro" ADD CONSTRAINT "associations_batiments_pro_batiments_id_pg_batiments_id_pg_fk" FOREIGN KEY ("batiments_id_pg") REFERENCES "public"."batiments"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
