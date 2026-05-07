ALTER TABLE "personne_morale_stats" ADD COLUMN "nb_related_pros" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "batiments_bdnb_stats" ADD COLUMN "nb_related_pros" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "personne_morale_stats" ADD COLUMN "last_solicitation_date" timestamp;
ALTER TABLE "batiments_bdnb_stats" ADD COLUMN "last_solicitation_date" timestamp;
CREATE INDEX IF NOT EXISTS "idx_personne_morale_stats_nb_related_pros" ON "personne_morale_stats" USING btree ("nb_related_pros");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_batiments_bdnb_stats_nb_related_pros" ON "batiments_bdnb_stats" USING btree ("nb_related_pros");

-- Backfill for nb_related_pros + last_solicitation_date
-- INSERT INTO "personne_morale_stats" (
--   "personne_morale_id_pg",
--   "nb_related_pros",
--   "last_solicitation_date"
-- )
-- SELECT
--   apm."personne_morale_id_pg",
--   count(distinct apm."pros_id_pg") AS "nb_related_pros",
--   CURRENT_TIMESTAMP AS "last_solicitation_date"
-- FROM "associations_pros_personne_morale" apm
-- GROUP BY apm."personne_morale_id_pg"
-- ON CONFLICT ("personne_morale_id_pg")
-- DO UPDATE SET
--   "nb_related_pros" = EXCLUDED."nb_related_pros",
--   "last_solicitation_date" = EXCLUDED."last_solicitation_date";--> statement-breakpoint

-- INSERT INTO "batiments_bdnb_stats" (
--   "batiments_bdnb_id_pg",
--   "nb_related_pros",
--   "last_solicitation_date"
-- )
-- SELECT
--   b."id_pg" AS "batiments_bdnb_id_pg",
--   count(DISTINCT abep."pro_id_pg") AS "nb_related_pros",
--   CURRENT_TIMESTAMP AS "last_solicitation_date"
-- FROM "associations_batiments_externes_pro" abep
-- JOIN "batiments_bdnb" b
--   ON b."id_pg" = abep."batiments_id_pg"
-- WHERE abep."association_type_id" = 405 -- type d'association : "Débloqué"
-- GROUP BY b."id_pg"
-- ON CONFLICT ("batiments_bdnb_id_pg")
-- DO UPDATE SET
--   "nb_related_pros" = EXCLUDED."nb_related_pros",
--   "last_solicitation_date" = EXCLUDED."last_solicitation_date";
