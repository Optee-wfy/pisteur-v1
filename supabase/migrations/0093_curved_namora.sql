CREATE TABLE IF NOT EXISTS "associations_batiments_externes_pro" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pro_id" varchar,
	"batiments_id" varchar,
	"pro_id_pg" uuid,
	"batiments_id_pg" uuid,
	"association_type_id" integer NOT NULL,
	"association_label" varchar
);
--> statement-breakpoint
ALTER TABLE "personne_morale_copropriete" ADD COLUMN "horaires_ouverture" jsonb;--> statement-breakpoint
ALTER TABLE "personne_morale_copropriete" ADD COLUMN "note" real;--> statement-breakpoint
ALTER TABLE "personne_morale_copropriete" ADD COLUMN "nombre_avis" real;--> statement-breakpoint
ALTER TABLE "personne_morale_copropriete" ADD COLUMN "site_internet" text;--> statement-breakpoint
ALTER TABLE "personne_morale_copropriete" ADD COLUMN "url_itineraire_maps" text;--> statement-breakpoint
ALTER TABLE "personne_morale_copropriete" ADD COLUMN "last_fetched_at" timestamp;--> statement-breakpoint
ALTER TABLE "personne_morale" ADD COLUMN "is_unavailable" boolean DEFAULT false;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_batiments_externes_pro" ADD CONSTRAINT "associations_batiments_externes_pro_pro_id_pg_pros_id_pg_fk" FOREIGN KEY ("pro_id_pg") REFERENCES "public"."pros"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_batiments_externes_pro" ADD CONSTRAINT "associations_batiments_externes_pro_batiments_id_pg_batiments_bdnb_id_pg_fk" FOREIGN KEY ("batiments_id_pg") REFERENCES "public"."batiments_bdnb"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
