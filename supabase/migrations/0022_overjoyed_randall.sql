CREATE TABLE IF NOT EXISTS "associations_batiments_clients" (
  "id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "batiments_id" varchar,
  "clients_id" varchar,
  "batiments_id_pg" uuid,
  "clients_id_pg" uuid,
  "association_type_id" integer NOT NULL,
  "association_label" varchar
);
DROP TABLE IF EXISTS "associations_clients_batiments";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "associations_deal_client" (
  "id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "deal_id" varchar,
  "client_id" varchar,
  "deal_id_pg" uuid,
  "client_id_pg" uuid,
  "association_type_id" integer NOT NULL,
  "association_label" varchar
);
DROP TABLE IF EXISTS "associations_client_deal";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "associations_devis_pros" (
  "id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "devis_id" varchar,
  "pro_id" varchar,
  "devis_id_pg" uuid,
  "pro_id_pg" uuid,
  "association_type_id" integer NOT NULL,
  "association_label" varchar
);
DROP TABLE IF EXISTS "associations_pros_devis";
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "associations_batiments_clients"
ADD CONSTRAINT "associations_batiments_clients_batiments_id_pg_batiments_id_pg_fk" FOREIGN KEY ("batiments_id_pg") REFERENCES "public"."batiments"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "associations_batiments_clients"
ADD CONSTRAINT "associations_batiments_clients_clients_id_pg_clients_id_pg_fk" FOREIGN KEY ("clients_id_pg") REFERENCES "public"."clients"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "associations_deal_client"
ADD CONSTRAINT "associations_deal_client_deal_id_pg_deals_id_pg_fk" FOREIGN KEY ("deal_id_pg") REFERENCES "public"."deals"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "associations_deal_client"
ADD CONSTRAINT "associations_deal_client_client_id_pg_clients_id_pg_fk" FOREIGN KEY ("client_id_pg") REFERENCES "public"."clients"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "associations_devis_pros"
ADD CONSTRAINT "associations_devis_pros_devis_id_pg_devis_id_pg_fk" FOREIGN KEY ("devis_id_pg") REFERENCES "public"."devis"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "associations_devis_pros"
ADD CONSTRAINT "associations_devis_pros_pro_id_pg_pros_id_pg_fk" FOREIGN KEY ("pro_id_pg") REFERENCES "public"."pros"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
WHEN duplicate_object THEN null;
END $$;