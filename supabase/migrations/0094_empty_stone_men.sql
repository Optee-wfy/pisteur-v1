CREATE INDEX IF NOT EXISTS "locations_bdnb_department_index" ON "batiments_bdnb" USING btree ("departement");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_dpe_label_index" ON "batiments_bdnb" USING btree ("etiquette_dpe");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_energy_type_index" ON "batiments_bdnb" USING btree ("type_d_energie");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_surface_that_requires_heating_index" ON "batiments_bdnb" USING btree ("surface_that_requires_heating");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_creation_date_index" ON "batiments_bdnb" USING btree ("annee_de_construction");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_heating_type_index" ON "batiments_bdnb" USING btree ("generateur_de_chauffage");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_surface_area_index" ON "batiments_bdnb" USING btree ("m2");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_glazing_area_index" ON "batiments_bdnb" USING btree ("glazing_area");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_height_index" ON "batiments_bdnb" USING btree ("hauteur");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_nb_storeys_index" ON "batiments_bdnb" USING btree ("nombre_d_etages");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_nb_units_index" ON "batiments_bdnb" USING btree ("nombre_de_lots");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_nb_buildings_index" ON "batiments_bdnb" USING btree ("nombre_de_batiments");
