CREATE EXTENSION IF NOT EXISTS pg_trgm;
DROP INDEX IF EXISTS "locations_bdnb_dpe_certified_index";--> statement-breakpoint
DROP INDEX IF EXISTS "locations_bdnb_street_number_index";--> statement-breakpoint
DROP INDEX IF EXISTS "locations_bdnb_street_name_index";--> statement-breakpoint
DROP INDEX IF EXISTS "locations_bdnb_zipcode_index";--> statement-breakpoint
DROP INDEX IF EXISTS "locations_bdnb_city_index";--> statement-breakpoint
DROP INDEX IF EXISTS "locations_bdnb_exterior_wall_insulation_type_index";--> statement-breakpoint
DROP INDEX IF EXISTS "locations_bdnb_lower_floor_insulation_type_index";--> statement-breakpoint
DROP INDEX IF EXISTS "locations_bdnb_upper_floor_insulation_type_index";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_asso_bat_ext_pro_pro_location" ON "associations_batiments_externes_pro" USING btree ("pro_id_pg","batiments_id_pg");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "associations_batiments_bdnb_personne_morale_batiments_idx" ON "associations_batiments_bdnb_personne_morale" USING btree ("batiments_bdnb_id_pg");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "associations_batiments_bdnb_personne_morale_personne_idx" ON "associations_batiments_bdnb_personne_morale" USING btree ("personne_morale_id_pg");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "associations_batiments_bdnb_personne_morale_batiments_personne_idx" ON "associations_batiments_bdnb_personne_morale" USING btree ("batiments_bdnb_id_pg","personne_morale_id_pg");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "legal_entity_type" ON "personne_morale" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "legal_entity_activity_index" ON "personne_morale" USING btree ("activitePrincipale");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_dpe_label_uuid_index" ON "batiments_bdnb" USING btree ("etiquette_dpe","id_pg");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_street_number_index" ON "batiments_bdnb" USING gin ("numero_de_la_rue" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_street_name_index" ON "batiments_bdnb" USING gin ("nom_de_la_rue" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_zipcode_index" ON "batiments_bdnb" USING gin ("code_postal__new_" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_city_index" ON "batiments_bdnb" USING gin ("ville" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_exterior_wall_insulation_type_index" ON "batiments_bdnb" USING gin ("type_isolation_mur_exterieur");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_lower_floor_insulation_type_index" ON "batiments_bdnb" USING gin ("type_isolation_plancher_bas");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_upper_floor_insulation_type_index" ON "batiments_bdnb" USING gin ("type_isolation_plancher_haut");
