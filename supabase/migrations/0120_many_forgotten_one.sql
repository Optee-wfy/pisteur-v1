CREATE INDEX IF NOT EXISTS "idx_asso_batiments_pro_batiment" ON "associations_batiments_pro" USING btree ("pro_id_pg","batiments_id_pg");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_asso_batiments_pro_label_batiment" ON "associations_batiments_pro" USING btree ("pro_id_pg","association_label","batiments_id_pg");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_personne_morale_stats_personne" ON "personne_morale_stats" USING btree ("personne_morale_id_pg");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_personne_morale_stats_nb_related_locations" ON "personne_morale_stats" USING btree ("nb_related_locations");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_batiments_bdnb_stats_batiment" ON "batiments_bdnb_stats" USING btree ("batiments_bdnb_id_pg");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_batiments_bdnb_stats_nb_legal_entities" ON "batiments_bdnb_stats" USING btree ("nb_legal_entities");