DO $$ BEGIN
 CREATE TYPE "public"."enrichment_status" AS ENUM('CREATED', 'IN_PROGRESS', 'CANCELED', 'CREDITS_INSUFFICIENT', 'FINISHED', 'RATE_LIMIT', 'UNKNOWN', 'FAKE_ENRICH');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."contact_externe_source" AS ENUM('pappers', 'hunter', 'hunter_group');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "associations_pros_contact_externe" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pro_id_pg" uuid NOT NULL,
	"contact_externe_id_pg" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "enrichissements" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"personne_morale_id_pg" uuid NOT NULL,
	"enrichissement_id" text,
	"statut" "enrichment_status" NOT NULL,
	"contacts" text[],
	"depend_de" text[],
	CONSTRAINT "enrichissements_enrichissement_id_unique" UNIQUE("enrichissement_id")
);
--> statement-breakpoint
ALTER TABLE "contact_externe" ADD COLUMN "indisponible_pour_fullenrich" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "contact_externe" ADD COLUMN "derniere_recuperation_pour_fullenrich" timestamp;--> statement-breakpoint
ALTER TABLE "contact_externe" ADD COLUMN "source" "contact_externe_source" DEFAULT 'pappers' NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_pros_contact_externe" ADD CONSTRAINT "associations_pros_contact_externe_pro_id_pg_pros_id_pg_fk" FOREIGN KEY ("pro_id_pg") REFERENCES "public"."pros"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_pros_contact_externe" ADD CONSTRAINT "associations_pros_contact_externe_contact_externe_id_pg_contact_externe_id_pg_fk" FOREIGN KEY ("contact_externe_id_pg") REFERENCES "public"."contact_externe"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "enrichissements" ADD CONSTRAINT "enrichissements_personne_morale_id_pg_personne_morale_id_pg_fk" FOREIGN KEY ("personne_morale_id_pg") REFERENCES "public"."personne_morale"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
