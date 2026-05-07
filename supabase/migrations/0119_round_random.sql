CREATE TABLE IF NOT EXISTS "personne_morale_stats" (
	"personne_morale_id_pg" uuid PRIMARY KEY NOT NULL,
	"nb_related_locations" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "batiments_bdnb_stats" (
	"batiments_bdnb_id_pg" uuid PRIMARY KEY NOT NULL,
	"nb_legal_entities" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "personne_morale_stats" ADD CONSTRAINT "personne_morale_stats_personne_morale_id_pg_personne_morale_id_pg_fk" FOREIGN KEY ("personne_morale_id_pg") REFERENCES "public"."personne_morale"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "batiments_bdnb_stats" ADD CONSTRAINT "batiments_bdnb_stats_batiments_bdnb_id_pg_batiments_bdnb_id_pg_fk" FOREIGN KEY ("batiments_bdnb_id_pg") REFERENCES "public"."batiments_bdnb"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_asso_bat_ext_pro_pro_label_location" ON "associations_batiments_externes_pro" USING btree ("pro_id_pg","association_label","batiments_id_pg");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_asso_pro_personne_pro_legal_entity" ON "associations_pros_personne_morale" USING btree ("pros_id_pg","personne_morale_id_pg");--> statement-breakpoint

-- INSERT INTO "batiments_bdnb_stats" ("batiments_bdnb_id_pg", "nb_legal_entities")
-- SELECT
--   "associations_batiments_bdnb_personne_morale"."batiments_bdnb_id_pg",
--   count(distinct "associations_batiments_bdnb_personne_morale"."personne_morale_id_pg") AS "nb_legal_entities"
-- FROM "associations_batiments_bdnb_personne_morale"
-- GROUP BY "associations_batiments_bdnb_personne_morale"."batiments_bdnb_id_pg"
-- ON CONFLICT ("batiments_bdnb_id_pg")
-- DO UPDATE SET "nb_legal_entities" = EXCLUDED."nb_legal_entities";--> statement-breakpoint

-- INSERT INTO "personne_morale_stats" ("personne_morale_id_pg", "nb_related_locations")
-- SELECT
--   "associations_batiments_bdnb_personne_morale"."personne_morale_id_pg",
--   count(distinct "associations_batiments_bdnb_personne_morale"."batiments_bdnb_id_pg") AS "nb_related_locations"
-- FROM "associations_batiments_bdnb_personne_morale"
-- GROUP BY "associations_batiments_bdnb_personne_morale"."personne_morale_id_pg"
-- ON CONFLICT ("personne_morale_id_pg")
-- DO UPDATE SET "nb_related_locations" = EXCLUDED."nb_related_locations";
