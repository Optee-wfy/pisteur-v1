ALTER TYPE "pro_subscription_enum" ADD VALUE 'Growth';--> statement-breakpoint
ALTER TYPE "pro_subscription_enum" ADD VALUE 'Pro';--> statement-breakpoint
ALTER TYPE "pro_subscription_enum" ADD VALUE 'Essentiel';--> statement-breakpoint
ALTER TABLE "batiments_bdnb" ADD COLUMN "annual_electricity_consumption" real;--> statement-breakpoint
ALTER TABLE "batiments_bdnb" ADD COLUMN "annual_electricity_cost" real;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_is_in_qpv_index" ON "batiments_bdnb" USING btree ("dans_qpv");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_sector_index" ON "batiments_bdnb" USING btree ("secteur");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_street_number_index" ON "batiments_bdnb" USING btree ("numero_de_la_rue");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_street_name_index" ON "batiments_bdnb" USING btree ("nom_de_la_rue");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_zipcode_index" ON "batiments_bdnb" USING btree ("code_postal__new_");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_city_index" ON "batiments_bdnb" USING btree ("ville");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_max_construction_period_index" ON "batiments_bdnb" USING btree ("periode_construction_max");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_nb_parking_spots_index" ON "batiments_bdnb" USING btree ("nb_lot_garpark");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_habitable_surface_index" ON "batiments_bdnb" USING btree ("s_log_hab");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_pmr_accessible_index" ON "batiments_bdnb" USING btree ("accessible_pmr");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_glazing_type_index" ON "batiments_bdnb" USING btree ("type_vitrage");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_exterior_wall_insulation_type_index" ON "batiments_bdnb" USING btree ("type_isolation_mur_exterieur");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_lower_floor_insulation_type_index" ON "batiments_bdnb" USING btree ("type_isolation_plancher_bas");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_upper_floor_insulation_type_index" ON "batiments_bdnb" USING btree ("type_isolation_plancher_haut");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_habitable_surface_area_index" ON "batiments_bdnb" USING btree ("surface_habitable_logement");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_dpe_certified_index" ON "batiments_bdnb" USING btree ("etiquette_dpe");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_inertia_class_index" ON "batiments_bdnb" USING btree ("classe_inertie");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_has_air_conditioning_index" ON "batiments_bdnb" USING btree ("presence_climatisation");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_ventilation_type_index" ON "batiments_bdnb" USING btree ("type_ventilation");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_ecs_generator_type_index" ON "batiments_bdnb" USING btree ("type_generateur_ecs");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_main_ges_class_index" ON "batiments_bdnb" USING btree ("classe_ges_principale");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_dpe_established_date_index" ON "batiments_bdnb" USING btree ("date_etablissement_dpe");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_electricity_consumption_per_square_meter_index" ON "batiments_bdnb" USING btree ("consommation_electrique_par_m2");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_greenhouse_gas_emissions_per_square_meter_index" ON "batiments_bdnb" USING btree ("emission_gaz_a_effet_de_serre_par_m2");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_pro_elec_consumption_2020_index" ON "batiments_bdnb" USING btree ("conso_pro_dle_elec_2020");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_res_elec_consumption_2020_index" ON "batiments_bdnb" USING btree ("conso_res_dle_elec_2020");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_pro_gaz_consumption_2020_index" ON "batiments_bdnb" USING btree ("conso_pro_dle_gaz_2020");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_res_gaz_consumption_2020_index" ON "batiments_bdnb" USING btree ("conso_res_dle_gaz_2020");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_annual_electricity_consumption_index" ON "batiments_bdnb" USING btree ("annual_electricity_consumption");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_annual_electricity_cost_index" ON "batiments_bdnb" USING btree ("annual_electricity_cost");